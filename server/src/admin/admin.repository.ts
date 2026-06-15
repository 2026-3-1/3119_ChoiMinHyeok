import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../prisma/generated/prisma/client';
import {
  Roles,
  ReportType,
  EnrollmentStatus,
  OrderStatus,
  CourseLifecycleStatus,
} from '../../prisma/generated/prisma/enums';
import prisma from '../../prisma/prisma.client';

@Injectable()
export class AdminRepository {
  async getDashboard() {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      pendingReports,
      revenueAgg,
      newUsersToday,
      monthlyRevenueAgg,
      openCourses,
      draftCourses,
      canceledCourses,
      recentOrders,
      recentSignups,
    ] = await Promise.all([
      prisma.users.count(),
      prisma.courses.count(),
      prisma.enrollments.count({ where: { status: EnrollmentStatus.ACTIVE } }),
      prisma.course_report.count({ where: { is_resolved: false } }),
      prisma.orders.aggregate({
        _sum: { paid_amount: true },
        where: {
          status: { in: [OrderStatus.PAID, OrderStatus.PARTIALLY_REFUNDED] },
        },
      }),
      prisma.users.count({ where: { created_at: { gte: todayStart } } }),
      prisma.orders.aggregate({
        _sum: { paid_amount: true },
        where: {
          status: { in: [OrderStatus.PAID, OrderStatus.PARTIALLY_REFUNDED] },
          created_at: { gte: monthStart },
        },
      }),
      prisma.courses.count({ where: { status: CourseLifecycleStatus.OPEN } }),
      prisma.courses.count({ where: { status: CourseLifecycleStatus.DRAFT } }),
      prisma.courses.count({ where: { status: CourseLifecycleStatus.CANCELED } }),
      prisma.orders.findMany({
        where: { status: { in: [OrderStatus.PAID, OrderStatus.PARTIALLY_REFUNDED] } },
        select: {
          id: true,
          paid_amount: true,
          created_at: true,
          users: { select: { name: true, email: true } },
        },
        orderBy: { created_at: 'desc' },
        take: 5,
      }),
      prisma.users.findMany({
        select: { id: true, name: true, email: true, role: true, created_at: true },
        orderBy: { created_at: 'desc' },
        take: 5,
      }),
    ]);

    return {
      totalUsers,
      totalCourses,
      totalEnrollments,
      pendingReports,
      totalRevenue: revenueAgg._sum.paid_amount ?? 0,
      newUsersToday,
      monthlyRevenue: monthlyRevenueAgg._sum.paid_amount ?? 0,
      courseStatusBreakdown: { open: openCourses, draft: draftCourses, canceled: canceledCourses },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        amount: o.paid_amount,
        userName: o.users?.name ?? '알 수 없음',
        userEmail: o.users?.email ?? '',
        createdAt: o.created_at,
      })),
      recentSignups: recentSignups.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.created_at,
      })),
    };
  }

  async getUsers(params: {
    search?: string;
    role?: string;
    page: number;
    limit: number;
  }) {
    const { search, role, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.usersWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
      ...(role && { role: role as Roles }),
    };

    const [data, total] = await Promise.all([
      prisma.users.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.users.count({ where }),
    ]);

    return { data, total };
  }

  async findUserById(userId: number) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    return user;
  }

  async deleteUser(userId: number) {
    await this.findUserById(userId);
    return prisma.users.delete({ where: { id: userId } });
  }

  async banUser(userId: number) {
    await this.findUserById(userId);
    return prisma.users.update({
      where: { id: userId },
      data: { role: Roles.STUDENT },
    });
  }

  async changeUserRole(userId: number, role: Roles) {
    await this.findUserById(userId);
    return prisma.users.update({ where: { id: userId }, data: { role } });
  }

  async getCourses(params: {
    search?: string;
    categoryId?: number;
    status?: string;
    page: number;
    limit: number;
  }) {
    const { search, categoryId, status, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.coursesWhereInput = {
      ...(search && {
        title: { contains: search, mode: Prisma.QueryMode.insensitive },
      }),
      ...(categoryId && { category_id: categoryId }),
      ...(status && { status: status as any }),
    };

    const [data, total] = await Promise.all([
      prisma.courses.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
          price: true,
          status: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.courses.count({ where }),
    ]);

    return { data, total };
  }

  async setCourseStatus(courseId: number, status: string) {
    const course = await prisma.courses.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('강의를 찾을 수 없습니다.');
    return prisma.courses.update({
      where: { id: courseId },
      data: { status: status as any },
    });
  }

  async deleteCourse(courseId: number) {
    const course = await prisma.courses.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('강의를 찾을 수 없습니다.');

    const orderCount = await prisma.order_items.count({ where: { course_id: courseId } });
    if (orderCount > 0) {
      throw new BadRequestException(
        '구매 이력이 있는 강의는 삭제할 수 없습니다. 대신 비공개(DRAFT) 처리해주세요.',
      );
    }

    try {
      return await prisma.courses.delete({ where: { id: courseId } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2003'
      ) {
        throw new BadRequestException(
          '연결된 데이터가 있어 강의를 삭제할 수 없습니다.',
        );
      }
      throw e;
    }
  }

  async getReports(params: {
    isResolved?: boolean;
    type?: ReportType;
    page: number;
    limit: number;
  }) {
    const { isResolved, type, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.course_reportWhereInput = {
      ...(isResolved !== undefined && { is_resolved: isResolved }),
      ...(type && { type }),
    };

    const [data, total] = await Promise.all([
      prisma.course_report.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ is_resolved: 'asc' }, { created_at: 'desc' }],
      }),
      prisma.course_report.count({ where }),
    ]);

    return { data, total };
  }

  async resolveReport(reportId: number, isResolved: boolean) {
    const report = await prisma.course_report.findUnique({
      where: { id: reportId },
    });
    if (!report) throw new NotFoundException('신고를 찾을 수 없습니다.');

    return prisma.course_report.update({
      where: { id: reportId },
      data: { is_resolved: isResolved },
    });
  }
}
