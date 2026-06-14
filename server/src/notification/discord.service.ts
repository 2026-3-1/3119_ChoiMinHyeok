import { Injectable, Logger } from '@nestjs/common';
import { withRetry } from '../global/retry.util';

export interface AdminAlertData {
  title: string;
  color: number;
  fields: { name: string; value: string; inline?: boolean }[];
}

export interface PurchaseDiscordData {
  userName: string;
  userEmail: string;
  orderNumber: string;
  courses: { title: string; price: number }[];
  totalAmount: number;
}

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);
  private readonly webhookUrl: string | undefined;

  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!this.webhookUrl) {
      this.logger.warn(
        'DISCORD_WEBHOOK_URL이 설정되지 않아 디스코드 알림이 비활성화됩니다.',
      );
    }
  }

  async sendAdminAlert(data: AdminAlertData): Promise<void> {
    if (!this.webhookUrl) return;
    const payload = {
      username: '강의 플랫폼',
      embeds: [
        {
          ...data,
          timestamp: new Date().toISOString(),
          footer: { text: '강의 플랫폼 운영 알림' },
        },
      ],
    };
    try {
      await withRetry(
        async () => {
          const res = await fetch(this.webhookUrl!, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        },
        { maxAttempts: 3, baseDelayMs: 500 },
      );
    } catch (err) {
      this.logger.error('디스코드 전송 최종 실패 (3회 시도)', err);
    }
  }

  async sendPurchaseNotification(data: PurchaseDiscordData): Promise<void> {
    if (!this.webhookUrl) return;

    const courseList = data.courses
      .map(
        (c) =>
          `• **${c.title}** — ${c.price === 0 ? '무료' : `${c.price.toLocaleString()}원`}`,
      )
      .join('\n');

    const payload = {
      username: '강의 플랫폼',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/1995/1995574.png',
      embeds: [
        {
          title: '🛒 새 구매가 완료되었습니다!',
          color: 0x4f46e5,
          fields: [
            {
              name: '👤 구매자',
              value: `${data.userName} (${data.userEmail})`,
              inline: true,
            },
            {
              name: '🧾 주문번호',
              value: `\`${data.orderNumber}\``,
              inline: true,
            },
            {
              name: `📚 구매 강의 (${data.courses.length}개)`,
              value: courseList,
              inline: false,
            },
            {
              name: '💰 결제 금액',
              value:
                data.totalAmount === 0
                  ? '무료'
                  : `**${data.totalAmount.toLocaleString()}원**`,
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: '강의 플랫폼 결제 알림' },
        },
      ],
    };

    try {
      await withRetry(
        async () => {
          const res = await fetch(this.webhookUrl!, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        },
        { maxAttempts: 3, baseDelayMs: 500 },
      );
      this.logger.log(`디스코드 알림 전송 완료 (주문: ${data.orderNumber})`);
    } catch (err) {
      this.logger.error('디스코드 전송 최종 실패 (3회 시도)', err);
    }
  }
}
