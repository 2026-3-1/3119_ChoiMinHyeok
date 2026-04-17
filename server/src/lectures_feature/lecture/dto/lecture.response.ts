import { ApiProperty } from '@nestjs/swagger';

export class lecture {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  chapter_id: number;

  @ApiProperty({ example: 'Welcome' })
  title: string;

  @ApiProperty({ example: 'https://cdn.example.com/lecture.mp4' })
  video_url: string;

  @ApiProperty({ example: 'https://cdn.example.com/lecture-thumbnail.png' })
  thumbnail_url: string;

  @ApiProperty({ example: 300 })
  duration: number;

  @ApiProperty({ example: 1 })
  position: number;

  @ApiProperty({ example: true })
  is_published: boolean;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-03-23T00:00:00.000Z' })
  created_at: Date;
}

export class lectureDetail {
  @ApiProperty({ type: lecture })
  lecture: lecture;

  @ApiProperty({ nullable: true, example: 2 })
  nextLecture: number | null;

  @ApiProperty({ nullable: true, example: null })
  prevLecture: number | null;
}
