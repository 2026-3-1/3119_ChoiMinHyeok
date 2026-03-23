import { ApiProperty } from '@nestjs/swagger';

export class createLecture {
  @ApiProperty({ example: 'Welcome' })
  title: string;

  @ApiProperty({ example: 'https://cdn.example.com/lecture.mp4' })
  videoUrl: string;

  @ApiProperty({ example: 1 })
  chapterId: number;

  @ApiProperty({ example: 'https://cdn.example.com/lecture-thumbnail.png' })
  thumbnailUrl: string;

  @ApiProperty({ example: 1 })
  position: number;

  @ApiProperty({ example: 300 })
  duration: number;

  @ApiProperty({ example: true })
  isPublished: boolean;
}
