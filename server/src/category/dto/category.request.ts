import { ApiProperty } from '@nestjs/swagger';

export class createCategory {
  @ApiProperty({ example: 'Backend' })
  name: string;
}
