import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { IsIndiaDateFormat, IsIndiaTimeFormat, IsNotPastDate, IsNotPastTimeSlot } from 'src/common/validators/timezone.validators';

export class CreateSlotScheduleDto {

    @IsNotEmpty()
    @IsIndiaDateFormat({ message: 'Date must be a valid YYYY-MM-DD string in India timezone.' })
    @IsNotPastDate({ message: 'Date cannot be in the past.' })
    date: string;

    @IsNotEmpty()
    @IsIndiaTimeFormat({ message: 'Start time must be in HH:MM format (e.g., 09:00).' })
    @IsNotPastTimeSlot({ message: 'Start time cannot be in the past for today\'s date.' })
    startTime: string;

    @IsNotEmpty()
    @IsIndiaTimeFormat({ message: 'End time must be in HH:MM format (e.g., 18:00).' })
    endTime: string;


    @Type(() => Number)
    @IsNumber()
    @Min(30, { message: 'Slot duration must be at least 30 minutes.' })
    @Max(240, { message: 'Slot duration cannot exceed 240 minutes (4 hours).' })
    slotDurationMinutes: number;


    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0, { message: 'Price cannot be negative.' })
    price: number;
}
