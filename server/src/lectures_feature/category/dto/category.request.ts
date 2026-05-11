import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { normalizeText } from '../../../global/global.request-transform';

export class createCategory {
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @ApiProperty({ example: 'Backend' })
  name!: string;
}

export class updateCategory {
  @IsOptional()
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @ApiPropertyOptional({ example: 'Security' })
  name?: string;
}
