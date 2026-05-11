import { Injectable, NotFoundException } from '@nestjs/common';
import { EnrollmentStatus } from '../../prisma/generated/prisma/enums';
import prisma from '../../prisma/prisma.client';

@Injectable()
export class AttachmentRepository {
  async create(data: {
    lectureId: number;
    filename: string;
    storedName: string;
    mimeType: string;
    size: number;
  }) {
    return prisma.lecture_attachment.create({
      data: {
        lecture_id: data.lectureId,
        filename: data.filename,
        stored_name: data.storedName,
        mime_type: data.mimeType,
        size: data.size,
      },
    });
  }

  async findById(id: number) {
    return prisma.lecture_attachment.findUnique({ where: { id } });
  }

  async findByLectureId(lectureId: number) {
    return prisma.lecture_attachment.findMany({
      where: { lecture_id: lectureId },
      orderBy: { created_at: 'asc' },
    });
  }

  // Includes lecture → chapter → course for ownership/access checks
  async findByIdWithCourse(id: number) {
    const attachment = await prisma.lecture_attachment.findUnique({
      where: { id },
      include: {
        lectures: {
          include: {
            chapters: {
              include: { courses: true },
            },
          },
        },
      },
    });

    if (!attachment) throw new NotFoundException('첨부파일을 찾을 수 없습니다.');
    return attachment;
  }

  async delete(id: number) {
    return prisma.lecture_attachment.delete({ where: { id } });
  }

  async isEnrolledOrInstructor(userId: number, lectureId: number): Promise<boolean> {
    const lecture = await prisma.lectures.findUnique({
      where: { id: lectureId },
      include: { chapters: { include: { courses: true } } },
    });

    if (!lecture) return false;

    const course = lecture.chapters.courses;
    if (course.instructor_id === userId) return true;

    const enrollment = await prisma.enrollments.findFirst({
      where: {
        user_id: userId,
        course_id: course.id,
        status: EnrollmentStatus.ACTIVE,
      },
    });

    return !!enrollment;
  }
}
