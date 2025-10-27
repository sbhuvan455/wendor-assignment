import { HttpException, HttpStatus, Injectable, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateSlotScheduleDto } from './dto/create-slot.dto';
import { TimezoneService } from 'src/common/timezone.service';
import { ReservationStatus, ServiceType, Slot, SlotStatus } from 'generated/prisma';

@Injectable()
export class SlotService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly timezoneService: TimezoneService
    ) { }

    async generateAndCreateSlots(providerId: number, scheduleDto: CreateSlotScheduleDto) {
        const { date, startTime, endTime, slotDurationMinutes, price } = scheduleDto;

        const user = await this.prisma.user.findUnique({ where: { id: providerId } });
        if (!user) throw new NotAcceptableException('Invalid provider ID.');

        if (user.role !== 'provider') throw new NotAcceptableException('User is not a provider.');

        // Validate date and time using timezone service
        if (!this.timezoneService.isValidDate(date)) {
            throw new NotAcceptableException('Invalid date format. Use YYYY-MM-DD format.');
        }

        if (!this.timezoneService.isValidTime(startTime) || !this.timezoneService.isValidTime(endTime)) {
            throw new NotAcceptableException('Invalid time format. Use HH:MM format.');
        }

        // Check if the date is in the past
        if (this.timezoneService.isDateInPast(date)) {
            throw new NotAcceptableException('Cannot create slots for past dates.');
        }

        // Parse dates and times in India timezone
        let currentSlotStart = this.timezoneService.parseIndiaDateTime(date, startTime);
        const scheduleEnd = this.timezoneService.parseIndiaDateTime(date, endTime);

        if (scheduleEnd.isBefore(currentSlotStart)) {
            throw new NotAcceptableException('End time must be after start time.');
        }

        // Check if the time slot is in the past (for today's date)
        if (this.timezoneService.isDateToday(date) && this.timezoneService.isTimeSlotInPast(date, startTime)) {
            throw new NotAcceptableException('Cannot create slots for past time slots.');
        }

        const slotsToCreate: Omit<Slot, 'id' | 'status'>[] = [];

        while (currentSlotStart.isBefore(scheduleEnd)) {
            const currentSlotEnd = currentSlotStart.add(slotDurationMinutes, 'minute');

            if (currentSlotEnd.isAfter(scheduleEnd)) break;

            slotsToCreate.push({
                providerId: providerId,
                startTime: currentSlotStart.toDate(),
                endTime: currentSlotEnd.toDate(),
                price: price,
            });

            currentSlotStart = currentSlotEnd;
        }

        if (slotsToCreate.length === 0) throw new NotAcceptableException('No slots could be created with the provided parameters.');

        const result = await this.prisma.slot.createMany({
            data: slotsToCreate.map(slot => ({
                ...slot,
                price: slot.price,
            })),
            skipDuplicates: true,
        })

        const createdSlots = await this.prisma.slot.findMany({
            where: {
                providerId: providerId,
                startTime: {
                    gte: this.timezoneService.parseIndiaDateTime(date, startTime).toDate(),
                    lt: scheduleEnd.toDate(),
                },
            },
            orderBy: {
                startTime: 'asc',
            },
        });

        return {
            count: result.count,
            slots: createdSlots,
        };
    }

    async deleteSlot(slotId: number, providerId: number) {
        const slot = await this.prisma.slot.findUnique({
            where: { id: slotId },
            include: { reservation: true }
        })

        if (!slot || slot.providerId !== providerId) throw new UnauthorizedException("Slot not found or you do not have permission to delete it.")

        if (slot.reservation && slot.reservation.status !== ReservationStatus.cancelled) throw new HttpException('Cannot delete slot: It has an active or pending reservation.', HttpStatus.BAD_REQUEST);

        if (slot.reservation) await this.prisma.reservation.delete({ where: { slotId } })

        await this.prisma.slot.delete({ where: { id: slotId } });
    }

    async findSlotsByProvider(providerId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: providerId },
        })

        if (!user) throw new NotFoundException("No user available");
        if (user.role !== "provider") throw new HttpException("User is not a provider", HttpStatus.BAD_REQUEST);

        const slots = this.prisma.slot.findMany({
            where: { providerId },
            include: {
                reservation: true
            },
            orderBy: {
                startTime: 'asc'
            }
        })

        return slots;
    }

    async findAvailableSlotsByDateAndService(
        date: string,
        serviceType: ServiceType
    ) {        // Validate date format
        if (!this.timezoneService.isValidDate(date)) {
            throw new NotAcceptableException('Invalid date format. Use YYYY-MM-DD format.');
        }

        // Check if date is in the past
        if (this.timezoneService.isDateInPast(date)) {
            throw new NotAcceptableException('Cannot search for slots in past dates.');
        }

        const startOfDay = this.timezoneService.getStartOfDayIndia(date).toDate();
        const endOfDay = this.timezoneService.getEndOfDayIndia(date).toDate();

        const potentialSlots = await this.prisma.slot.findMany({
            where: {
                provider: {
                    serviceType: serviceType,
                },
                startTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: SlotStatus.available,
            },
            include: {
                provider: {
                    select: { id: true, name: true, serviceType: true }
                },
                reservation: {
                    select: { status: true, id: true }
                }
            },
            orderBy: { startTime: 'asc' },
        });

        const availableSlots = potentialSlots.filter(slot => {
            if (!slot.reservation) {
                return true;
            }

            return slot.reservation.status === ReservationStatus.cancelled;
        });

        return availableSlots.map(slot => ({
            id: slot.id,
            // Format to India timezone for response clarity
            startTime: this.timezoneService.formatIndiaDateTime(
                this.timezoneService.dateToIndiaTimezone(slot.startTime),
                'YYYY-MM-DD HH:mm'
            ),
            endTime: this.timezoneService.formatIndiaDateTime(
                this.timezoneService.dateToIndiaTimezone(slot.endTime),
                'YYYY-MM-DD HH:mm'
            ),
            price: slot.price,
            providerName: slot.provider.name,
            providerId: slot.providerId,
            serviceType: slot.provider.serviceType,
        }));
    }

    async getSlotById(slotId: number) {
        // Fetch the slot, including its provider details and any existing reservation
        const slot = await this.prisma.slot.findUnique({
            where: { id: slotId },
            include: {
                provider: {
                    select: { id: true, name: true, serviceType: true }
                },
                reservation: {
                    select: { status: true, id: true }
                }
            },
        });

        if (!slot) {
            throw new NotFoundException("Slot not found.");
        }

        const isCurrentlyBooked = slot.reservation && slot.reservation.status !== ReservationStatus.cancelled;

        if (slot.status !== SlotStatus.available || isCurrentlyBooked) {
            throw new HttpException("Slot is already booked or unavailable.", HttpStatus.FORBIDDEN);
        }

        return {
            id: slot.id,
            startTime: this.timezoneService.formatIndiaDateTime(
                this.timezoneService.dateToIndiaTimezone(slot.startTime),
                'YYYY-MM-DD HH:mm'
            ),
            endTime: this.timezoneService.formatIndiaDateTime(
                this.timezoneService.dateToIndiaTimezone(slot.endTime),
                'YYYY-MM-DD HH:mm'
            ),
            price: slot.price,
            providerName: slot.provider.name,
            providerId: slot.providerId,
            serviceType: slot.provider.serviceType,
        };
    }
}
