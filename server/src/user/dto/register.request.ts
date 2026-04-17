import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Roles } from '../../../prisma/generated/prisma/enums';
import { normalizeText } from '../../global/global.request-transform';

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

  @IsEnum(Roles)
  @ApiProperty({ enum: Roles, enumName: 'Roles', example: Roles.STUDENT })
  roles!: Roles;

  @IsOptional()
  @Transform(normalizeText)
  @IsString()
  @MaxLength(300)
  @ApiPropertyOptional({ example: '보안 입문 학습자입니다.' })
  description?: string;
}
