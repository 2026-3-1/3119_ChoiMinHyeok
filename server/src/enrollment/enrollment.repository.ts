import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EnrollmentStatus,
  CourseLifecycleStatus,
  Roles,
} from '../../prisma/generated/prisma/enums';
import prisma from '../../prisma/prisma.client';

@Injectable()
export class EnrollmentRepository {
  async findActiveEnrollment(userId: number, courseId: number) {
    return prisma.enrollments.findFirst({
      where: {
        user_id: userId,
        course_id: courseId,
        status: EnrollmentStatus.ACTIVE,
      },
    });
  }

  async assertCourseAvailable(courseId: number) {
    const course = await prisma.courses.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('강의를 찾을 수 없습니다.');
    }

    if (course.status === CourseLifecycleStatus.CANCELED) {
      throw new ConflictException('취소된 강의입니다.');
    }

    if (course.price !== 0) {
      throw new ConflictException(
        '유료 강의는 결제를 통해 수강 신청해야 합니다.',
      );
    }

    return course;
  }

  async assertUserExists(userId: number) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    if (user.role !== Roles.STUDENT)
      throw new ForbiddenException('학생 계정만 수강 신청할 수 있습니다.');
  }

  async getMyEnrollments(userId: number) {
    return prisma.enrollments.findMany({
      where: {
        user_id: userId,
        status: EnrollmentStatus.ACTIVE,
      },
      include: {
        courses: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            difficulty: true,
            price: true,
            rating: true,
            slug: true,
          },
        },
      },
      orderBy: { enrolled_at: 'desc' },
    });
  }

  async createEnrollment(userId: number, courseId: number) {
    return prisma.enrollments.create({
      data: {
        user_id: userId,
        course_id: courseId,
        status: EnrollmentStatus.ACTIVE,
      },
    });
  }

  async findEnrollmentById(enrollmentId: number, userId: number) {
    const enrollment = await prisma.enrollments.findFirst({
      where: {
        id: enrollmentId,
        user_id: userId,
        status: EnrollmentStatus.ACTIVE,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('수강 정보를 찾을 수 없습니다.');
    }

    return enrollment;
  }

  async cancelEnrollment(enrollmentId: number) {
    return prisma.enrollments.update({
      where: { id: enrollmentId },
      data: {
        status: EnrollmentStatus.CANCELED,
        is_canceled: true,
        canceled_at: new Date(),
      },
    });
  }
}
