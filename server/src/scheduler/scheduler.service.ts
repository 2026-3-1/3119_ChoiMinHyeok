import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DiscordService } from '../notification/discord.service';
import { SchedulerRepository } from './scheduler.repository';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly schedulerRepository: SchedulerRepository,
    private readonly discordService: DiscordService,
  ) {}

  // 30분마다 실행 — PENDING 상태로 30분 이상 된 주문 자동 취소
  @Cron(CronExpression.EVERY_30_MINUTES)
  async cancelStalePendingOrders() {
    this.logger.log('미결제 주문 자동 취소 작업 시작');
    const result = await this.schedulerRepository.cancelStalePendingOrders(30);
    if (result.count > 0) {
      this.logger.log(`미결제 주문 ${result.count}건 자동 취소 완료`);
    }
  }

  // 매일 자정 — 개설 7일 이상 & 최소 인원 미달 강의 자동 취소
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cancelUnderEnrolledCourses() {
    this.logger.log('미달 강의 자동 취소 작업 시작');
    const result = await this.schedulerRepository.cancelUnderEnrolledCourses();
    if (result.count > 0) {
      this.logger.warn(
        `최소 인원 미달로 강의 ${result.count}개 자동 취소: ${result.titles.join(', ')}`,
      );
      await this.discordService.sendAdminAlert({
        title: '⚠️ 최소 인원 미달 강의 자동 취소',
        color: 0xff6b35,
        fields: [
          { name: '취소 강의 수', value: `${result.count}개`, inline: true },
          {
            name: '취소 강의 목록',
            value: result.titles.join('\n'),
            inline: false,
          },
        ],
      });
    }
  }

  // 매일 오전 9시 — 일일 통계 디스코드 리포트
  @Cron('0 9 * * *')
  async sendDailyReport() {
    this.logger.log('일일 통계 리포트 전송 시작');
    const stats = await this.schedulerRepository.getDailyStats();

    await this.discordService.sendAdminAlert({
      title: '📊 일일 운영 통계',
      color: 0x4f46e5,
      fields: [
        {
          name: '🎓 운영 중 강의',
          value: `${stats.totalCourses}개`,
          inline: true,
        },
        { name: '👥 전체 회원', value: `${stats.totalUsers}명`, inline: true },
        {
          name: '📚 오늘 수강 신청',
          value: `${stats.todayEnrollments}건`,
          inline: true,
        },
        {
          name: '💰 오늘 매출',
          value:
            stats.todayRevenue === 0
              ? '없음'
              : `${stats.todayRevenue.toLocaleString()}원`,
          inline: true,
        },
        {
          name: '⏳ 미결제 주문',
          value: `${stats.pendingOrders}건`,
          inline: true,
        },
      ],
    });
  }
}
