import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { WebhookRepository } from './webhook.repository';

export type WebhookEvent =
  | 'order.completed'
  | 'order.canceled'
  | 'course.canceled'
  | 'enrollment.created';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly webhookRepository: WebhookRepository) {}

  async dispatch(
    event: WebhookEvent,
    payload: Record<string, unknown>,
  ): Promise<void> {
    let endpoints: { url: string; secret: string }[];
    try {
      endpoints = await this.webhookRepository.findActiveEndpoints(event);
    } catch (err) {
      this.logger.warn(
        `Webhook 엔드포인트 조회 실패 (테이블 미존재 가능) [${event}]`,
        err,
      );
      return;
    }

    if (endpoints.length === 0) return;

    const body = JSON.stringify({
      event,
      payload,
      timestamp: new Date().toISOString(),
    });

    await Promise.allSettled(
      endpoints.map((ep) => this.send(ep.url, ep.secret, body, event)),
    );
  }

  private async send(
    url: string,
    secret: string,
    body: string,
    event: string,
  ): Promise<void> {
    const signature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
          'X-Webhook-Signature': `sha256=${signature}`,
        },
        body,
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        this.logger.warn(
          `Webhook 전송 실패 [${event}] → ${url} (${res.status})`,
        );
      } else {
        this.logger.log(`Webhook 전송 완료 [${event}] → ${url}`);
      }
    } catch (err) {
      this.logger.error(`Webhook 전송 오류 [${event}] → ${url}`, err);
    }
  }

  async registerEndpoint(url: string, event: WebhookEvent) {
    const secret = crypto.randomBytes(32).toString('hex');
    const endpoint = await this.webhookRepository.create({
      url,
      event,
      secret,
    });
    return { ...endpoint, secret };
  }

  async removeEndpoint(id: number) {
    return this.webhookRepository.delete(id);
  }

  async listEndpoints() {
    try {
      const endpoints = await this.webhookRepository.findAll();
      return endpoints.map(({ secret: _secret, ...rest }) => rest);
    } catch (err) {
      this.logger.warn(
        'Webhook 엔드포인트 조회 실패 (테이블 미존재 가능)',
        err,
      );
      return [];
    }
  }
}
