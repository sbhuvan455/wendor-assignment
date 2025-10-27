# India Timezone Implementation Guide

This guide explains how to use the India timezone features in your slot booking system.

## Overview

The system now uses India Standard Time (IST) - Asia/Kolkata timezone for all date and time operations. This ensures consistent handling of slots and reservations regardless of the server's location.

## Key Features

### 1. TimezoneService

A centralized service that handles all timezone operations:

```typescript
// Get current India time
const currentTime = timezoneService.getCurrentIndiaDateTime();

// Parse date and time in India timezone
const slotDateTime = timezoneService.parseIndiaDateTime('2024-01-15', '14:30');

// Check if date is in the past
const isPast = timezoneService.isDateInPast('2024-01-10');

// Format datetime for display
const formatted = timezoneService.formatIndiaDateTime(
  slotDateTime,
  'YYYY-MM-DD HH:mm',
);
```

### 2. Custom Validators

Enhanced DTOs with timezone-aware validation:

```typescript
export class CreateSlotScheduleDto {
  @IsIndiaDateFormat()
  @IsNotPastDate()
  date: string;

  @IsIndiaTimeFormat()
  @IsNotPastTimeSlot()
  startTime: string;

  @IsIndiaTimeFormat()
  endTime: string;
}
```

## API Usage Examples

### Creating Slots (Provider)

```bash
POST /slot
Authorization: Bearer <provider_token>
Content-Type: application/json

{
    "date": "2024-01-20",
    "startTime": "09:00",
    "endTime": "18:00",
    "slotDurationMinutes": 60,
    "price": 500
}
```

**Response:**

```json
{
  "message": "3 slots created successfully for 2024-01-20.",
  "slots": [
    {
      "id": 1,
      "startTime": "2024-01-20T09:00:00.000Z",
      "endTime": "2024-01-20T10:00:00.000Z",
      "price": 500,
      "status": "available"
    }
  ]
}
```

### Finding Available Slots (Public)

```bash
GET /slot/available?date=2024-01-20&serviceType=Electrician
```

**Response:**

```json
[
  {
    "id": 1,
    "startTime": "2024-01-20T09:00:00.000Z",
    "endTime": "2024-01-20T10:00:00.000Z",
    "price": 500,
    "providerName": "John Electrician",
    "providerId": 1,
    "serviceType": "Electrician"
  }
]
```

### Creating Reservations (Customer)

```bash
POST /reservation
Authorization: Bearer <customer_token>
Content-Type: application/json

{
    "slotId": 1
}
```

**Response:**

```json
{
  "message": "Reservation created successfully.",
  "reservation": {
    "id": 1,
    "status": "pending",
    "bookingTime": "2024-01-15 14:30:25",
    "slot": {
      "id": 1,
      "startTime": "2024-01-20 09:00",
      "endTime": "2024-01-20 10:00",
      "price": 500,
      "provider": {
        "id": 1,
        "name": "John Electrician",
        "serviceType": "Electrician"
      }
    },
    "customer": {
      "id": 2,
      "name": "Jane Customer",
      "email": "jane@example.com"
    }
  }
}
```

### Getting Customer Reservations

```bash
GET /reservation/customer
Authorization: Bearer <customer_token>
```

### Getting Provider Reservations

```bash
GET /reservation/provider
Authorization: Bearer <provider_token>
```

### Updating Reservation Status

```bash
PUT /reservation/1/status
Authorization: Bearer <provider_token>
Content-Type: application/json

{
    "status": "confirmed"
}
```

### Canceling Reservation

```bash
PUT /reservation/1/cancel
Authorization: Bearer <customer_token>
```

## Timezone Handling

### Date Format

- All dates must be in `YYYY-MM-DD` format
- Dates are interpreted in India timezone (Asia/Kolkata)
- Past dates are automatically rejected

### Time Format

- All times must be in `HH:MM` format (24-hour)
- Times are interpreted in India timezone
- For today's date, past times are automatically rejected

### Database Storage

- All datetime values are stored in UTC in the database
- Conversion to/from India timezone happens at the application layer
- API responses show times in India timezone format

## Validation Rules

1. **Date Validation:**
   - Must be valid YYYY-MM-DD format
   - Cannot be in the past
   - Must be a valid date

2. **Time Validation:**
   - Must be valid HH:MM format (24-hour)
   - For today's date, cannot be in the past
   - End time must be after start time

3. **Slot Duration:**
   - Minimum 30 minutes
   - Maximum 240 minutes (4 hours)

4. **Price:**
   - Must be non-negative
   - Supports decimal values

## Error Handling

The system provides clear error messages for timezone-related issues:

- `Invalid date format. Use YYYY-MM-DD format.`
- `Invalid time format. Use HH:MM format.`
- `Cannot create slots for past dates.`
- `Cannot create slots for past time slots.`
- `Cannot book slots in the past.`

## Best Practices

1. **Always use the TimezoneService** for date/time operations
2. **Validate inputs** using the custom validators
3. **Handle timezone conversion** at the application layer
4. **Store UTC timestamps** in the database
5. **Display times** in India timezone for users

## Testing

When testing the API:

1. Use India timezone dates and times
2. Test past date/time rejection
3. Verify timezone conversion in responses
4. Test edge cases like midnight and end of day

## Example Test Cases

```bash
# Valid slot creation
curl -X POST http://localhost:3000/slot \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-20",
    "startTime": "09:00",
    "endTime": "18:00",
    "slotDurationMinutes": 60,
    "price": 500
  }'

# Invalid past date
curl -X POST http://localhost:3000/slot \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2023-01-01",
    "startTime": "09:00",
    "endTime": "18:00",
    "slotDurationMinutes": 60,
    "price": 500
  }'
# Returns: "Cannot create slots for past dates."
```
