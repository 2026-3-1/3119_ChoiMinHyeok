import { Injectable } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { EmailService } from './email.service';

export interface PurchaseNotificationData {
  userName: string;
  userEmail: string;
  orderNumber: string;
  courses: { title: string; price: number }[];
  totalAmount: number;
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly discordService: DiscordService,
  ) {}

  async notifyPurchaseComplete(data: PurchaseNotificationData): Promise<void> {
    // 두 알림을 병렬로 전송 — 하나가 실패해도 다른 하나에 영향 없음
    await Promise.allSettled([
      this.emailService.sendPurchaseConfirmation(data),
      this.discordService.sendPurchaseNotification(data),
    ]);
  }
}
