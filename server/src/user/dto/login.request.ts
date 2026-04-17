import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { normalizeText } from '../../global/global.request-transform';

export class LoginRequest {
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
}
