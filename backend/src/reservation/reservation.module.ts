import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { PrismaService } from 'src/prisma.service';
import { TimezoneService } from 'src/common/timezone.service';

@Module({
  controllers: [ReservationController],
  providers: [ReservationService, PrismaService, TimezoneService]
})
export class ReservationModule { }
