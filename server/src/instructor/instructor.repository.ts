import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CourseLifecycleStatus,
  EnrollmentStatus,
} from '../../prisma/generated/prisma/enums';
import prisma from '../../prisma/prisma.client';

@Injectable()
export class InstructorRepository {
  async createCourse(
    instructorId: number,
    data: {
      title: string;
      description: string;
      thumbnail: string;
      difficulty: any;
      category_id: number;
      slug: string;
      price: number;
      max_capacity: number;
    },
  ) {
    const existing = await prisma.courses.findUnique({
      where: { slug: data.slug },
    });
    if (existing) throw new ConflictException('이미 사용 중인 슬러그입니다.');

    return prisma.courses.create({
      data: {
        ...data,
        instructor_id: instructorId,
        status: CourseLifecycleStatus.DRAFT,
      },
    });
  }

  async getInstructorCourses(instructorId: number) {
    return prisma.courses.findMany({
      where: { instructor_id: instructorId },
      orderBy: { created_at: 'desc' },
    });
  }

  async findCourseByIdAndInstructor(courseId: number, instructorId: number) {
    const course = await prisma.courses.findUnique({
      where: { id: courseId },
    });

    if (!course) throw new NotFoundException('강의를 찾을 수 없습니다.');
    if (course.instructor_id !== instructorId)
      throw new ForbiddenException('본인 강의가 아닙니다.');

    return course;
  }

  async updateCourse(
    courseId: number,
    data: Partial<{
      title: string;
      description: string;
      difficulty: any;
      price: number;
      max_capacity: number;
      thumbnail: string;
      category_id: number;
      status: any;
    }>,
  ) {
    return prisma.courses.update({
      where: { id: courseId },
      data,
    });
  }

  async hasOrderItems(courseId: number): Promise<boolean> {
    const count = await prisma.order_items.count({ where: { course_id: courseId } });
    return count > 0;
  }

  async deleteCourse(courseId: number) {
    return prisma.courses.delete({ where: { id: courseId } });
  }

  async addChapter(courseId: number, title: string, position: number) {
    const existing = await prisma.chapter.findFirst({
      where: { course_id: courseId, position },
    });

    if (existing)
      throw new ConflictException('해당 위치에 이미 챕터가 존재합니다.');

    return prisma.chapter.create({
      data: { course_id: courseId, title, position },
    });
  }

  async findChapterByIdAndCourse(chapterId: number, courseId: number) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) throw new NotFoundException('챕터를 찾을 수 없습니다.');
    if (chapter.course_id !== courseId)
      throw new ForbiddenException('해당 강의의 챕터가 아닙니다.');

    return chapter;
  }

  async updateChapter(
    chapterId: number,
    data: Partial<{ title: string; position: number }>,
  ) {
    return prisma.chapter.update({ where: { id: chapterId }, data });
  }

  async deleteChapter(chapterId: number) {
    return prisma.chapter.delete({ where: { id: chapterId } });
  }

  async addLecture(
    chapterId: number,
    data: {
      title: string;
      video_url: string;
      thumbnail_url: string;
      duration: number;
      position: number;
      is_published: boolean;
    },
  ) {
    const existing = await prisma.lectures.findFirst({
      where: { chapter_id: chapterId, position: data.position },
    });

    if (existing)
      throw new ConflictException('해당 위치에 이미 강의가 존재합니다.');

    return prisma.lectures.create({
      data: { chapter_id: chapterId, ...data },
    });
  }

  async findLectureByIdAndChapter(lectureId: number, instructorId: number) {
    const lecture = await prisma.lectures.findUnique({
      where: { id: lectureId },
      include: {
        chapters: { include: { courses: true } },
      },
    });

    if (!lecture) throw new NotFoundException('강의 영상을 찾을 수 없습니다.');
    if (lecture.chapters.courses.instructor_id !== instructorId)
      throw new ForbiddenException('본인 강의가 아닙니다.');

    return lecture;
  }

  async updateLecture(
    lectureId: number,
    data: Partial<{
      title: string;
      video_url: string;
      thumbnail_url: string;
      duration: number;
      position: number;
      is_published: boolean;
    }>,
  ) {
    return prisma.lectures.update({ where: { id: lectureId }, data });
  }

  async deleteLecture(lectureId: number) {
    return prisma.lectures.delete({ where: { id: lectureId } });
  }

  async countLecturesByCourseId(courseId: number): Promise<number> {
    const chapters = await prisma.chapter.findMany({
      where: { course_id: courseId },
      select: { id: true },
    });
    if (chapters.length === 0) return 0;
    return prisma.lectures.count({
      where: { chapter_id: { in: chapters.map((c) => c.id) } },
    });
  }

  async getStudents(courseId: number) {
    const enrollments = await prisma.enrollments.findMany({
      where: {
        course_id: courseId,
        status: EnrollmentStatus.ACTIVE,
      },
      include: {
        users: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { enrolled_at: 'asc' },
    });

    return enrollments.map((e) => ({
      enrollmentId: e.id,
      userId: e.user_id,
      name: e.users.name,
      email: e.users.email,
      enrolledAt: e.enrolled_at,
    }));
  }

  async kickStudent(courseId: number, userId: number) {
    const enrollment = await prisma.enrollments.findFirst({
      where: {
        course_id: courseId,
        user_id: userId,
        status: EnrollmentStatus.ACTIVE,
      },
    });

    if (!enrollment)
      throw new NotFoundException(
        '해당 수강생의 수강 정보를 찾을 수 없습니다.',
      );

    return prisma.enrollments.update({
      where: { id: enrollment.id },
      data: {
        status: EnrollmentStatus.CANCELED,
        is_canceled: true,
        canceled_at: new Date(),
      },
    });
  }
}
