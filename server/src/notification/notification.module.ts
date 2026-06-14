import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { EmailService } from './email.service';
import { NotificationService } from './notification.service';

@Module({
  providers: [NotificationService, EmailService, DiscordService],
  exports: [NotificationService, DiscordService],
})
export class NotificationModule {}
