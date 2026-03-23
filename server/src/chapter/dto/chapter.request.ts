import { ApiProperty } from '@nestjs/swagger';

export class createChapter {
  @ApiProperty({ example: 'Introduction' })
  title: string;

  @ApiProperty({ example: 1 })
  courseId: number;

  @ApiProperty({ example: 1 })
  position: number;
}
