import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InstructorCourseResponse {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '웹 해킹 입문' })
  title!: string;

  @ApiProperty({ example: 'web-hacking-intro' })
  slug!: string;

  @ApiProperty({ example: 'EASY' })
  difficulty!: string;

  @ApiProperty({ example: 0 })
  price!: number;

  @ApiProperty({ example: 'OPEN' })
  status!: string;

  @ApiProperty({ example: 30 })
  maxCapacity!: number;

  @ApiProperty({ example: 4.5 })
  rating!: number;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;
}

export class InstructorChapterResponse {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'SQL Injection' })
  title!: string;

  @ApiProperty({ example: 2 })
  position!: number;
}

export class InstructorLectureResponse {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'SQL Injection 원리' })
  title!: string;

  @ApiProperty({ example: 'https://youtube.com/watch?v=...' })
  videoUrl!: string;

  @ApiProperty({ example: 1500 })
  duration!: number;

  @ApiProperty({ example: 1 })
  position!: number;

  @ApiProperty({ example: true })
  isPublished!: boolean;
}

export class InstructorStudentResponse {
  @ApiProperty({ example: 5 })
  userId!: number;

  @ApiProperty({ example: '홍길동' })
  name!: string;

  @ApiProperty({ example: 'student@example.com' })
  email!: string;

  @ApiProperty({ example: '2026-04-01T00:00:00.000Z' })
  enrolledAt!: Date;

  @ApiPropertyOptional({ example: 72 })
  progressAvg?: number;
}
