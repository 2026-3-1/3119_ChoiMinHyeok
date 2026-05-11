import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { normalizeText } from '../../global/global.request-transform';

export class UpdateProfileRequest {
  @IsOptional()
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  @ApiPropertyOptional({ example: '홍길동' })
  name?: string;

  @IsOptional()
  @Transform(normalizeText)
  @IsString()
  @MaxLength(300)
  @ApiPropertyOptional({ example: '웹 해킹 전문 강사입니다.' })
  description?: string;
}
