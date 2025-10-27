import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { TimezoneService } from '../timezone.service';

/**
 * Custom validator for India timezone date format (YYYY-MM-DD)
 */
export function IsIndiaDateFormat(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isIndiaDateFormat',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'string') {
                        return false;
                    }

                    const timezoneService = new TimezoneService();
                    return timezoneService.isValidDate(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return 'Date must be in YYYY-MM-DD format and valid in India timezone.';
                }
            }
        });
    };
}

/**
 * Custom validator for India timezone time format (HH:MM)
 */
export function IsIndiaTimeFormat(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isIndiaTimeFormat',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'string') {
                        return false;
                    }

                    const timezoneService = new TimezoneService();
                    return timezoneService.isValidTime(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return 'Time must be in HH:MM format and valid in India timezone.';
                }
            }
        });
    };
}

/**
 * Custom validator to check if date is not in the past (India timezone)
 */
export function IsNotPastDate(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isNotPastDate',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'string') {
                        return false;
                    }

                    const timezoneService = new TimezoneService();
                    return !timezoneService.isDateInPast(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return 'Date cannot be in the past.';
                }
            }
        });
    };
}

/**
 * Custom validator to check if time slot is not in the past for today's date
 */
export function IsNotPastTimeSlot(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isNotPastTimeSlot',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'string') {
                        return false;
                    }

                    const timezoneService = new TimezoneService();
                    const obj = args.object as any;

                    // If date is today, check if time is not in the past
                    if (timezoneService.isDateToday(obj.date)) {
                        return !timezoneService.isTimeSlotInPast(obj.date, value);
                    }

                    return true; // If not today, time is valid
                },
                defaultMessage(args: ValidationArguments) {
                    return 'Time slot cannot be in the past for today\'s date.';
                }
            }
        });
    };
}
