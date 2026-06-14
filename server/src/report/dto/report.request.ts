import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsString, MinLength, Min } from 'class-validator';
import { ReportType } from '../../../prisma/generated/prisma/enums';
import { normalizeText } from '../../global/global.request-transform';

export class CreateReportRequest {
  @IsEnum(ReportType)
  @ApiProperty({
    enum: ReportType,
    enumName: 'ReportType',
    example: 'COPYRIGHT',
  })
  type!: ReportType;

  @Transform(normalizeText)
  @IsString()
  @MinLength(10)
  @ApiProperty({ example: '해당 영상은 유튜브 채널 XXX의 무단 복제본입니다.' })
  content!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1, description: '신고하는 사용자 ID' })
  userId!: number;
}
