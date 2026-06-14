import { ConflictException, Injectable } from '@nestjs/common';
import { EnrollmentRepository } from './enrollment.repository';

@Injectable()
export class EnrollmentService {
  constructor(private readonly enrollmentRepository: EnrollmentRepository) {}

  async getMyEnrollments(userId: number) {
    await this.enrollmentRepository.assertUserExists(userId);
    const enrollments =
      await this.enrollmentRepository.getMyEnrollments(userId);

    return enrollments.map((e) => ({
      id: e.id,
      userId: e.user_id,
      courseId: e.course_id,
      status: e.status,
      enrolledAt: e.enrolled_at,
      course: e.courses,
    }));
  }

  async enroll(userId: number, courseId: number) {
    await this.enrollmentRepository.assertUserExists(userId);
    await this.enrollmentRepository.assertCourseAvailable(courseId);

    const existing = await this.enrollmentRepository.findActiveEnrollment(
      userId,
      courseId,
    );

    if (existing) {
      throw new ConflictException('이미 수강 중인 강의입니다.');
    }

    const enrollment = await this.enrollmentRepository.createEnrollment(
      userId,
      courseId,
    );

    return {
      id: enrollment.id,
      userId: enrollment.user_id,
      courseId: enrollment.course_id,
      status: enrollment.status,
      enrolledAt: enrollment.enrolled_at,
    };
  }

  async cancelEnrollment(userId: number, enrollmentId: number) {
    await this.enrollmentRepository.findEnrollmentById(enrollmentId, userId);
    await this.enrollmentRepository.cancelEnrollment(enrollmentId);
  }
}
