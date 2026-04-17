import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  CancellationReason,
  PaymentProvider,
} from '../../../prisma/generated/prisma/enums';

export class UserIdQueryRequest {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  userId: number;
}

export class AddCartItemRequest {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  userId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 3 })
  courseId: number;
}

export class CheckoutCartRequest {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  userId: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @ApiProperty({ example: [1, 2] })
  cartItemIds: number[];

  @IsOptional()
  @IsEnum(PaymentProvider)
  @ApiPropertyOptional({
    enum: PaymentProvider,
    enumName: 'PaymentProvider',
    example: PaymentProvider.TOSS,
  })
  provider?: PaymentProvider;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @ApiPropertyOptional({ example: 'toss-payment-key-demo' })
  paymentKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @ApiPropertyOptional({ example: 'toss-order-id-demo' })
  providerOrderId?: string;
}

export class CancelOrderRequest {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  userId: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @ApiPropertyOptional({ example: [11] })
  orderItemIds?: number[];

  @IsEnum(CancellationReason)
  @ApiProperty({
    enum: CancellationReason,
    enumName: 'CancellationReason',
    example: CancellationReason.USER_REQUEST,
  })
  reason: CancellationReason;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  @ApiPropertyOptional({ example: '학습 계획이 변경되었습니다.' })
  reasonDetail?: string;
}

export class CancelCourseRequest {
  @IsEnum(CancellationReason)
  @ApiProperty({
    enum: CancellationReason,
    enumName: 'CancellationReason',
    example: CancellationReason.UNDER_ENROLLED,
  })
  reason: CancellationReason;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  @ApiPropertyOptional({ example: '최소 개설 인원을 충족하지 못했습니다.' })
  note?: string;
}
