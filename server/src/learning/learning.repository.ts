import { Injectable, NotFoundException } from '@nestjs/common';
import {
  EnrollmentStatus,
  LecturePlaybackEventType,
} from '../../prisma/generated/prisma/enums';
import type { Prisma } from '../../prisma/generated/prisma/client';
import prisma from '../../prisma/prisma.client';

export type EnrollmentWithCourse = Prisma.enrollmentsGetPayload<{
  include: {
    courses: true;
  };
}>;

export type LectureWithCourse = Prisma.lecturesGetPayload<{
  include: {
    chapters: {
      select: {
        course_id: true;
      };
    };
  };
}>;

export type CourseReviewWithUser = Prisma.course_commentGetPayload<{
  include: {
    users: true;
  };
}>;

@Injectable()
export class LearningRepository {
  async assertUserExists(userId: number) {
    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
  }

  getActiveEnrollmentsWithCourses(userId: number) {
    return prisma.enrollments.findMany({
      where: {
        user_id: userId,
        status: EnrollmentStatus.ACTIVE,
      },
      include: {
        courses: true,
      },
      orderBy: {
        enrolled_at: 'desc',
      },
    });
  }

  findCourseById(courseId: number) {
    return prisma.courses.findUnique({
      where: {
        id: courseId,
      },
    });
  }

  findActiveEnrollment(userId: number, courseId: number) {
    return prisma.enrollments.findFirst({
      where: {
        user_id: userId,
        course_id: courseId,
        status: EnrollmentStatus.ACTIVE,
      },
    });
  }

  async getCourseProgressSource(userId: number, courseId: number) {
    const chapters = await prisma.chapter.findMany({
      where: {
        course_id: courseId,
      },
      include: {
        lectures: {
          orderBy: {
            position: 'asc',
          },
        },
      },
      orderBy: {
        position: 'asc',
      },
    });

    const lectureIds = chapters.flatMap((chapter) =>
      chapter.lectures.map((lecture) => lecture.id),
    );
    const progressRows =
      lectureIds.length > 0
        ? await prisma.lectures_progress.findMany({
            where: {
              user_id: userId,
              lecture_id: {
                in: lectureIds,
              },
            },
            orderBy: {
              updated_at: 'desc',
            },
          })
        : [];
    const bookmarkCount =
      lectureIds.length > 0
        ? await prisma.lecture_bookmark.count({
            where: {
              user_id: userId,
              lecture_id: {
                in: lectureIds,
              },
            },
          })
        : 0;

    return {
      chapters,
      progressRows,
      bookmarkCount,
    };
  }

  findLectureWithCourse(lectureId: number) {
    return prisma.lectures.findUnique({
      where: {
        id: lectureId,
      },
      include: {
        chapters: {
          select: {
            course_id: true,
          },
        },
      },
    });
  }

  findLectureProgress(userId: number, lectureId: number) {
    return prisma.lectures_progress.findUnique({
      where: {
        user_id_lecture_id: {
          user_id: userId,
          lecture_id: lectureId,
        },
      },
    });
  }

  upsertLectureProgressAndHistory(params: {
    userId: number;
    lectureId: number;
    lastPosition: number;
    watchedSeconds: number;
    progressPercent: number;
    eventType: LecturePlaybackEventType;
    fromSecond: number;
  }) {
    return prisma.$transaction(async (tx) => {
      const progress = await tx.lectures_progress.upsert({
        where: {
          user_id_lecture_id: {
            user_id: params.userId,
            lecture_id: params.lectureId,
          },
        },
        create: {
          user_id: params.userId,
          lecture_id: params.lectureId,
          last_position: params.lastPosition,
          watched_seconds: params.watchedSeconds,
          progress: params.progressPercent,
          is_completed: params.progressPercent >= 100,
        },
        update: {
          last_position: params.lastPosition,
          watched_seconds: params.watchedSeconds,
          progress: params.progressPercent,
          is_completed: params.progressPercent >= 100,
        },
      });

      await tx.lecture_playback_history.create({
        data: {
          user_id: params.userId,
          lecture_id: params.lectureId,
          event_type: params.eventType,
          from_second: params.fromSecond,
          to_second: params.lastPosition,
          progress: params.progressPercent,
        },
      });

      return progress;
    });
  }

  getLectureHistory(userId: number, lectureId: number) {
    return prisma.lecture_playback_history.findMany({
      where: {
        user_id: userId,
        lecture_id: lectureId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  getLectureBookmarks(userId: number, lectureId: number) {
    return prisma.lecture_bookmark.findMany({
      where: {
        user_id: userId,
        lecture_id: lectureId,
      },
      orderBy: {
        position: 'asc',
      },
    });
  }

  createLectureBookmark(
    userId: number,
    lectureId: number,
    position: number,
    note?: string,
  ) {
    return prisma.lecture_bookmark.create({
      data: {
        user_id: userId,
        lecture_id: lectureId,
        position,
        note,
      },
    });
  }

  findLectureBookmark(userId: number, bookmarkId: number) {
    return prisma.lecture_bookmark.findFirst({
      where: {
        id: bookmarkId,
        user_id: userId,
      },
    });
  }

  deleteLectureBookmark(bookmarkId: number) {
    return prisma.lecture_bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
  }

  getCourseReviews(courseId: number) {
    return prisma.course_comment.findMany({
      where: {
        course_id: courseId,
      },
      include: {
        users: true,
      },
      orderBy: {
        create_at: 'desc',
      },
    });
  }

  async upsertCourseReview(params: {
    userId: number;
    courseId: number;
    title: string;
    content: string;
    star: number;
  }) {
    await prisma.course_comment.upsert({
      where: {
        user_id_course_id: {
          user_id: params.userId,
          course_id: params.courseId,
        },
      },
      create: {
        user_id: params.userId,
        course_id: params.courseId,
        title: params.title,
        content: params.content,
        star: params.star,
      },
      update: {
        title: params.title,
        content: params.content,
        star: params.star,
      },
    });
  }

  async refreshCourseRating(courseId: number) {
    const ratingAggregate = await prisma.course_comment.aggregate({
      where: {
        course_id: courseId,
      },
      _avg: {
        star: true,
      },
    });

    await prisma.courses.update({
      where: {
        id: courseId,
      },
      data: {
        rating: ratingAggregate._avg.star ?? 0,
      },
    });
  }
}
