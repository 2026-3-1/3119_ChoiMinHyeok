import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminDashboardResponse {
  @ApiProperty({ example: 320 })
  totalUsers!: number;

  @ApiProperty({ example: 45 })
  totalCourses!: number;

  @ApiProperty({ example: 1280 })
  totalEnrollments!: number;

  @ApiProperty({ example: 7 })
  pendingReports!: number;

  @ApiProperty({ example: 4500000 })
  totalRevenue!: number;
}

export class AdminUserResponse {
  @ApiProperty({ example: 3 })
  id!: number;

  @ApiProperty({ example: '홍길동' })
  name!: string;

  @ApiProperty({ example: 'hong@sec101.com' })
  email!: string;

  @ApiProperty({ example: 'INSTRUCTOR' })
  role!: string;

  @ApiProperty({ example: '2026-03-01T00:00:00.000Z' })
  createdAt!: Date;
}

export class AdminCourseResponse {
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

  @ApiProperty({ example: '2026-03-01T00:00:00.000Z' })
  createdAt!: Date;
}

export class AdminReportResponse {
  @ApiProperty({ example: 12 })
  id!: number;

  @ApiProperty({ example: 'COPYRIGHT' })
  type!: string;

  @ApiProperty({ example: '해당 영상은 유튜브 채널 XXX의 무단 복제본입니다.' })
  content!: string;

  @ApiProperty({ example: false })
  isResolved!: boolean;

  @ApiProperty({ example: 3 })
  courseId!: number;

  @ApiProperty({ example: 7 })
  userId!: number;

  @ApiProperty({ example: '2026-04-15T10:23:00.000Z' })
  createdAt!: Date;
}

export class PaginationMeta {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}

export class AdminUserListResponse {
  @ApiProperty({ type: [AdminUserResponse] })
  data!: AdminUserResponse[];

  @ApiPropertyOptional({ type: PaginationMeta })
  pagination?: PaginationMeta;
}
