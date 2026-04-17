import { ApiProperty } from '@nestjs/swagger';

export class chapter {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  course_id: number;

  @ApiProperty({ example: 'Introduction' })
  title: string;

  @ApiProperty({ example: 1 })
  position: number;
}
