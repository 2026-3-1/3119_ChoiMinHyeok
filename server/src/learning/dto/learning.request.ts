import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { LecturePlaybackEventType } from '../../../prisma/generated/prisma/enums';
import { normalizeText } from '../../global/global.request-transform';

export class LearningUserQueryRequest {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  userId: number;
}

export class UpdateLectureProgressRequest {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  userId: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @ApiProperty({ example: 420 })
  lastPosition: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @ApiProperty({ example: 420 })
  watchedSeconds: number;

  @IsEnum(LecturePlaybackEventType)
  @ApiProperty({
    enum: LecturePlaybackEventType,
    enumName: 'LecturePlaybackEventType',
    example: LecturePlaybackEventType.PROGRESS,
  })
  eventType: LecturePlaybackEventType;
}

export class AddLectureBookmarkRequest {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  userId: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @ApiProperty({ example: 315 })
  position: number;

  @IsOptional()
  @Transform(normalizeText)
  @IsString()
  @MaxLength(120)
  @ApiPropertyOptional({ example: 'XSS 개념 정리 구간' })
  note?: string;
}

export class CreateCourseReviewRequest {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  userId: number;

  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @ApiProperty({ example: '실무형 입문 강의였습니다.' })
  title: string;

  @Transform(normalizeText)
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  @ApiProperty({ example: '실습 흐름이 좋아서 끝까지 따라가기 쉬웠습니다.' })
  content: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @ApiProperty({ example: 5 })
  star: number;
}
