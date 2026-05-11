import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateLectureCommentRequest {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  @ApiProperty({ example: '강의 내용 중 궁금한 점이 있습니다.' })
  content!: string;
}
