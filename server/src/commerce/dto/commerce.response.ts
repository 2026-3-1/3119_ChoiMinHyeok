import { ApiProperty } from '@nestjs/swagger';
import {
  CancellationReason,
  CartItemStatus,
  OrderItemStatus,
  OrderStatus,
  PaymentProvider,
  PaymentTransactionStatus,
  PaymentTransactionType,
} from '../../../prisma/generated/prisma/enums';

export class CommerceCourseResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Web Security Foundations' })
  title: string;

  @ApiProperty({ example: 'seed-web-foundations' })
  slug: string;

  @ApiProperty({ example: 39000 })
  price: number;

  @ApiProperty({ example: 'https://cdn.example.com/course.png' })
  thumbnail: string;
}

export class CartItemResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    enum: CartItemStatus,
    enumName: 'CartItemStatus',
    example: CartItemStatus.ACTIVE,
  })
  status: CartItemStatus;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-04-14T00:00:00.000Z',
  })
  added_at: Date;

  @ApiProperty({ type: CommerceCourseResponse })
  course: CommerceCourseResponse;
}

export class CartSummaryResponse {
  @ApiProperty({ type: [CartItemResponse] })
  items: CartItemResponse[];

  @ApiProperty({ example: 2 })
  totalCount: number;

  @ApiProperty({ example: 78000 })
  totalAmount: number;
}

export class PaymentTransactionResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    enum: PaymentProvider,
    enumName: 'PaymentProvider',
    example: PaymentProvider.TOSS,
  })
  provider: PaymentProvider;

  @ApiProperty({
    enum: PaymentTransactionType,
    enumName: 'PaymentTransactionType',
    example: PaymentTransactionType.PAYMENT,
  })
  transaction_type: PaymentTransactionType;

  @ApiProperty({
    enum: PaymentTransactionStatus,
    enumName: 'PaymentTransactionStatus',
    example: PaymentTransactionStatus.COMPLETED,
  })
  status: PaymentTransactionStatus;

  @ApiProperty({ example: 78000 })
  amount: number;

  @ApiProperty({ example: 'toss-payment-key-demo', nullable: true })
  payment_key: string | null;

  @ApiProperty({ example: '학습 계획이 변경되었습니다.', nullable: true })
  reason: string | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-04-14T00:00:00.000Z',
  })
  created_at: Date;
}

export class OrderItemResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    enum: OrderItemStatus,
    enumName: 'OrderItemStatus',
    example: OrderItemStatus.ENROLLED,
  })
  status: OrderItemStatus;

  @ApiProperty({ example: 39000 })
  price: number;

  @ApiProperty({ example: 0 })
  refund_amount: number;

  @ApiProperty({
    enum: CancellationReason,
    enumName: 'CancellationReason',
    example: CancellationReason.USER_REQUEST,
    nullable: true,
  })
  cancellation_reason: CancellationReason | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-04-14T00:00:00.000Z',
    nullable: true,
  })
  enrolled_at: Date | null;

  @ApiProperty({ type: CommerceCourseResponse })
  course: CommerceCourseResponse;
}

export class OrderResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'ORD-20260414-AB12CD' })
  order_number: string;

  @ApiProperty({
    enum: PaymentProvider,
    enumName: 'PaymentProvider',
    example: PaymentProvider.TOSS,
  })
  provider: PaymentProvider;

  @ApiProperty({
    enum: OrderStatus,
    enumName: 'OrderStatus',
    example: OrderStatus.PAID,
  })
  status: OrderStatus;

  @ApiProperty({ example: 78000 })
  total_amount: number;

  @ApiProperty({ example: 78000 })
  paid_amount: number;

  @ApiProperty({ example: 0 })
  refunded_amount: number;

  @ApiProperty({ type: [OrderItemResponse] })
  items: OrderItemResponse[];

  @ApiProperty({ type: [PaymentTransactionResponse] })
  payment_transactions: PaymentTransactionResponse[];

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-04-14T00:00:00.000Z',
  })
  created_at: Date;
}

export class CourseCancellationSummaryResponse {
  @ApiProperty({ example: 1 })
  courseId: number;

  @ApiProperty({ example: 4 })
  refundedEnrollmentCount: number;

  @ApiProperty({ example: 156000 })
  refundedAmount: number;
}
