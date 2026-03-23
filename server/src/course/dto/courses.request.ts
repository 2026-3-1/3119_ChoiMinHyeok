import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
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
  @ApiPropertyOptional({ description: '검색어', example: 'web' })
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ description: '카테고리 ID', example: 1 })
  categoryId?: number;

  @Type(() => Number)
  @ApiProperty({ description: '페이지 번호', example: 1 })
  page: number;

  @Type(() => Number)
  @ApiProperty({ description: '페이지 크기', example: 10 })
  limit: number;
}
