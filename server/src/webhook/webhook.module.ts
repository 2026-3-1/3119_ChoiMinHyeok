import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WebhookController } from './webhook.controller';
import { WebhookRepository } from './webhook.repository';
import { WebhookService } from './webhook.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [WebhookController],
  providers: [WebhookService, WebhookRepository],
  exports: [WebhookService],
})
export class WebhookModule {}
