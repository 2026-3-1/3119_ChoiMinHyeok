import { BadGatewayException } from '@nestjs/common';
import { TossPaymentService } from './toss-payment.service';

global.fetch = jest.fn();

const mockFetch = fetch as jest.Mock;

describe('TossPaymentService', () => {
  let service: TossPaymentService;

  beforeEach(() => {
    service = new TossPaymentService();
    process.env.TOSS_SECRET_KEY = 'test-secret-key';
    jest.clearAllMocks();
  });

  afterAll(() => {
    delete process.env.TOSS_SECRET_KEY;
  });

  describe('cancelPayment', () => {
    it('Toss API 환불 성공 시 정상 완료된다', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      await expect(
        service.cancelPayment('pay_key_123', 30000, '학습 불만족'),
      ).resolves.not.toThrow();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('pay_key_123/cancel'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('30000'),
        }),
      );
    });

    it('Toss API 환불 실패 시 BadGatewayException을 던진다', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: '이미 환불된 결제입니다.' }),
      });

      await expect(
        service.cancelPayment('pay_key_bad', 10000, '취소'),
      ).rejects.toThrow(BadGatewayException);
    });

    it('요청 body에 cancelReason과 cancelAmount가 포함된다', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      await service.cancelPayment('pay_key_abc', 50000, '강의 폐강');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.cancelReason).toBe('강의 폐강');
      expect(callBody.cancelAmount).toBe(50000);
    });

    it('Authorization 헤더가 Basic 형식으로 포함된다', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      await service.cancelPayment('pay_key_auth', 1000, '사유');

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers.Authorization).toMatch(/^Basic /);
    });
  });
});
