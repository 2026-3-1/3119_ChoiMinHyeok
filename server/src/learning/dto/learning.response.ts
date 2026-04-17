import { ApiProperty } from '@nestjs/swagger';
import {
  LecturePlaybackEventType,
  Roles,
} from '../../../prisma/generated/prisma/enums';

export class LearningCourseCardResponse {
  @ApiProperty({ example: 1 })
  courseId: number;

  @ApiProperty({ example: 'Web Security Foundations' })
  title: string;

  @ApiProperty({ example: 'https://cdn.example.com/course.png' })
  thumbnail: string;

  @ApiProperty({ example: 65 })
  progressPercent: number;

  @ApiProperty({ example: 2, nullable: true })
  lastLectureId: number | null;

  @ApiProperty({ example: 420, nullable: true })
  lastPosition: number | null;
}

export class CourseLearningStatusResponse {
  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 3 })
  courseId: number;

  @ApiProperty({ example: true })
  isEnrolled: boolean;

  @ApiProperty({ example: 82 })
  progressPercent: number;

  @ApiProperty({ example: 1900 })
  totalWatchedSeconds: number;

  @ApiProperty({ example: 5 })
  lectureCount: number;

  @ApiProperty({ example: 4, nullable: true })
  lastLectureId: number | null;

  @ApiProperty({ example: 315, nullable: true })
  lastPosition: number | null;

  @ApiProperty({ example: true })
  canWriteReview: boolean;

  @ApiProperty({ example: 3 })
  bookmarkCount: number;
}

export class LectureProgressResponse {
  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 5 })
  lectureId: number;

  @ApiProperty({ example: 315 })
  lastPosition: number;

  @ApiProperty({ example: 420 })
  watchedSeconds: number;

  @ApiProperty({ example: 84 })
  progress: number;

  @ApiProperty({ example: true })
  isCompleted: boolean;
}

export class PlaybackHistoryItemResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    enum: LecturePlaybackEventType,
    enumName: 'LecturePlaybackEventType',
    example: LecturePlaybackEventType.PROGRESS,
  })
  event_type: LecturePlaybackEventType;

  @ApiProperty({ example: 210 })
  from_second: number;

  @ApiProperty({ example: 315 })
  to_second: number;

  @ApiProperty({ example: 84 })
  progress: number;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-04-14T00:00:00.000Z',
  })
  created_at: Date;
}

export class LectureBookmarkResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 315 })
  position: number;

  @ApiProperty({ example: 'XSS 개념 정리 구간', nullable: true })
  note: string | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-04-14T00:00:00.000Z',
  })
  created_at: Date;
}

export class ReviewUserResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '홍길동' })
  name: string;

  @ApiProperty({ enum: Roles, enumName: 'Roles', example: Roles.STUDENT })
  roles: Roles;
}

export class CourseReviewResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '실무형 입문 강의였습니다.' })
  title: string;

  @ApiProperty({ example: '실습 흐름이 좋아서 끝까지 따라가기 쉬웠습니다.' })
  content: string;

  @ApiProperty({ example: 5 })
  star: number;

  @ApiProperty({ type: ReviewUserResponse })
  user: ReviewUserResponse;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-04-14T00:00:00.000Z',
  })
  created_at: Date;
}
