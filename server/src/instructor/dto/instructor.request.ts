import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Difficulty } from '../../../prisma/generated/prisma/enums';
import { normalizeText } from '../../global/global.request-transform';

export class CreateInstructorCourseRequest {
  @Transform(normalizeText)
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @ApiProperty({ example: '웹 해킹 기초' })
  title!: string;

  @Transform(normalizeText)
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  @ApiProperty({ example: '웹 해킹의 기초를 배우는 강의입니다.' })
  description!: string;

  @IsEnum(Difficulty)
  @ApiProperty({
    enum: Difficulty,
    enumName: 'Difficulty',
    example: Difficulty.EASY,
  })
  difficulty!: Difficulty;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @ApiProperty({ example: 39000 })
  price!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  categoryId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  @ApiProperty({ example: 30 })
  maxCapacity!: number;

  @IsOptional()
  @Transform(normalizeText)
  @IsUrl({ require_protocol: true })
  @ApiPropertyOptional({ example: 'https://cdn.example.com/thumb.png' })
  thumbnail?: string;
}

export class UpdateCourseRequest {
  @IsOptional()
  @Transform(normalizeText)
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @ApiPropertyOptional({ example: '웹 해킹 심화' })
  title?: string;

  @IsOptional()
  @Transform(normalizeText)
  @IsString()
  @MinLength(10)
  @ApiPropertyOptional({ example: '상세 설명...' })
  description?: string;

  @IsOptional()
  @IsEnum(Difficulty)
  @ApiPropertyOptional({ enum: Difficulty, enumName: 'Difficulty' })
  difficulty?: Difficulty;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ example: 9900 })
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  @ApiPropertyOptional({ example: 50 })
  maxCapacity?: number;

  @IsOptional()
  @Transform(normalizeText)
  @IsUrl({ require_protocol: true })
  @ApiPropertyOptional({ example: 'https://cdn.example.com/thumbnail.png' })
  thumbnail?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ example: 2 })
  categoryId?: number;
}

export class CreateChapterRequest {
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @ApiProperty({ example: 'SQL Injection' })
  title!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  position!: number;
}

export class UpdateChapterRequest {
  @IsOptional()
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @ApiPropertyOptional({ example: 'SQL Injection 심화' })
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ example: 2 })
  position?: number;
}

export class CreateLectureRequest {
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @ApiProperty({ example: 'SQL Injection 원리' })
  title!: string;

  @Transform(normalizeText)
  @IsUrl({ require_protocol: true })
  @ApiProperty({ example: 'https://youtube.com/watch?v=...' })
  videoUrl!: string;

  @IsOptional()
  @Transform(normalizeText)
  @IsUrl({ require_protocol: true })
  @ApiPropertyOptional({ example: 'https://cdn.example.com/thumb.png' })
  thumbnailUrl?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1500, description: '재생 시간 (초)' })
  duration!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  position!: number;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: true })
  isPublished?: boolean;
}

export class UpdateLectureRequest {
  @IsOptional()
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @ApiPropertyOptional({ example: 'SQL Injection 원리 (수정)' })
  title?: string;

  @IsOptional()
  @Transform(normalizeText)
  @IsUrl({ require_protocol: true })
  @ApiPropertyOptional({ example: 'https://youtube.com/watch?v=...' })
  videoUrl?: string;

  @IsOptional()
  @Transform(normalizeText)
  @IsUrl({ require_protocol: true })
  @ApiPropertyOptional({ example: 'https://cdn.example.com/thumb.png' })
  thumbnailUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ example: 1800 })
  duration?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ example: 2 })
  position?: number;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: true })
  isPublished?: boolean;
}
