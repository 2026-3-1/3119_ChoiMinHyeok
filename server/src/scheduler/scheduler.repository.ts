import { Injectable } from '@nestjs/common';
import {
  OrderStatus,
  CourseLifecycleStatus,
  CancellationReason,
} from '../../prisma/generated/prisma/enums';
import prisma from '../../prisma/prisma.client';

@Injectable()
export class SchedulerRepository {
  async cancelStalePendingOrders(olderThanMinutes: number) {
    const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000);
    return prisma.orders.updateMany({
      where: {
        status: OrderStatus.PENDING,
        created_at: { lt: cutoff },
      },
      data: { status: OrderStatus.CANCELED },
    });
  }

  async getDailyStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalCourses,
      totalUsers,
      todayEnrollments,
      todayRevenue,
      pendingOrders,
    ] = await Promise.all([
      prisma.courses.count({ where: { status: CourseLifecycleStatus.OPEN } }),
      prisma.users.count(),
      prisma.enrollments.count({ where: { enrolled_at: { gte: todayStart } } }),
      prisma.orders.aggregate({
        _sum: { paid_amount: true },
        where: { status: OrderStatus.PAID, paid_at: { gte: todayStart } },
      }),
      prisma.orders.count({ where: { status: OrderStatus.PENDING } }),
    ]);

    return {
      totalCourses,
      totalUsers,
      todayEnrollments,
      todayRevenue: todayRevenue._sum.paid_amount ?? 0,
      pendingOrders,
    };
  }

  async cancelUnderEnrolledCourses() {
    const courses = await prisma.courses.findMany({
      where: { status: CourseLifecycleStatus.OPEN },
      select: {
        id: true,
        title: true,
        min_enrollment: true,
        created_at: true,
        _count: { select: { enrollments: true } },
      },
    });

    // 개설 후 7일이 지났고 최소 인원 미달인 강의
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const targets = courses.filter(
      (c) =>
        c.created_at < sevenDaysAgo && c._count.enrollments < c.min_enrollment,
    );

    if (targets.length === 0) return { count: 0, titles: [] };

    await prisma.courses.updateMany({
      where: { id: { in: targets.map((c) => c.id) } },
      data: {
        status: CourseLifecycleStatus.CANCELED,
        canceled_at: new Date(),
        cancel_reason: CancellationReason.UNDER_ENROLLED,
      },
    });

    return { count: targets.length, titles: targets.map((c) => c.title) };
  }
}
