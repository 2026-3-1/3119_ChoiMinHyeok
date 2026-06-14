import { Module } from '@nestjs/common';
import { NotificationModule } from '../notification/notification.module';
import { SchedulerRepository } from './scheduler.repository';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [NotificationModule],
  providers: [SchedulerService, SchedulerRepository],
})
export class SchedulerModule {}
