import { ApiProperty } from '@nestjs/swagger';
import { Roles } from '../../../prisma/generated/prisma/enums';

export class UserProfileResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '홍길동' })
  name: string;

  @ApiProperty({ example: 'student@example.com' })
  email: string;

  @ApiProperty({ enum: Roles, enumName: 'Roles', example: Roles.STUDENT })
  roles: Roles;

  @ApiProperty({ example: '보안 입문 학습자입니다.', nullable: true })
  description: string | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-04-14T00:00:00.000Z',
  })
  created_at: Date;
}
