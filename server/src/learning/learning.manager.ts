import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EnrollmentStatus } from '../../prisma/generated/prisma/enums';
import type {
  CourseReviewWithUser,
  EnrollmentWithCourse,
  LectureWithCourse,
} from './learning.repository';

type CourseProgressSource = {
  chapters: {
    lectures: {
      id: number;
      duration: number;
    }[];
  }[];
  progressRows: {
    lecture_id: number;
    watched_seconds: number;
    progress: number;
    last_position: number;
    updated_at: Date;
  }[];
  bookmarkCount: number;
};

@Injectable()
export class LearningManager {
  assertCourseExists(course: { id: number } | null) {
    if (!course) {
      throw new NotFoundException('강의를 찾을 수 없습니다.');
    }
  }

  assertLectureExists(lecture: LectureWithCourse | null) {
    if (!lecture) {
      throw new NotFoundException('강의를 찾을 수 없습니다.');
    }
  }

  assertEnrollmentExists(
    enrollment: { id: number; status?: EnrollmentStatus } | null,
  ) {
    if (!enrollment) {
      throw new BadRequestException(
        '구매한 강의만 학습 기록을 남길 수 있습니다.',
      );
    }
  }

  assertNotCourseInstructor(course: { instructor_id: number }, userId: number) {
    if (course.instructor_id === userId) {
      throw new ForbiddenException(
        '자신의 강의에는 리뷰를 작성할 수 없습니다.',
      );
    }
  }

  assertReviewWritable(
    enrollment: { id: number } | null,
    progressPercent: number,
  ) {
    if (!enrollment) {
      throw new BadRequestException(
        '수강 중인 강의만 리뷰를 작성할 수 있습니다.',
      );
    }

    if (progressPercent < 80) {
      throw new BadRequestException(
        '강의 진도율이 80% 이상일 때만 리뷰를 작성할 수 있습니다.',
      );
    }
  }

  assertBookmarkExists(bookmark: { id: number } | null) {
    if (!bookmark) {
      throw new NotFoundException('북마크를 찾을 수 없습니다.');
    }
  }

  validateProgressInput(
    duration: number,
    lastPosition: number,
    watchedSeconds: number,
  ) {
    if (lastPosition > duration || watchedSeconds > duration) {
      throw new BadRequestException(
        '강의 길이를 초과한 진도값은 저장할 수 없습니다.',
      );
    }
  }

  validateBookmarkPosition(duration: number, position: number) {
    if (position > duration) {
      throw new BadRequestException('강의 길이를 초과한 북마크 위치입니다.');
    }
  }

  buildCourseMetrics(source: CourseProgressSource) {
    const lectures = source.chapters.flatMap((chapter) => chapter.lectures);
    const progressMap = new Map(
      source.progressRows.map((progressRow) => [
        progressRow.lecture_id,
        progressRow,
      ]),
    );
    const totalDuration = lectures.reduce(
      (sum, lecture) => sum + lecture.duration,
      0,
    );
    const totalWatchedSeconds = lectures.reduce((sum, lecture) => {
      const watchedSeconds = progressMap.get(lecture.id)?.watched_seconds ?? 0;
      return sum + Math.min(watchedSeconds, lecture.duration);
    }, 0);
    const progressPercent =
      totalDuration > 0
        ? Math.min(100, Math.round((totalWatchedSeconds / totalDuration) * 100))
        : 0;
    const lastProgress = source.progressRows[0];

    return {
      lectureCount: lectures.length,
      totalWatchedSeconds,
      progressPercent,
      lastLectureId: lastProgress?.lecture_id ?? null,
      lastPosition: lastProgress?.last_position ?? null,
      bookmarkCount: source.bookmarkCount,
    };
  }

  toLearningCards(
    enrollments: EnrollmentWithCourse[],
    metricsByCourseId: Map<
      number,
      {
        progressPercent: number;
        lastLectureId: number | null;
        lastPosition: number | null;
      }
    >,
  ) {
    return enrollments.map((enrollment) => {
      const metrics = metricsByCourseId.get(enrollment.course_id);

      return {
        courseId: enrollment.course_id,
        title: enrollment.courses.title,
        thumbnail: enrollment.courses.thumbnail,
        progressPercent: metrics?.progressPercent ?? 0,
        lastLectureId: metrics?.lastLectureId ?? null,
        lastPosition: metrics?.lastPosition ?? null,
      };
    });
  }

  toCourseLearningStatus(params: {
    userId: number;
    courseId: number;
    isEnrolled: boolean;
    metrics: {
      progressPercent: number;
      totalWatchedSeconds: number;
      lectureCount: number;
      lastLectureId: number | null;
      lastPosition: number | null;
      bookmarkCount: number;
    };
  }) {
    return {
      userId: params.userId,
      courseId: params.courseId,
      isEnrolled: params.isEnrolled,
      progressPercent: params.metrics.progressPercent,
      totalWatchedSeconds: params.metrics.totalWatchedSeconds,
      lectureCount: params.metrics.lectureCount,
      lastLectureId: params.metrics.lastLectureId,
      lastPosition: params.metrics.lastPosition,
      canWriteReview: params.isEnrolled && params.metrics.progressPercent >= 80,
      bookmarkCount: params.metrics.bookmarkCount,
    };
  }

  toLectureProgress(params: {
    userId: number;
    lectureId: number;
    progress: {
      last_position: number;
      watched_seconds: number;
      progress: number;
      is_completed: boolean;
    } | null;
  }) {
    return {
      userId: params.userId,
      lectureId: params.lectureId,
      lastPosition: params.progress?.last_position ?? 0,
      watchedSeconds: params.progress?.watched_seconds ?? 0,
      progress: params.progress?.progress ?? 0,
      isCompleted: params.progress?.is_completed ?? false,
    };
  }

  calculateWatchedSeconds(
    existingWatchedSeconds: number | undefined,
    nextWatchedSeconds: number,
  ) {
    return Math.max(existingWatchedSeconds ?? 0, nextWatchedSeconds);
  }

  calculateProgressPercent(duration: number, watchedSeconds: number) {
    if (duration <= 0) {
      return 0;
    }

    return Math.min(100, Math.round((watchedSeconds / duration) * 100));
  }

  toCourseReviews(reviews: CourseReviewWithUser[]) {
    return reviews.map((review) => ({
      id: review.id,
      title: review.title,
      content: review.content,
      star: review.star,
      user: {
        id: review.users.id,
        name: review.users.name,
        role: review.users.role,
      },
      created_at: review.create_at,
    }));
  }
}
