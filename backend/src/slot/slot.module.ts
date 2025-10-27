import { Module } from '@nestjs/common';
import { SlotController } from './slot.controller';
import { SlotService } from './slot.service';
import { PrismaService } from 'src/prisma.service';
import { TimezoneService } from 'src/common/timezone.service';

@Module({
  controllers: [SlotController],
  providers: [SlotService, PrismaService, TimezoneService],
})
export class SlotModule { }
