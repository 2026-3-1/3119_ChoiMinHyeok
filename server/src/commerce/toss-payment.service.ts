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
  private readonly baseUrl = 'https://api.tosspayments.com/v1/payments';

  private get secretKey(): string {
    return process.env.TOSS_SECRET_KEY ?? '';
  }

  private authHeader(): string {
    const encoded = Buffer.from(`${this.secretKey}:`).toString('base64');
    return `Basic ${encoded}`;
  }

  async confirmPayment(
    paymentKey: string,
    orderId: string,
    amount: number,
  ): Promise<TossPaymentResult> {
    if (!this.secretKey) {
      throw new BadRequestException('결제 서비스가 설정되지 않았습니다.');
    }

    const res = await fetch(`${this.baseUrl}/confirm`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader(),
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

  async cancelPayment(
    paymentKey: string,
    cancelAmount: number,
    cancelReason: string,
  ): Promise<void> {
    if (!this.secretKey) {
      throw new BadRequestException('결제 서비스가 설정되지 않았습니다.');
    }

    const res = await fetch(`${this.baseUrl}/${paymentKey}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cancelReason, cancelAmount }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      this.logger.error('Toss 환불 실패', { paymentKey, status: res.status, body });
      throw new BadGatewayException(
        `환불 처리 실패: ${body.message ?? '토스페이먼츠 오류'}`,
      );
    }

    this.logger.log(`Toss 환불 완료 [paymentKey=${paymentKey}, amount=${cancelAmount}]`);
  }
}
