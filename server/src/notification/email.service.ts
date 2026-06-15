import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { withRetry } from '../global/retry.util';

export interface PurchaseEmailData {
  userName: string;
  userEmail: string;
  orderNumber: string;
  courses: { title: string; price: number }[];
  totalAmount: number;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;
  private readonly enabled: boolean;

  constructor() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    this.from = process.env.SMTP_FROM ?? user ?? 'no-reply@example.com';
    this.enabled = !!(host && user && pass);

    if (!this.enabled) {
      this.logger.warn(
        'SMTP 환경변수가 설정되지 않아 이메일 알림이 비활성화됩니다.',
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
    });
  }

  async sendBanNotification(userName: string, userEmail: string): Promise<void> {
    if (!this.enabled) return;
    const adminEmail = process.env.ADMIN_EMAIL ?? this.from;
    const html = `
<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Apple SD Gothic Neo',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background:#dc2626;padding:32px 40px;">
          <h1 style="margin:0;color:#fff;font-size:22px;">⚠ 계정 이용이 정지되었습니다</h1>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 12px;color:#333;font-size:16px;">안녕하세요, <strong>${userName}</strong>님.</p>
          <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.7;">
            관리자에 의해 계정이 정지되었습니다.<br>
            정지 해제를 원하시면 아래 버튼을 클릭하거나 관리자에게 직접 문의해 주세요.
          </p>
          <a href="mailto:${adminEmail}?subject=정지 해제 요청 (${userEmail})" style="display:inline-block;background:#4F46E5;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;">
            정지 해제 요청하기
          </a>
        </td></tr>
        <tr><td style="background:#f8f8f8;padding:16px 40px;text-align:center;">
          <p style="margin:0;color:#aaa;font-size:12px;">본 메일은 자동 발송되었습니다.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
    try {
      await withRetry(
        () => this.transporter.sendMail({
          from: `"강의 플랫폼" <${this.from}>`,
          to: userEmail,
          subject: '[계정 정지] 계정 이용이 정지되었습니다',
          html,
        }),
        { maxAttempts: 3, baseDelayMs: 1000 },
      );
      this.logger.log(`정지 알림 발송 → ${userEmail}`);
    } catch (err) {
      this.logger.error(`정지 알림 발송 실패 → ${userEmail}`, err);
    }
  }

  async sendBanAppealToAdmin(userEmail: string, userName: string, message: string): Promise<void> {
    if (!this.enabled) return;
    const adminEmail = process.env.ADMIN_EMAIL ?? this.from;
    const html = `
<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Apple SD Gothic Neo',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background:#4F46E5;padding:32px 40px;">
          <h1 style="margin:0;color:#fff;font-size:22px;">📩 정지 해제 요청</h1>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 6px;color:#888;font-size:13px;">요청자</p>
          <p style="margin:0 0 20px;color:#333;font-size:15px;font-weight:600;">${userName} (${userEmail})</p>
          <p style="margin:0 0 6px;color:#888;font-size:13px;">요청 사유</p>
          <div style="background:#f8f7ff;border-left:4px solid #4F46E5;padding:14px 16px;border-radius:0 4px 4px 0;color:#333;font-size:14px;line-height:1.7;white-space:pre-wrap;">${message}</div>
        </td></tr>
        <tr><td style="background:#f8f8f8;padding:16px 40px;text-align:center;">
          <p style="margin:0;color:#aaa;font-size:12px;">관리자 패널에서 직접 정지 해제를 진행하세요.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
    try {
      await withRetry(
        () => this.transporter.sendMail({
          from: `"강의 플랫폼" <${this.from}>`,
          to: adminEmail,
          subject: `[정지 해제 요청] ${userName} (${userEmail})`,
          html,
        }),
        { maxAttempts: 3, baseDelayMs: 1000 },
      );
      this.logger.log(`정지 해제 요청 이메일 발송 → 관리자 (요청자: ${userEmail})`);
    } catch (err) {
      this.logger.error(`정지 해제 요청 이메일 발송 실패`, err);
    }
  }

  async sendPurchaseConfirmation(data: PurchaseEmailData): Promise<void> {
    if (!this.enabled) return;

    const courseRows = data.courses
      .map(
        (c) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${c.title}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">
            ${c.price === 0 ? '무료' : `${c.price.toLocaleString()}원`}
          </td>
        </tr>`,
      )
      .join('');

    const html = `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Apple SD Gothic Neo',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#4F46E5;padding:32px 40px;">
            <h1 style="margin:0;color:#fff;font-size:24px;">✅ 구매가 완료되었습니다</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 8px;color:#333;font-size:16px;">안녕하세요, <strong>${data.userName}</strong>님!</p>
            <p style="margin:0 0 24px;color:#555;font-size:14px;">아래 강의가 성공적으로 등록되었습니다.</p>

            <!-- Order Number -->
            <div style="background:#f8f7ff;border-left:4px solid #4F46E5;padding:12px 16px;margin-bottom:24px;border-radius:0 4px 4px 0;">
              <span style="font-size:12px;color:#888;">주문번호</span><br>
              <strong style="color:#4F46E5;font-size:15px;">${data.orderNumber}</strong>
            </div>

            <!-- Course Table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;overflow:hidden;margin-bottom:16px;">
              <thead>
                <tr style="background:#f8f8f8;">
                  <th style="padding:10px 12px;text-align:left;font-size:13px;color:#555;">강의명</th>
                  <th style="padding:10px 12px;text-align:right;font-size:13px;color:#555;">가격</th>
                </tr>
              </thead>
              <tbody>${courseRows}</tbody>
            </table>

            <!-- Total -->
            <div style="text-align:right;margin-bottom:32px;">
              <span style="font-size:14px;color:#555;">합계 </span>
              <strong style="font-size:20px;color:#4F46E5;">
                ${data.totalAmount === 0 ? '무료' : `${data.totalAmount.toLocaleString()}원`}
              </strong>
            </div>

            <p style="margin:0;color:#888;font-size:13px;">
              강의는 지금 바로 수강 가능합니다. 학습 페이지에서 확인하세요.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f8f8;padding:16px 40px;text-align:center;">
            <p style="margin:0;color:#aaa;font-size:12px;">
              본 메일은 발신 전용입니다. 문의는 고객센터를 이용해 주세요.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    try {
      await withRetry(
        () =>
          this.transporter.sendMail({
            from: `"강의 플랫폼" <${this.from}>`,
            to: data.userEmail,
            subject: `[구매 완료] ${data.courses.length}개 강의가 등록되었습니다`,
            html,
          }),
        { maxAttempts: 3, baseDelayMs: 1000 },
      );
      this.logger.log(
        `이메일 발송 완료 → ${data.userEmail} (주문: ${data.orderNumber})`,
      );
    } catch (err) {
      this.logger.error(
        `이메일 발송 최종 실패 (3회 시도) → ${data.userEmail}`,
        err,
      );
    }
  }
}
