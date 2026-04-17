import { ApiProperty } from '@nestjs/swagger';
import {
  CancellationReason,
  CourseLifecycleStatus,
  Difficulty,
} from '../../../../prisma/generated/prisma/enums';

export class course {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Node.js Basics' })
  title: string;

  @ApiProperty({ example: 'Introductory backend course' })
  description: string;

  @ApiProperty({ example: 1 })
  instructor_id: number;

  @ApiProperty({ example: 'https://cdn.example.com/course-thumbnail.png' })
  thumbnail: string;

  @ApiProperty({ enum: Difficulty, enumName: 'Difficulty', example: Difficulty.EASY })
  difficulty: Difficulty;

  @ApiProperty({ example: 1 })
  category_id: number;

  @ApiProperty({ example: 'nodejs-basics' })
  slug: string;

  @ApiProperty({ example: 39000 })
  price: number;

  @ApiProperty({ example: 4.5 })
  rating: number;

  @ApiProperty({ example: 30 })
  max_capacity: number;

  @ApiProperty({ example: 5 })
  min_enrollment: number;

  @ApiProperty({
    enum: CourseLifecycleStatus,
    enumName: 'CourseLifecycleStatus',
    example: CourseLifecycleStatus.OPEN,
  })
  status: CourseLifecycleStatus;

  @ApiProperty({
    enum: CancellationReason,
    enumName: 'CancellationReason',
    nullable: true,
    example: CancellationReason.UNDER_ENROLLED,
  })
  cancel_reason: CancellationReason | null;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-03-23T00:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-03-23T00:00:00.000Z' })
  updated_at: Date;
}

export class courseListData {
  @ApiProperty({ type: [course] })
  data: course[];

  @ApiProperty({ example: 42 })
  count: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;
}
