import { ApiProperty } from '@nestjs/swagger';

export class ReportResponse {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  courseId!: number;

  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ example: 'COPYRIGHT' })
  type!: string;

  @ApiProperty({ example: '해당 영상은 무단 복제본입니다.' })
  content!: string;

  @ApiProperty({ example: false })
  isResolved!: boolean;

  @ApiProperty({ example: '2026-04-15T10:23:00.000Z' })
  createdAt!: Date;
}
