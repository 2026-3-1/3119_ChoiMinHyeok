import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReportType } from '../../prisma/generated/prisma/enums';
import prisma from '../../prisma/prisma.client';

@Injectable()
export class ReportRepository {
  async assertCourseExists(courseId: number) {
    const course = await prisma.courses.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('강의를 찾을 수 없습니다.');
    return course;
  }

  async assertUserExists(userId: number) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
  }

  async assertNotAlreadyReported(courseId: number, userId: number) {
    const existing = await prisma.course_report.findFirst({
      where: { course_id: courseId, user_id: userId },
    });

    if (existing) throw new ConflictException('이미 신고한 강의입니다.');
  }

  async createReport(courseId: number, userId: number, type: ReportType, content: string) {
    return prisma.course_report.create({
      data: {
        course_id: courseId,
        user_id: userId,
        type,
        content,
        is_resolved: false,
      },
    });
  }
}
