import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SlotService } from './slot.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateSlotScheduleDto } from './dto/create-slot.dto';
import { setPublic } from 'src/decorators/public.decorator';
import { ServiceType } from 'generated/prisma';

@Controller('slot')
export class SlotController {
    constructor(private readonly slotService: SlotService) { }

    @Post()
    @UseGuards(AuthGuard)
    async createSlots(@Body() scheduleDto: CreateSlotScheduleDto, @Req() req) {
        const providerId = req.user.userId;

        try {
            const createdSlots = await this.slotService.generateAndCreateSlots(providerId, scheduleDto);
            return {
                message: `${createdSlots.count} slots created successfully for ${scheduleDto.date}.`,
                slots: createdSlots.slots,
            };
        } catch (error) {
            throw new HttpException('Failed to create slots. Possible overlap with existing schedule.', HttpStatus.CONFLICT);
        }
    }

    @Delete(":id")
    @UseGuards(AuthGuard)
    async deleteSlot(@Param('id', ParseIntPipe) slotId: number, @Req() req) {
        const providerId = req.user.userId;

        try {
            await this.slotService.deleteSlot(slotId, providerId);
            return { message: "Slot deleted successfully." };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Failed to delete slot.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('provider')
    @UseGuards(AuthGuard)
    async getProviderSlots(@Req() req) {
        const providerId = req.user.userId;
        return this.slotService.findSlotsByProvider(providerId);
    }

    @Get('available')
    @setPublic()
    async findAvailableSlots(
        @Query('date') date: string,
        @Query('serviceType') serviceType: ServiceType,
    ) {
        if (!date || !serviceType) {
            throw new HttpException('Both date and serviceType query parameters are required.', HttpStatus.BAD_REQUEST);
        }

        return this.slotService.findAvailableSlotsByDateAndService(date, serviceType);
    }

    @Get(':id')
    @setPublic()
    async getSlotDetails(@Param('id', ParseIntPipe) slotId: number) {
        const slot = await this.slotService.getSlotById(slotId);

        return slot;
    }
}
