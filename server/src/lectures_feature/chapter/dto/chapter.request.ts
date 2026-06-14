import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { normalizeText } from '../../../global/global.request-transform';

export class createChapter {
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @ApiProperty({ example: 'Introduction' })
  title: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  courseId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  position: number;
}

export class updateChapter {
  @IsOptional()
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @ApiPropertyOptional({ example: 'Advanced Topics' })
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ example: 2 })
  position?: number;
}
