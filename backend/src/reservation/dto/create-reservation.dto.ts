import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservationDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    @Min(1, { message: 'Slot ID must be a positive number.' })
    slotId: number;
}
