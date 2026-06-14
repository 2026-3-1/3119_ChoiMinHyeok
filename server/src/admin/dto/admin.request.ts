import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  normalizeOptionalSearch,
  toBooleanValue,
} from '../../global/global.request-transform';
import { Roles, ReportType } from '../../../prisma/generated/prisma/enums';

export class AdminUserQueryRequest {
  @IsOptional()
  @Transform(normalizeOptionalSearch)
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional({ description: '이름 또는 이메일 검색' })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: '역할 필터 (STUDENT / INSTRUCTOR / ADMIN)',
  })
  role?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ default: 1 })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ default: 20 })
  limit: number = 20;
}

export class AdminCourseQueryRequest {
  @IsOptional()
  @Transform(normalizeOptionalSearch)
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional({ description: '강의 제목 검색' })
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ description: '카테고리 ID' })
  categoryId?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: '상태 (OPEN / CANCELED)' })
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ default: 1 })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ default: 20 })
  limit: number = 20;
}

export class AdminReportQueryRequest {
  @IsOptional()
  @Transform(toBooleanValue)
  @IsBoolean()
  @ApiPropertyOptional({ description: '처리 여부 필터' })
  isResolved?: boolean;

  @IsOptional()
  @IsEnum(ReportType)
  @ApiPropertyOptional({ enum: ReportType, enumName: 'ReportType' })
  type?: ReportType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ default: 1 })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ default: 20 })
  limit: number = 20;
}

export class ResolveReportRequest {
  @IsBoolean()
  @ApiPropertyOptional({ example: true })
  isResolved!: boolean;
}

export class ChangeRoleRequest {
  @IsEnum(Roles)
  @ApiProperty({ enum: Roles, enumName: 'Roles', example: 'STUDENT' })
  role!: Roles;
}
