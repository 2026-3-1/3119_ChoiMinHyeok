import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class EnrollRequest {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1, description: '수강할 강의 ID' })
  courseId!: number;
}

export class EnrollUserQueryRequest {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1, description: '사용자 ID' })
  userId!: number;
}
