import { Injectable } from '@nestjs/common';
import { InstructorRepository } from './instructor.repository';
import {
  CreateChapterRequest,
  CreateInstructorCourseRequest,
  CreateLectureRequest,
  UpdateChapterRequest,
  UpdateCourseRequest,
  UpdateLectureRequest,
} from './dto/instructor.request';

@Injectable()
export class InstructorService {
  constructor(private readonly instructorRepository: InstructorRepository) {}

  async createCourse(
    instructorId: number,
    data: CreateInstructorCourseRequest,
  ) {
    const base = data.title
      .toLowerCase()
      .replace(/[\s]+/g, '-')
      .replace(/[^a-z0-9-]+/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
    const randomSuffix = Math.random().toString(36).slice(2, 8);
    const slug = (base || 'course') + '-' + randomSuffix;

    const course = await this.instructorRepository.createCourse(instructorId, {
      title: data.title,
      description: data.description,
      thumbnail: data.thumbnail ?? '',
      difficulty: data.difficulty,
      category_id: data.categoryId,
      slug,
      price: data.price,
      max_capacity: data.maxCapacity,
    });

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      difficulty: course.difficulty,
      price: course.price,
      status: course.status,
      maxCapacity: course.max_capacity,
      rating: course.rating,
      createdAt: course.created_at,
    };
  }

  async getMyCourses(instructorId: number) {
    const courses =
      await this.instructorRepository.getInstructorCourses(instructorId);
    return courses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      difficulty: c.difficulty,
      price: c.price,
      status: c.status,
      maxCapacity: c.max_capacity,
      rating: c.rating,
      createdAt: c.created_at,
    }));
  }

  async updateCourse(
    courseId: number,
    instructorId: number,
    data: UpdateCourseRequest,
  ) {
    await this.instructorRepository.findCourseByIdAndInstructor(
      courseId,
      instructorId,
    );

    const updated = await this.instructorRepository.updateCourse(courseId, {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.difficulty && { difficulty: data.difficulty }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.maxCapacity && { max_capacity: data.maxCapacity }),
      ...(data.thumbnail && { thumbnail: data.thumbnail }),
      ...(data.categoryId && { category_id: data.categoryId }),
    });

    return {
      id: updated.id,
      title: updated.title,
      slug: updated.slug,
      difficulty: updated.difficulty,
      price: updated.price,
      status: updated.status,
      maxCapacity: updated.max_capacity,
      rating: updated.rating,
      createdAt: updated.created_at,
    };
  }

  async deleteCourse(courseId: number, instructorId: number) {
    await this.instructorRepository.findCourseByIdAndInstructor(
      courseId,
      instructorId,
    );
    await this.instructorRepository.deleteCourse(courseId);
  }

  async setCourseStatus(
    courseId: number,
    instructorId: number,
    status: 'DRAFT' | 'OPEN',
  ) {
    await this.instructorRepository.findCourseByIdAndInstructor(
      courseId,
      instructorId,
    );
    const updated = await this.instructorRepository.updateCourse(courseId, {
      status: status as any,
    });
    return {
      id: updated.id,
      title: updated.title,
      slug: updated.slug,
      difficulty: updated.difficulty,
      price: updated.price,
      status: updated.status,
      maxCapacity: updated.max_capacity,
      rating: updated.rating,
      createdAt: updated.created_at,
    };
  }

  async addChapter(
    courseId: number,
    instructorId: number,
    data: CreateChapterRequest,
  ) {
    await this.instructorRepository.findCourseByIdAndInstructor(
      courseId,
      instructorId,
    );
    const chapter = await this.instructorRepository.addChapter(
      courseId,
      data.title,
      data.position,
    );
    return { id: chapter.id, title: chapter.title, position: chapter.position };
  }

  async updateChapter(
    courseId: number,
    chapterId: number,
    instructorId: number,
    data: UpdateChapterRequest,
  ) {
    await this.instructorRepository.findCourseByIdAndInstructor(
      courseId,
      instructorId,
    );
    await this.instructorRepository.findChapterByIdAndCourse(
      chapterId,
      courseId,
    );

    const updated = await this.instructorRepository.updateChapter(chapterId, {
      ...(data.title && { title: data.title }),
      ...(data.position && { position: data.position }),
    });

    return { id: updated.id, title: updated.title, position: updated.position };
  }

  async deleteChapter(
    courseId: number,
    chapterId: number,
    instructorId: number,
  ) {
    await this.instructorRepository.findCourseByIdAndInstructor(
      courseId,
      instructorId,
    );
    await this.instructorRepository.findChapterByIdAndCourse(
      chapterId,
      courseId,
    );
    await this.instructorRepository.deleteChapter(chapterId);
  }

  async addLecture(
    chapterId: number,
    _instructorId: number,
    data: CreateLectureRequest,
  ) {
    const lecture = await this.instructorRepository.addLecture(chapterId, {
      title: data.title,
      video_url: data.videoUrl,
      thumbnail_url: data.thumbnailUrl ?? '',
      duration: data.duration,
      position: data.position,
      is_published: data.isPublished ?? false,
    });

    return {
      id: lecture.id,
      title: lecture.title,
      videoUrl: lecture.video_url,
      duration: lecture.duration,
      position: lecture.position,
      isPublished: lecture.is_published,
    };
  }

  async updateLecture(
    lectureId: number,
    instructorId: number,
    data: UpdateLectureRequest,
  ) {
    await this.instructorRepository.findLectureByIdAndChapter(
      lectureId,
      instructorId,
    );

    const updated = await this.instructorRepository.updateLecture(lectureId, {
      ...(data.title && { title: data.title }),
      ...(data.videoUrl && { video_url: data.videoUrl }),
      ...(data.thumbnailUrl && { thumbnail_url: data.thumbnailUrl }),
      ...(data.duration && { duration: data.duration }),
      ...(data.position && { position: data.position }),
      ...(data.isPublished !== undefined && { is_published: data.isPublished }),
    });

    return {
      id: updated.id,
      title: updated.title,
      videoUrl: updated.video_url,
      duration: updated.duration,
      position: updated.position,
      isPublished: updated.is_published,
    };
  }

  async deleteLecture(lectureId: number, instructorId: number) {
    await this.instructorRepository.findLectureByIdAndChapter(
      lectureId,
      instructorId,
    );
    await this.instructorRepository.deleteLecture(lectureId);
  }

  async getStudents(courseId: number, instructorId: number) {
    await this.instructorRepository.findCourseByIdAndInstructor(
      courseId,
      instructorId,
    );
    return this.instructorRepository.getStudents(courseId);
  }

  async kickStudent(courseId: number, userId: number, instructorId: number) {
    await this.instructorRepository.findCourseByIdAndInstructor(
      courseId,
      instructorId,
    );
    await this.instructorRepository.kickStudent(courseId, userId);
  }
}
