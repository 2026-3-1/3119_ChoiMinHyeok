import { Injectable } from '@nestjs/common';
import {
  AddLectureBookmarkRequest,
  CreateCourseReviewRequest,
  UpdateLectureProgressRequest,
} from './dto/learning.request';
import { LearningManager } from './learning.manager';
import { LearningRepository } from './learning.repository';

@Injectable()
export class LearningService {
  constructor(
    private readonly learningRepository: LearningRepository,
    private readonly learningManager: LearningManager,
  ) {}

  async getMyLearning(userId: number) {
    await this.learningRepository.assertUserExists(userId);
    const enrollments =
      await this.learningRepository.getActiveEnrollmentsWithCourses(userId);

    const metricsEntries = await Promise.all(
      enrollments.map(async (enrollment) => {
        const source = await this.learningRepository.getCourseProgressSource(
          userId,
          enrollment.course_id,
        );
        return [
          enrollment.course_id,
          this.learningManager.buildCourseMetrics(source),
        ] as const;
      }),
    );

    return this.learningManager.toLearningCards(
      enrollments,
      new Map(metricsEntries),
    );
  }

  async getCourseLearningStatus(userId: number, courseId: number) {
    await this.learningRepository.assertUserExists(userId);

    const [course, activeEnrollment, source] = await Promise.all([
      this.learningRepository.findCourseById(courseId),
      this.learningRepository.findActiveEnrollment(userId, courseId),
      this.learningRepository.getCourseProgressSource(userId, courseId),
    ]);

    this.learningManager.assertCourseExists(course);

    return this.learningManager.toCourseLearningStatus({
      userId,
      courseId,
      isEnrolled: Boolean(activeEnrollment),
      metrics: this.learningManager.buildCourseMetrics(source),
    });
  }

  async getLectureProgress(userId: number, lectureId: number) {
    const lecture = await this.learningRepository.findLectureWithCourse(lectureId);
    this.learningManager.assertLectureExists(lecture);
    const targetLecture = lecture!;

    const enrollment = await this.learningRepository.findActiveEnrollment(
      userId,
      targetLecture.chapters.course_id,
    );
    this.learningManager.assertEnrollmentExists(enrollment);

    const progress = await this.learningRepository.findLectureProgress(
      userId,
      lectureId,
    );

    return this.learningManager.toLectureProgress({
      userId,
      lectureId,
      progress,
    });
  }

  async updateLectureProgress(
    lectureId: number,
    data: UpdateLectureProgressRequest,
  ) {
    const lecture = await this.learningRepository.findLectureWithCourse(lectureId);
    this.learningManager.assertLectureExists(lecture);
    const targetLecture = lecture!;

    const enrollment = await this.learningRepository.findActiveEnrollment(
      data.userId,
      targetLecture.chapters.course_id,
    );
    this.learningManager.assertEnrollmentExists(enrollment);
    this.learningManager.validateProgressInput(
      targetLecture.duration,
      data.lastPosition,
      data.watchedSeconds,
    );

    const existingProgress = await this.learningRepository.findLectureProgress(
      data.userId,
      lectureId,
    );
    const watchedSeconds = this.learningManager.calculateWatchedSeconds(
      existingProgress?.watched_seconds,
      data.watchedSeconds,
    );
    const progressPercent = this.learningManager.calculateProgressPercent(
      targetLecture.duration,
      watchedSeconds,
    );
    const progress = await this.learningRepository.upsertLectureProgressAndHistory({
      userId: data.userId,
      lectureId,
      lastPosition: data.lastPosition,
      watchedSeconds,
      progressPercent,
      eventType: data.eventType,
      fromSecond: existingProgress?.last_position ?? 0,
    });

    return this.learningManager.toLectureProgress({
      userId: data.userId,
      lectureId,
      progress,
    });
  }

  async getLectureHistory(userId: number, lectureId: number) {
    const lecture = await this.learningRepository.findLectureWithCourse(lectureId);
    this.learningManager.assertLectureExists(lecture);
    const targetLecture = lecture!;

    const enrollment = await this.learningRepository.findActiveEnrollment(
      userId,
      targetLecture.chapters.course_id,
    );
    this.learningManager.assertEnrollmentExists(enrollment);

    return this.learningRepository.getLectureHistory(userId, lectureId);
  }

  async getLectureBookmarks(userId: number, lectureId: number) {
    const lecture = await this.learningRepository.findLectureWithCourse(lectureId);
    this.learningManager.assertLectureExists(lecture);
    const targetLecture = lecture!;

    const enrollment = await this.learningRepository.findActiveEnrollment(
      userId,
      targetLecture.chapters.course_id,
    );
    this.learningManager.assertEnrollmentExists(enrollment);

    return this.learningRepository.getLectureBookmarks(userId, lectureId);
  }

  async createLectureBookmark(
    lectureId: number,
    data: AddLectureBookmarkRequest,
  ) {
    const lecture = await this.learningRepository.findLectureWithCourse(lectureId);
    this.learningManager.assertLectureExists(lecture);
    const targetLecture = lecture!;

    const enrollment = await this.learningRepository.findActiveEnrollment(
      data.userId,
      targetLecture.chapters.course_id,
    );
    this.learningManager.assertEnrollmentExists(enrollment);
    this.learningManager.validateBookmarkPosition(
      targetLecture.duration,
      data.position,
    );

    await this.learningRepository.createLectureBookmark(
      data.userId,
      lectureId,
      data.position,
      data.note,
    );

    return this.learningRepository.getLectureBookmarks(data.userId, lectureId);
  }

  async removeLectureBookmark(userId: number, bookmarkId: number) {
    await this.learningRepository.assertUserExists(userId);
    const bookmark = await this.learningRepository.findLectureBookmark(
      userId,
      bookmarkId,
    );
    this.learningManager.assertBookmarkExists(bookmark);
    const targetBookmark = bookmark!;

    await this.learningRepository.deleteLectureBookmark(bookmarkId);
    return this.learningRepository.getLectureBookmarks(
      userId,
      targetBookmark.lecture_id,
    );
  }

  async getCourseReviews(courseId: number) {
    const course = await this.learningRepository.findCourseById(courseId);
    this.learningManager.assertCourseExists(course);

    const reviews = await this.learningRepository.getCourseReviews(courseId);
    return this.learningManager.toCourseReviews(reviews);
  }

  async createCourseReview(
    courseId: number,
    data: CreateCourseReviewRequest,
  ) {
    await this.learningRepository.assertUserExists(data.userId);

    const [course, activeEnrollment, source] = await Promise.all([
      this.learningRepository.findCourseById(courseId),
      this.learningRepository.findActiveEnrollment(data.userId, courseId),
      this.learningRepository.getCourseProgressSource(data.userId, courseId),
    ]);

    this.learningManager.assertCourseExists(course);

    const metrics = this.learningManager.buildCourseMetrics(source);
    this.learningManager.assertReviewWritable(
      activeEnrollment,
      metrics.progressPercent,
    );

    await this.learningRepository.upsertCourseReview({
      userId: data.userId,
      courseId,
      title: data.title,
      content: data.content,
      star: data.star,
    });
    await this.learningRepository.refreshCourseRating(courseId);

    const reviews = await this.learningRepository.getCourseReviews(courseId);
    return this.learningManager.toCourseReviews(reviews);
  }
}
