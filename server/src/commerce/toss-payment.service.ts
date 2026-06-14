import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';

export interface TossPaymentResult {
  paymentKey: string;
  orderId: string;
  method: string;
  totalAmount: number;
  status: string;
  approvedAt: string;
}

@Injectable()
export class TossPaymentService {
  private readonly logger = new Logger(TossPaymentService.name);
  private readonly confirmUrl =
    'https://api.tosspayments.com/v1/payments/confirm';

  private get secretKey(): string {
    return process.env.TOSS_SECRET_KEY ?? '';
  }

  async confirmPayment(
    paymentKey: string,
    orderId: string,
    amount: number,
  ): Promise<TossPaymentResult> {
    const secretKey = this.secretKey;
    if (!secretKey) {
      throw new BadRequestException('결제 서비스가 설정되지 않았습니다.');
    }

    const encoded = Buffer.from(`${secretKey}:`).toString('base64');

    const res = await fetch(this.confirmUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encoded}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      this.logger.error('Toss 결제 확인 실패', { status: res.status, body });
      throw new BadGatewayException(
        `결제 확인 실패: ${body.message ?? '토스페이먼츠 오류'}`,
      );
    }

    return res.json() as Promise<TossPaymentResult>;
  }
}
