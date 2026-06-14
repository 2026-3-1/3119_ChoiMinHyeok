import { ApiProperty } from '@nestjs/swagger';

export class category {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Backend' })
  name: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-03-23T00:00:00.000Z',
  })
  created_at: Date;
}
