import { Body, Controller, Get, Post, Put, Param, ParseIntPipe, Query, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';

@Controller('reservation')
export class ReservationController {
    constructor(private readonly reservationService: ReservationService) { }

    @Post()
    @UseGuards(AuthGuard)
    async createReservation(@Body() createReservationDto: CreateReservationDto, @Req() req) {
        const customerId = req.user.userId;
        const { slotId } = createReservationDto;

        try {
            return await this.reservationService.createReservation(slotId, customerId);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Failed to create reservation.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('customer')
    @UseGuards(AuthGuard)
    async getCustomerReservations(@Req() req) {
        const customerId = req.user.userId;
        return await this.reservationService.getCustomerReservations(customerId);
    }

    @Get('provider')
    @UseGuards(AuthGuard)
    async getProviderReservations(@Req() req) {
        const providerId = req.user.userId;
        return await this.reservationService.getProviderReservations(providerId);
    }

    @Put(':id/status')
    @UseGuards(AuthGuard)
    async updateReservationStatus(
        @Param('id', ParseIntPipe) reservationId: number,
        @Body() updateStatusDto: UpdateReservationStatusDto,
        @Req() req
    ) {
        const userId = req.user.userId;
        const userRole = req.user.role;
        const { status } = updateStatusDto;

        try {
            return await this.reservationService.updateReservationStatus(reservationId, status, userId, userRole);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Failed to update reservation status.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put(':id/cancel')
    @UseGuards(AuthGuard)
    async cancelReservation(@Param('id', ParseIntPipe) reservationId: number, @Req() req) {
        const customerId = req.user.userId;

        try {
            return await this.reservationService.cancelReservation(reservationId, customerId);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Failed to cancel reservation.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put(':id/confirm')
    @UseGuards(AuthGuard)
    async confirmReservation(@Param('id', ParseIntPipe) reservationId: number, @Req() req) {
        const providerId = req.user.userId;

        try {
            return await this.reservationService.confirmReservation(reservationId, providerId);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Failed to confirm reservation.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
