import { ApiProperty } from '@nestjs/swagger';

export class EnrollmentResponse {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ example: 1 })
  courseId!: number;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  enrolledAt!: Date;
}
