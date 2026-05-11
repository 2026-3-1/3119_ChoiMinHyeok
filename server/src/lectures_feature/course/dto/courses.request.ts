import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Difficulty } from '../../../../prisma/generated/prisma/enums';
import {
  normalizeOptionalSearch,
  normalizeSlug,
  normalizeText,
} from '../../../global/global.request-transform';

export class createCourse {
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @ApiProperty({ example: 'Node.js Basics' })
  title!: string;

  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  @ApiProperty({ example: 'Introductory backend course' })
  description!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  instructorId!: number;

  @Transform(normalizeText)
  @IsUrl({ require_protocol: true }, { message: 'thumbnail must be a valid URL' })
  @ApiProperty({ example: 'https://cdn.example.com/course-thumbnail.png' })
  thumbnail!: string;

  @Transform(normalizeSlug)
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must use lowercase letters, numbers, and hyphens only',
  })
  @ApiProperty({ example: 'nodejs-basics' })
  slug!: string;

  @IsEnum(Difficulty)
  @ApiProperty({ enum: Difficulty, enumName: 'Difficulty', example: Difficulty.EASY })
  difficulty!: Difficulty;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  categoryId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @ApiProperty({ example: 39000 })
  price!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  @ApiProperty({ example: 30 })
  maxCapacity!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  @ApiProperty({ example: 5 })
  minEnrollment!: number;
}

export class updateCourse {
  @IsOptional()
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @ApiPropertyOptional({ example: 'Node.js Advanced' })
  title?: string;

  @IsOptional()
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  @ApiPropertyOptional({ example: 'Updated description' })
  description?: string;

  @IsOptional()
  @Transform(normalizeText)
  @IsUrl({ require_protocol: true }, { message: 'thumbnail must be a valid URL' })
  @ApiPropertyOptional({ example: 'https://cdn.example.com/new-thumbnail.png' })
  thumbnail?: string;

  @IsOptional()
  @IsEnum(Difficulty)
  @ApiPropertyOptional({ enum: Difficulty, enumName: 'Difficulty' })
  difficulty?: Difficulty;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ example: 2 })
  categoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ example: 49000 })
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  @ApiPropertyOptional({ example: 50 })
  maxCapacity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  @ApiPropertyOptional({ example: 3 })
  minEnrollment?: number;
}

export class getCourse {
  @IsOptional()
  @Transform(normalizeOptionalSearch)
  @IsString()
  @MaxLength(100)
  @Matches(/^[\p{L}\p{N}\s\-_.(),'"/:&+#]*$/u, {
    message: 'search contains unsupported characters',
  })
  @ApiPropertyOptional({ description: '검색어', example: 'web' })
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ description: '카테고리 ID', example: 1 })
  categoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ description: '페이지 번호', example: 1, default: 1 })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiPropertyOptional({ description: '페이지 크기', example: 10, default: 12 })
  limit: number = 12;
}
