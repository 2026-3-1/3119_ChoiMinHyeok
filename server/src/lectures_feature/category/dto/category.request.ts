import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { normalizeText } from '../../../global/global.request-transform';

export class createCategory {
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @ApiProperty({ example: 'Backend' })
  name!: string;
}
