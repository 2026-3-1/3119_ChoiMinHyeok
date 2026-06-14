import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CancellationReason,
  EnrollmentStatus,
  OrderItemStatus,
  PaymentProvider,
} from '../../prisma/generated/prisma/enums';
import type {
  CartItemWithCourse,
  OrderWithRelations,
} from './commerce.repository';

@Injectable()
export class CommerceManager {
  assertCourseExists(
    course: {
      id: number;
      status: string;
    } | null,
  ) {
    if (!course) {
      throw new NotFoundException('강의를 찾을 수 없습니다.');
    }
  }

  assertCourseOpen(course: { status: string }) {
    if (course.status !== 'OPEN') {
      throw new BadRequestException('취소된 강의는 처리할 수 없습니다.');
    }
  }

  assertCartItemAbsent(cartItem: { id: number } | null) {
    if (cartItem) {
      throw new BadRequestException('이미 장바구니에 담긴 강의입니다.');
    }
  }

  assertEnrollmentAbsent(
    enrollment: { id: number; status?: EnrollmentStatus } | null,
  ) {
    if (enrollment) {
      throw new BadRequestException('이미 수강 중인 강의입니다.');
    }
  }

  assertCartItemExists(cartItem: { id: number } | null) {
    if (!cartItem) {
      throw new NotFoundException('장바구니 항목을 찾을 수 없습니다.');
    }
  }

  assertCheckoutCartItemsFound(
    cartItems: CartItemWithCourse[],
    requestedCartItemIds: number[],
  ) {
    if (cartItems.length !== requestedCartItemIds.length) {
      throw new BadRequestException(
        '결제할 장바구니 항목을 정확히 찾지 못했습니다.',
      );
    }
  }

  assertCoursesPurchasable(cartItems: CartItemWithCourse[]) {
    if (cartItems.some((item) => item.courses.status !== 'OPEN')) {
      throw new BadRequestException('취소된 강의는 결제할 수 없습니다.');
    }
  }

  assertNoDuplicatePurchasedCourses(enrollments: { id: number }[]) {
    if (enrollments.length > 0) {
      throw new BadRequestException('이미 구매한 강의가 포함되어 있습니다.');
    }
  }

  createOrderNumber() {
    const now = new Date();
    const datePart = `${now.getFullYear()}${`${now.getMonth() + 1}`.padStart(2, '0')}${`${now.getDate()}`.padStart(2, '0')}`;
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `ORD-${datePart}-${randomPart}`;
  }

  resolveRefundItemIds(
    order: OrderWithRelations,
    requestedOrderItemIds?: number[],
  ) {
    const targetItems = requestedOrderItemIds?.length
      ? order.items.filter((item) => requestedOrderItemIds.includes(item.id))
      : order.items.filter((item) => item.status === OrderItemStatus.ENROLLED);

    if (targetItems.length === 0) {
      throw new BadRequestException('환불 가능한 주문 항목이 없습니다.');
    }

    return targetItems.map((item) => item.id);
  }

  assertCourseCancellationReason(reason: CancellationReason) {
    const allowedReasons: CancellationReason[] = [
      CancellationReason.COURSE_CANCELED,
      CancellationReason.CAPACITY_EXCEEDED,
      CancellationReason.UNDER_ENROLLED,
      CancellationReason.OTHER,
    ];

    if (!allowedReasons.includes(reason)) {
      throw new BadRequestException(
        '강의 취소 사유는 강의 취소/정원 초과/인원 미달/기타만 사용할 수 있습니다.',
      );
    }
  }

  getProvider(provider?: PaymentProvider) {
    return provider ?? PaymentProvider.TOSS;
  }

  toCartSummary(items: CartItemWithCourse[]) {
    return {
      items: items.map((item) => ({
        id: item.id,
        status: item.status,
        added_at: item.added_at,
        course: {
          id: item.courses.id,
          title: item.courses.title,
          slug: item.courses.slug,
          price: item.courses.price,
          thumbnail: item.courses.thumbnail,
        },
      })),
      totalCount: items.length,
      totalAmount: items.reduce((sum, item) => sum + item.courses.price, 0),
    };
  }

  toOrder(order: OrderWithRelations) {
    return {
      id: order.id,
      order_number: order.order_number,
      provider: order.provider,
      status: order.status,
      total_amount: order.total_amount,
      paid_amount: order.paid_amount,
      refunded_amount: order.refunded_amount,
      items: order.items.map((item) => ({
        id: item.id,
        status: item.status,
        price: item.price,
        refund_amount: item.refund_amount,
        cancellation_reason: item.cancellation_reason,
        enrolled_at: item.enrolled_at,
        course: {
          id: item.courses.id,
          title: item.courses.title,
          slug: item.courses.slug,
          price: item.courses.price,
          thumbnail: item.courses.thumbnail,
        },
      })),
      payment_transactions: order.payment_transactions.map((transaction) => ({
        id: transaction.id,
        provider: transaction.provider,
        transaction_type: transaction.transaction_type,
        status: transaction.status,
        amount: transaction.amount,
        payment_key: transaction.payment_key,
        reason: transaction.reason,
        created_at: transaction.created_at,
      })),
      created_at: order.created_at,
    };
  }
}
