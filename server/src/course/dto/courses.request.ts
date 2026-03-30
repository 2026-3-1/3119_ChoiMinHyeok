import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty } from 'prisma/generated/prisma/enums';

export class createCourse {
  @ApiProperty({ example: 'Node.js Basics' })
  title: string;

  @ApiProperty({ example: 'Introductory backend course' })
  description: string;

  @ApiProperty({ example: 1 })
  instructorId: number;

  @ApiProperty({ example: 'https://cdn.example.com/course-thumbnail.png' })
  thumbnail: string;

  @ApiProperty({ example: 'nodejs-basics' })
  slug: string;

  @ApiProperty({ enum: Difficulty, enumName: 'Difficulty', example: Difficulty.EASY })
  difficulty: Difficulty;

  @ApiProperty({ example: 1 })
  categoryId: number;
}

export class getCourse {
  @IsOptional()
  @IsString()
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
