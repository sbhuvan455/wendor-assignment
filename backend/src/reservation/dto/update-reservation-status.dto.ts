import { IsNotEmpty, IsEnum } from 'class-validator';
import { ReservationStatus } from 'generated/prisma';

export class UpdateReservationStatusDto {
    @IsNotEmpty()
    @IsEnum(ReservationStatus, {
        message: 'Status must be one of: pending, confirmed, cancelled.'
    })
    status: ReservationStatus;
}
