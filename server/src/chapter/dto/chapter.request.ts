import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { normalizeText } from 'src/global/request.transform';

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
