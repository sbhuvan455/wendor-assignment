import { Injectable, HttpException, HttpStatus, NotFoundException, NotAcceptableException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TimezoneService } from 'src/common/timezone.service';
import { ReservationStatus, SlotStatus } from 'generated/prisma';

@Injectable()
export class ReservationService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly timezoneService: TimezoneService
    ) { }


    async createReservation(slotId: number, customerId: number) {
        // Check if slot exists and is available
        const slot = await this.prisma.slot.findUnique({
            where: { id: slotId },
            include: {
                reservation: true,
                provider: {
                    select: { id: true, name: true, serviceType: true }
                }
            }
        });

        if (!slot) {
            throw new NotFoundException('Slot not found.');
        }

        if (slot.status !== SlotStatus.available) {
            throw new NotAcceptableException('Slot is not available for booking.');
        }

        if (slot.reservation && slot.reservation.status !== ReservationStatus.cancelled) {
            throw new NotAcceptableException('Slot is already booked.');
        }

        // Check if the slot is in the past
        const slotStartTime = this.timezoneService.dateToIndiaTimezone(slot.startTime);

        if (slotStartTime.isBefore(this.timezoneService.getCurrentIndiaDateTime())) {
            throw new NotAcceptableException('Cannot book slots in the past.');
        }

        // Check if customer exists
        const customer = await this.prisma.user.findUnique({
            where: { id: customerId }
        });

        if (!customer) {
            throw new NotFoundException('Customer not found.');
        }

        if (customer.role !== 'customer') {
            throw new NotAcceptableException('User is not a customer.');
        }

        // Create reservation
        const reservation = await this.prisma.reservation.create({
            data: {
                slotId: slotId,
                customerId: customerId,
                status: ReservationStatus.confirmed,
                bookingTime: this.timezoneService.getCurrentIndiaDateTime().toDate(),
            },
            include: {
                slot: {
                    include: {
                        provider: {
                            select: { id: true, name: true, serviceType: true }
                        }
                    }
                },
                customer: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        // Update slot status to booked
        await this.prisma.slot.update({
            where: { id: slotId },
            data: { status: SlotStatus.booked }
        });

        return {
            message: 'Reservation created successfully.',
            reservation: {
                id: reservation.id,
                status: reservation.status,
                bookingTime: this.timezoneService.formatIndiaDateTime(
                    this.timezoneService.dateToIndiaTimezone(reservation.bookingTime),
                    'YYYY-MM-DD HH:mm:ss'
                ),
                slot: {
                    id: reservation.slot.id,
                    startTime: this.timezoneService.formatIndiaDateTime(
                        this.timezoneService.dateToIndiaTimezone(reservation.slot.startTime),
                        'YYYY-MM-DD HH:mm'
                    ),
                    endTime: this.timezoneService.formatIndiaDateTime(
                        this.timezoneService.dateToIndiaTimezone(reservation.slot.endTime),
                        'YYYY-MM-DD HH:mm'
                    ),
                    price: reservation.slot.price,
                    provider: reservation.slot.provider
                },
                customer: reservation.customer
            }
        };
    }


    async getCustomerReservations(customerId: number) {
        const customer = await this.prisma.user.findUnique({
            where: { id: customerId }
        });

        if (!customer) {
            throw new NotFoundException('Customer not found.');
        }

        if (customer.role !== 'customer') {
            throw new NotAcceptableException('User is not a customer.');
        }

        const reservations = await this.prisma.reservation.findMany({
            where: { customerId },
            include: {
                slot: {
                    include: {
                        provider: {
                            select: { id: true, name: true, serviceType: true }
                        }
                    }
                }
            },
            orderBy: { bookingTime: 'desc' }
        });

        return reservations.map(reservation => ({
            id: reservation.id,
            status: reservation.status,
            bookingTime: this.timezoneService.formatIndiaDateTime(
                this.timezoneService.dateToIndiaTimezone(reservation.bookingTime),
                'YYYY-MM-DD HH:mm:ss'
            ),
            slot: {
                id: reservation.slot.id,
                startTime: this.timezoneService.formatIndiaDateTime(
                    this.timezoneService.dateToIndiaTimezone(reservation.slot.startTime),
                    'YYYY-MM-DD HH:mm'
                ),
                endTime: this.timezoneService.formatIndiaDateTime(
                    this.timezoneService.dateToIndiaTimezone(reservation.slot.endTime),
                    'YYYY-MM-DD HH:mm'
                ),
                price: reservation.slot.price,
                provider: reservation.slot.provider
            }
        }));
    }

    async getProviderReservations(providerId: number) {
        const provider = await this.prisma.user.findUnique({
            where: { id: providerId }
        });

        if (!provider) {
            throw new NotFoundException('Provider not found.');
        }

        if (provider.role !== 'provider') {
            throw new NotAcceptableException('User is not a provider.');
        }

        const reservations = await this.prisma.reservation.findMany({
            where: {
                slot: {
                    providerId: providerId
                }
            },
            include: {
                slot: {
                    include: {
                        provider: {
                            select: { id: true, name: true, serviceType: true }
                        }
                    }
                },
                customer: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { bookingTime: 'desc' }
        });

        return reservations.map(reservation => ({
            id: reservation.id,
            status: reservation.status,
            bookingTime: this.timezoneService.formatIndiaDateTime(
                this.timezoneService.dateToIndiaTimezone(reservation.bookingTime),
                'YYYY-MM-DD HH:mm:ss'
            ),
            slot: {
                id: reservation.slot.id,
                startTime: this.timezoneService.formatIndiaDateTime(
                    this.timezoneService.dateToIndiaTimezone(reservation.slot.startTime),
                    'YYYY-MM-DD HH:mm'
                ),
                endTime: this.timezoneService.formatIndiaDateTime(
                    this.timezoneService.dateToIndiaTimezone(reservation.slot.endTime),
                    'YYYY-MM-DD HH:mm'
                ),
                price: reservation.slot.price,
                provider: reservation.slot.provider
            },
            customer: reservation.customer
        }));
    }


    async updateReservationStatus(reservationId: number, status: ReservationStatus, userId: number, userRole: string) {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
                slot: true,
                customer: true
            }
        });

        if (!reservation) {
            throw new NotFoundException('Reservation not found.');
        }

        // Check permissions
        if (userRole === 'customer' && reservation.customerId !== userId) {
            throw new UnauthorizedException('You can only update your own reservations.');
        }

        if (userRole === 'provider' && reservation.slot.providerId !== userId) {
            throw new UnauthorizedException('You can only update reservations for your slots.');
        }

        // Update reservation status
        const updatedReservation = await this.prisma.reservation.update({
            where: { id: reservationId },
            data: { status },
            include: {
                slot: {
                    include: {
                        provider: {
                            select: { id: true, name: true, serviceType: true }
                        }
                    }
                },
                customer: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        // If reservation is cancelled, make the slot available again
        if (status === ReservationStatus.cancelled) {
            await this.prisma.slot.update({
                where: { id: reservation.slotId },
                data: { status: SlotStatus.available }
            });
        }

        return {
            message: `Reservation ${status} successfully.`,
            reservation: {
                id: updatedReservation.id,
                status: updatedReservation.status,
                bookingTime: this.timezoneService.formatIndiaDateTime(
                    this.timezoneService.dateToIndiaTimezone(updatedReservation.bookingTime),
                    'YYYY-MM-DD HH:mm:ss'
                ),
                slot: {
                    id: updatedReservation.slot.id,
                    startTime: this.timezoneService.formatIndiaDateTime(
                        this.timezoneService.dateToIndiaTimezone(updatedReservation.slot.startTime),
                        'YYYY-MM-DD HH:mm'
                    ),
                    endTime: this.timezoneService.formatIndiaDateTime(
                        this.timezoneService.dateToIndiaTimezone(updatedReservation.slot.endTime),
                        'YYYY-MM-DD HH:mm'
                    ),
                    price: updatedReservation.slot.price,
                    provider: updatedReservation.slot.provider
                },
                customer: updatedReservation.customer
            }
        };
    }


    async cancelReservation(reservationId: number, customerId: number) {
        return this.updateReservationStatus(reservationId, ReservationStatus.cancelled, customerId, 'customer');
    }


    async confirmReservation(reservationId: number, providerId: number) {
        return this.updateReservationStatus(reservationId, ReservationStatus.confirmed, providerId, 'provider');
    }
}
