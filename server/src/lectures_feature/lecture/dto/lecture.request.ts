import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  normalizeText,
  toBooleanValue,
} from '../../../global/global.request-transform';

export class createLecture {
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @ApiProperty({ example: 'Welcome' })
  title: string;

  @Transform(normalizeText)
  @IsUrl({ require_protocol: true }, { message: 'videoUrl must be a valid URL' })
  @ApiProperty({ example: 'https://cdn.example.com/lecture.mp4' })
  videoUrl: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  chapterId: number;

  @Transform(normalizeText)
  @IsUrl(
    { require_protocol: true },
    { message: 'thumbnailUrl must be a valid URL' },
  )
  @ApiProperty({ example: 'https://cdn.example.com/lecture-thumbnail.png' })
  thumbnailUrl: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  position: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(86400)
  @ApiProperty({ example: 300 })
  duration: number;

  @Transform(toBooleanValue)
  @IsBoolean()
  @ApiProperty({ example: true })
  isPublished: boolean;
}
