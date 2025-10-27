import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

// Extend dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class TimezoneService {
    private readonly INDIA_TIMEZONE = 'Asia/Kolkata';
    private readonly DATE_FORMAT = 'YYYY-MM-DD';
    private readonly TIME_FORMAT = 'HH:mm';
    private readonly DATETIME_FORMAT = 'YYYY-MM-DD HH:mm';

    /**
     * Get current date and time in India timezone
     */
    getCurrentIndiaDateTime(): dayjs.Dayjs {
        return dayjs().tz(this.INDIA_TIMEZONE);
    }

    /**
     * Get current date in India timezone (YYYY-MM-DD format)
     */
    getCurrentIndiaDate(): string {
        return this.getCurrentIndiaDateTime().format(this.DATE_FORMAT);
    }

    /**
     * Get current time in India timezone (HH:mm format)
     */
    getCurrentIndiaTime(): string {
        return this.getCurrentIndiaDateTime().format(this.TIME_FORMAT);
    }

    /**
     * Convert a date string to India timezone dayjs object
     * @param dateString - Date in YYYY-MM-DD format
     */
    parseIndiaDate(dateString: string): dayjs.Dayjs {
        return dayjs.tz(dateString, this.DATE_FORMAT, this.INDIA_TIMEZONE);
    }

    /**
     * Convert a time string to India timezone dayjs object for today
     * @param timeString - Time in HH:mm format
     */
    parseIndiaTime(timeString: string): dayjs.Dayjs {
        const today = this.getCurrentIndiaDate();
        return dayjs.tz(`${today} ${timeString}`, this.DATETIME_FORMAT, this.INDIA_TIMEZONE);
    }

    /**
     * Convert date and time strings to India timezone dayjs object
     * @param dateString - Date in YYYY-MM-DD format
     * @param timeString - Time in HH:mm format
     */
    parseIndiaDateTime(dateString: string, timeString: string): dayjs.Dayjs {
        return dayjs.tz(`${dateString} ${timeString}`, this.DATETIME_FORMAT, this.INDIA_TIMEZONE);
    }

    /**
     * Convert a dayjs object to India timezone
     * @param dateTime - dayjs object
     */
    toIndiaTimezone(dateTime: dayjs.Dayjs): dayjs.Dayjs {
        return dateTime.tz(this.INDIA_TIMEZONE);
    }

    /**
     * Convert a Date object to India timezone dayjs object
     * @param date - Date object
     */
    dateToIndiaTimezone(date: Date): dayjs.Dayjs {
        return dayjs(date).tz(this.INDIA_TIMEZONE);
    }

    /**
     * Get start of day in India timezone
     * @param dateString - Date in YYYY-MM-DD format
     */
    getStartOfDayIndia(dateString: string): dayjs.Dayjs {
        return this.parseIndiaDate(dateString).startOf('day');
    }

    /**
     * Get end of day in India timezone
     * @param dateString - Date in YYYY-MM-DD format
     */
    getEndOfDayIndia(dateString: string): dayjs.Dayjs {
        return this.parseIndiaDate(dateString).endOf('day');
    }

    /**
     * Check if a date is in the past (compared to current India time)
     * @param dateString - Date in YYYY-MM-DD format
     */
    isDateInPast(dateString: string): boolean {
        const inputDate = this.parseIndiaDate(dateString);
        const currentDate = this.getCurrentIndiaDateTime().startOf('day');
        return inputDate.isBefore(currentDate);
    }

    /**
     * Check if a date is today (in India timezone)
     * @param dateString - Date in YYYY-MM-DD format
     */
    isDateToday(dateString: string): boolean {
        const inputDate = this.parseIndiaDate(dateString);
        const today = this.getCurrentIndiaDateTime().startOf('day');
        return inputDate.isSame(today, 'day');
    }

    /**
     * Check if a time slot is in the past (for today's date)
     * @param dateString - Date in YYYY-MM-DD format
     * @param timeString - Time in HH:mm format
     */
    isTimeSlotInPast(dateString: string, timeString: string): boolean {
        const slotDateTime = this.parseIndiaDateTime(dateString, timeString);
        const currentDateTime = this.getCurrentIndiaDateTime();
        return slotDateTime.isBefore(currentDateTime);
    }

    /**
     * Format a dayjs object to India timezone string
     * @param dateTime - dayjs object
     * @param format - Format string (default: YYYY-MM-DD HH:mm)
     */
    formatIndiaDateTime(dateTime: dayjs.Dayjs, format: string = this.DATETIME_FORMAT): string {
        return this.toIndiaTimezone(dateTime).format(format);
    }

    /**
     * Get timezone offset for India
     */
    getIndiaTimezoneOffset(): string {
        return this.getCurrentIndiaDateTime().format('Z');
    }

    /**
     * Validate if a date string is valid
     * @param dateString - Date in YYYY-MM-DD format
     */
    isValidDate(dateString: string): boolean {
        return this.parseIndiaDate(dateString).isValid();
    }

    /**
     * Validate if a time string is valid
     * @param timeString - Time in HH:mm format
     */
    isValidTime(timeString: string): boolean {
        return this.parseIndiaTime(timeString).isValid();
    }

    /**
     * Get available time slots for a given date range
     * @param startDate - Start date in YYYY-MM-DD format
     * @param endDate - End date in YYYY-MM-DD format
     * @param slotDurationMinutes - Duration of each slot in minutes
     */
    generateTimeSlots(
        startDate: string,
        endDate: string,
        slotDurationMinutes: number
    ): Array<{ date: string; startTime: string; endTime: string }> {
        const slots: Array<{ date: string; startTime: string; endTime: string }> = [];
        let currentDate = this.parseIndiaDate(startDate);
        const endDateObj = this.parseIndiaDate(endDate);

        while (currentDate.isSame(endDateObj, 'day') || currentDate.isBefore(endDateObj, 'day')) {
            const dateString = currentDate.format(this.DATE_FORMAT);

            // Generate slots for the day (9 AM to 6 PM)
            let currentTime = currentDate.hour(9).minute(0);
            const endTime = currentDate.hour(18).minute(0);

            while (currentTime.isBefore(endTime)) {
                const slotEndTime = currentTime.add(slotDurationMinutes, 'minute');

                if (slotEndTime.isAfter(endTime)) break;

                slots.push({
                    date: dateString,
                    startTime: currentTime.format(this.TIME_FORMAT),
                    endTime: slotEndTime.format(this.TIME_FORMAT),
                });

                currentTime = slotEndTime;
            }

            currentDate = currentDate.add(1, 'day');
        }

        return slots;
    }
}
