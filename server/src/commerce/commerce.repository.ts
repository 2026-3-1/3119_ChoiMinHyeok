import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CancellationReason,
  CartItemStatus,
  EnrollmentHistoryType,
  EnrollmentStatus,
  OrderItemStatus,
  OrderStatus,
  PaymentProvider,
  PaymentTransactionStatus,
  PaymentTransactionType,
  Roles,
} from '../../prisma/generated/prisma/enums';
import type { Prisma } from '../../prisma/generated/prisma/client';
import prisma from '../../prisma/prisma.client';

export type CartItemWithCourse = Prisma.cart_itemsGetPayload<{
  include: {
    courses: true;
  };
}>;

export type OrderWithRelations = Prisma.ordersGetPayload<{
  include: {
    items: {
      include: {
        courses: true;
      };
    };
    payment_transactions: true;
  };
}>;

@Injectable()
export class CommerceRepository {
  async findUserById(userId: number) {
    return prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });
  }

  async assertUserExists(userId: number) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    if (user.role !== Roles.STUDENT) throw new ForbiddenException('학생 계정만 구매할 수 있습니다.');
  }

  findCourseById(courseId: number) {
    return prisma.courses.findUnique({
      where: {
        id: courseId,
      },
    });
  }

  getActiveCart(userId: number) {
    return prisma.cart_items.findMany({
      where: {
        user_id: userId,
        status: CartItemStatus.ACTIVE,
      },
      include: {
        courses: true,
      },
      orderBy: {
        added_at: 'desc',
      },
    });
  }

  findActiveCartItem(userId: number, courseId: number) {
    return prisma.cart_items.findFirst({
      where: {
        user_id: userId,
        course_id: courseId,
        status: CartItemStatus.ACTIVE,
      },
    });
  }

  findActiveCartItemById(userId: number, cartItemId: number) {
    return prisma.cart_items.findFirst({
      where: {
        id: cartItemId,
        user_id: userId,
        status: CartItemStatus.ACTIVE,
      },
    });
  }

  createCartItem(userId: number, courseId: number) {
    return prisma.cart_items.create({
      data: {
        user_id: userId,
        course_id: courseId,
      },
    });
  }

  markCartItemRemoved(cartItemId: number) {
    return prisma.cart_items.update({
      where: {
        id: cartItemId,
      },
      data: {
        status: CartItemStatus.REMOVED,
      },
    });
  }

  findActiveEnrollment(userId: number, courseId: number) {
    return prisma.enrollments.findFirst({
      where: {
        user_id: userId,
        course_id: courseId,
        status: EnrollmentStatus.ACTIVE,
      },
    });
  }

  findActiveEnrollmentsForCourses(userId: number, courseIds: number[]) {
    return prisma.enrollments.findMany({
      where: {
        user_id: userId,
        course_id: {
          in: courseIds,
        },
        status: EnrollmentStatus.ACTIVE,
      },
    });
  }

  getCheckoutCartItems(userId: number, cartItemIds: number[]) {
    return prisma.cart_items.findMany({
      where: {
        id: {
          in: cartItemIds,
        },
        user_id: userId,
        status: CartItemStatus.ACTIVE,
      },
      include: {
        courses: true,
      },
    });
  }

  async createPaidOrderFromCart(params: {
    userId: number;
    cartItems: CartItemWithCourse[];
    provider: PaymentProvider;
    paymentKey?: string;
    providerOrderId?: string;
    orderNumber: string;
  }) {
    const totalAmount = params.cartItems.reduce(
      (sum, cartItem) => sum + cartItem.courses.price,
      0,
    );

    const orderId = await prisma.$transaction(async (tx) => {
      const now = new Date();
      const order = await tx.orders.create({
        data: {
          user_id: params.userId,
          order_number: params.orderNumber,
          provider: params.provider,
          provider_order_id: params.providerOrderId,
          total_amount: totalAmount,
          paid_amount: totalAmount,
          status: OrderStatus.PAID,
          paid_at: now,
        },
      });

      for (const cartItem of params.cartItems) {
        const orderItem = await tx.order_items.create({
          data: {
            order_id: order.id,
            user_id: params.userId,
            course_id: cartItem.course_id,
            price: cartItem.courses.price,
            status: OrderItemStatus.ENROLLED,
            enrolled_at: now,
          },
        });

        const enrollment = await tx.enrollments.create({
          data: {
            user_id: params.userId,
            course_id: cartItem.course_id,
            order_item_id: orderItem.id,
            status: EnrollmentStatus.ACTIVE,
          },
        });

        await tx.enrollment_history.create({
          data: {
            enrollment_id: enrollment.id,
            user_id: params.userId,
            course_id: cartItem.course_id,
            event_type: EnrollmentHistoryType.ENROLLED,
            reason: '결제 완료 후 수강 등록',
          },
        });

        await tx.cart_items.update({
          where: {
            id: cartItem.id,
          },
          data: {
            status: CartItemStatus.CHECKED_OUT,
            checked_out_at: now,
          },
        });
      }

      await tx.payment_transactions.create({
        data: {
          order_id: order.id,
          user_id: params.userId,
          provider: params.provider,
          transaction_type: PaymentTransactionType.PAYMENT,
          status: PaymentTransactionStatus.COMPLETED,
          amount: totalAmount,
          payment_key: params.paymentKey,
          transaction_key: params.providerOrderId,
          approved_at: now,
          metadata: {
            cartItemIds: params.cartItems.map((cartItem) => cartItem.id),
          },
        },
      });

      return order.id;
    });

    return this.getOrderByIdForUser(orderId, params.userId);
  }

  getOrdersByUser(userId: number) {
    return prisma.orders.findMany({
      where: {
        user_id: userId,
      },
      include: {
        items: {
          include: {
            courses: true,
          },
          orderBy: {
            created_at: 'asc',
          },
        },
        payment_transactions: {
          orderBy: {
            created_at: 'asc',
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async getOrderByIdForUser(orderId: number, userId: number) {
    const order = await prisma.orders.findFirst({
      where: {
        id: orderId,
        user_id: userId,
      },
      include: {
        items: {
          include: {
            courses: true,
          },
          orderBy: {
            created_at: 'asc',
          },
        },
        payment_transactions: {
          orderBy: {
            created_at: 'asc',
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }

    return order;
  }

  async refundOrderItems(
    orderId: number,
    userId: number,
    orderItemIds: number[],
    reason: CancellationReason,
    reasonDetail?: string,
  ) {
    const order = await this.getOrderByIdForUser(orderId, userId);
    const targetItems = order.items.filter((item) => orderItemIds.includes(item.id));

    if (targetItems.length === 0) {
      throw new BadRequestException('환불 가능한 주문 항목이 없습니다.');
    }

    await prisma.$transaction(async (tx) => {
      await this.refundOrderItemsTx(
        tx,
        order.id,
        userId,
        targetItems.map((item) => ({
          id: item.id,
          price: item.price,
          status: item.status,
        })),
        reason,
        reasonDetail,
      );
    });

    return this.getOrderByIdForUser(orderId, userId);
  }

  async cancelCourseAndRefund(
    courseId: number,
    reason: CancellationReason,
    note?: string,
  ) {
    const course = await this.findCourseById(courseId);

    if (!course) {
      throw new NotFoundException('강의를 찾을 수 없습니다.');
    }

    const enrollments = await prisma.enrollments.findMany({
      where: {
        course_id: courseId,
        status: EnrollmentStatus.ACTIVE,
      },
      include: {
        order_item: true,
      },
    });

    const groupedByOrder = new Map<
      number,
      { userId: number; items: { id: number; price: number; status: OrderItemStatus }[] }
    >();

    enrollments.forEach((enrollment) => {
      if (!enrollment.order_item) {
        return;
      }

      const orderId = enrollment.order_item.order_id;
      const existing = groupedByOrder.get(orderId);

      if (existing) {
        existing.items.push({
          id: enrollment.order_item.id,
          price: enrollment.order_item.price,
          status: enrollment.order_item.status,
        });
        return;
      }

      groupedByOrder.set(orderId, {
        userId: enrollment.user_id,
        items: [
          {
            id: enrollment.order_item.id,
            price: enrollment.order_item.price,
            status: enrollment.order_item.status,
          },
        ],
      });
    });

    let refundedAmount = 0;

    await prisma.$transaction(async (tx) => {
      await tx.courses.update({
        where: {
          id: courseId,
        },
        data: {
          status: 'CANCELED',
          canceled_at: new Date(),
          cancel_reason: reason,
        },
      });

      for (const [orderId, group] of groupedByOrder.entries()) {
        refundedAmount += await this.refundOrderItemsTx(
          tx,
          orderId,
          group.userId,
          group.items,
          reason,
          note,
        );
      }
    });

    return {
      courseId,
      refundedEnrollmentCount: enrollments.length,
      refundedAmount,
    };
  }

  private async refundOrderItemsTx(
    tx: Prisma.TransactionClient,
    orderId: number,
    userId: number,
    items: { id: number; price: number; status: OrderItemStatus }[],
    reason: CancellationReason,
    reasonDetail?: string,
  ) {
    const refundableItems = items.filter(
      (item) => item.status === OrderItemStatus.ENROLLED,
    );

    if (refundableItems.length === 0) {
      throw new BadRequestException('환불 가능한 주문 항목이 없습니다.');
    }

    const order = await tx.orders.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }

    const now = new Date();
    const refundedAmount = refundableItems.reduce(
      (sum, item) => sum + item.price,
      0,
    );

    for (const item of refundableItems) {
      await tx.order_items.update({
        where: {
          id: item.id,
        },
        data: {
          status: OrderItemStatus.REFUNDED,
          canceled_at: now,
          refund_amount: item.price,
          cancellation_reason: reason,
        },
      });

      const enrollment = await tx.enrollments.findFirst({
        where: {
          order_item_id: item.id,
        },
      });

      if (enrollment) {
        await tx.enrollments.update({
          where: {
            id: enrollment.id,
          },
          data: {
            status: EnrollmentStatus.REFUNDED,
            is_canceled: true,
            canceled_at: now,
            cancellation_reason: reason,
          },
        });

        await tx.enrollment_history.create({
          data: {
            enrollment_id: enrollment.id,
            user_id: enrollment.user_id,
            course_id: enrollment.course_id,
            event_type: EnrollmentHistoryType.REFUNDED,
            reason: reasonDetail ?? reason,
          },
        });
      }
    }

    const remainingActiveItemCount = order.items.filter(
      (item) =>
        item.status === OrderItemStatus.ENROLLED &&
        !refundableItems.some((refundableItem) => refundableItem.id === item.id),
    ).length;

    await tx.orders.update({
      where: {
        id: orderId,
      },
      data: {
        status:
          remainingActiveItemCount === 0
            ? OrderStatus.REFUNDED
            : OrderStatus.PARTIALLY_REFUNDED,
        refunded_amount: order.refunded_amount + refundedAmount,
        canceled_at: remainingActiveItemCount === 0 ? now : order.canceled_at,
      },
    });

    await tx.payment_transactions.create({
      data: {
        order_id: orderId,
        user_id: userId,
        provider: order.provider,
        transaction_type: PaymentTransactionType.REFUND,
        status: PaymentTransactionStatus.COMPLETED,
        amount: refundedAmount,
        reason: reasonDetail ?? reason,
        approved_at: now,
        canceled_at: now,
        metadata: {
          orderItemIds: refundableItems.map((item) => item.id),
        },
      },
    });

    return refundedAmount;
  }
}
