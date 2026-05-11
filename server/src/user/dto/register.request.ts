import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { normalizeText } from '../../global/global.request-transform';

const VALID_ROLES = ['STUDENT', 'INSTRUCTOR'] as const;
type RegisterRole = (typeof VALID_ROLES)[number];

export class RegisterRequest {
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  @ApiProperty({ example: '홍길동' })
  name!: string;

  @Transform(normalizeText)
  @IsEmail()
  @MaxLength(120)
  @ApiProperty({ example: 'student@example.com' })
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @ApiProperty({ example: 'password123!' })
  password!: string;

  @IsIn(VALID_ROLES)
  @ApiProperty({ enum: VALID_ROLES, example: 'STUDENT' })
  role!: RegisterRole;

  @IsOptional()
  @Transform(normalizeText)
  @IsString()
  @MaxLength(300)
  @ApiPropertyOptional({ example: '보안 입문 학습자입니다.' })
  description?: string;
}
