import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from '../notification/notification.module';
import { WebhookModule } from '../webhook/webhook.module';
import { CommerceController } from './commerce.controller';
import { CommerceManager } from './commerce.manager';
import { CommerceRepository } from './commerce.repository';
import { CommerceService } from './commerce.service';
import { TossPaymentService } from './toss-payment.service';

@Module({
  imports: [JwtModule.register({}), NotificationModule, WebhookModule],
  controllers: [CommerceController],
  providers: [
    CommerceService,
    CommerceRepository,
    CommerceManager,
    TossPaymentService,
  ],
  exports: [CommerceService],
})
export class CommerceModule {}
