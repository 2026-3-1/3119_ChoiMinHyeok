import { Test, TestingModule } from '@nestjs/testing';
import { DiscordService } from './discord.service';
import { EmailService } from './email.service';
import {
  NotificationService,
  PurchaseNotificationData,
} from './notification.service';

const mockEmailService = { sendPurchaseConfirmation: jest.fn() };
const mockDiscordService = { sendPurchaseNotification: jest.fn() };

const sampleData: PurchaseNotificationData = {
  userName: '홍길동',
  userEmail: 'test@example.com',
  orderNumber: 'ORD-001',
  courses: [{ title: 'NestJS 완전 정복', price: 30000 }],
  totalAmount: 30000,
};

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: EmailService, useValue: mockEmailService },
        { provide: DiscordService, useValue: mockDiscordService },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    jest.clearAllMocks();
  });

  it('이메일과 디스코드를 동시에 전송한다', async () => {
    mockEmailService.sendPurchaseConfirmation.mockResolvedValue(undefined);
    mockDiscordService.sendPurchaseNotification.mockResolvedValue(undefined);

    await service.notifyPurchaseComplete(sampleData);

    expect(mockEmailService.sendPurchaseConfirmation).toHaveBeenCalledWith(
      sampleData,
    );
    expect(mockDiscordService.sendPurchaseNotification).toHaveBeenCalledWith(
      sampleData,
    );
  });

  it('이메일 실패해도 디스코드는 전송된다', async () => {
    mockEmailService.sendPurchaseConfirmation.mockRejectedValue(
      new Error('SMTP 오류'),
    );
    mockDiscordService.sendPurchaseNotification.mockResolvedValue(undefined);

    await expect(
      service.notifyPurchaseComplete(sampleData),
    ).resolves.not.toThrow();
    expect(mockDiscordService.sendPurchaseNotification).toHaveBeenCalled();
  });

  it('디스코드 실패해도 전체 메서드는 완료된다', async () => {
    mockEmailService.sendPurchaseConfirmation.mockResolvedValue(undefined);
    mockDiscordService.sendPurchaseNotification.mockRejectedValue(
      new Error('Webhook 오류'),
    );

    await expect(
      service.notifyPurchaseComplete(sampleData),
    ).resolves.not.toThrow();
    expect(mockEmailService.sendPurchaseConfirmation).toHaveBeenCalled();
  });
});
