import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentProvider } from '../../prisma/generated/prisma/enums';
import { NotificationService } from '../notification/notification.service';
import { WebhookService } from '../webhook/webhook.service';
import {
  AddCartItemRequest,
  CancelCourseRequest,
  CancelOrderRequest,
  CheckoutCartRequest,
  TossConfirmRequest,
  TossPrepareRequest,
} from './dto/commerce.request';
import { CommerceManager } from './commerce.manager';
import { CommerceRepository } from './commerce.repository';
import { TossPaymentService } from './toss-payment.service';

@Injectable()
export class CommerceService {
  constructor(
    private readonly commerceRepository: CommerceRepository,
    private readonly commerceManager: CommerceManager,
    private readonly notificationService: NotificationService,
    private readonly webhookService: WebhookService,
    private readonly tossPaymentService: TossPaymentService,
  ) {}

  async getCart(userId: number) {
    await this.commerceRepository.assertUserExists(userId);
    const items = await this.commerceRepository.getActiveCart(userId);
    return this.commerceManager.toCartSummary(items);
  }

  async addToCart(data: AddCartItemRequest) {
    await this.commerceRepository.assertUserExists(data.userId);

    const [course, existingActiveCartItem, activeEnrollment] =
      await Promise.all([
        this.commerceRepository.findCourseById(data.courseId),
        this.commerceRepository.findActiveCartItem(data.userId, data.courseId),
        this.commerceRepository.findActiveEnrollment(
          data.userId,
          data.courseId,
        ),
      ]);

    this.commerceManager.assertCourseExists(course);
    const targetCourse = course!;
    this.commerceManager.assertCourseOpen(targetCourse);
    this.commerceManager.assertEnrollmentAbsent(activeEnrollment);
    this.commerceManager.assertCartItemAbsent(existingActiveCartItem);

    await this.commerceRepository.createCartItem(data.userId, data.courseId);
    return this.getCart(data.userId);
  }

  async removeCartItem(userId: number, cartItemId: number) {
    await this.commerceRepository.assertUserExists(userId);
    const cartItem = await this.commerceRepository.findActiveCartItemById(
      userId,
      cartItemId,
    );

    this.commerceManager.assertCartItemExists(cartItem);
    await this.commerceRepository.markCartItemRemoved(cartItemId);
    return this.getCart(userId);
  }

  async checkoutCart(data: CheckoutCartRequest) {
    await this.commerceRepository.assertUserExists(data.userId);

    const cartItems = await this.commerceRepository.getCheckoutCartItems(
      data.userId,
      data.cartItemIds,
    );

    this.commerceManager.assertCheckoutCartItemsFound(
      cartItems,
      data.cartItemIds,
    );
    this.commerceManager.assertCoursesPurchasable(cartItems);

    const activeEnrollments =
      await this.commerceRepository.findActiveEnrollmentsForCourses(
        data.userId,
        cartItems.map((item) => item.course_id),
      );

    this.commerceManager.assertNoDuplicatePurchasedCourses(activeEnrollments);

    const [order, user] = await Promise.all([
      this.commerceRepository.createPaidOrderFromCart({
        userId: data.userId,
        cartItems,
        provider: this.commerceManager.getProvider(data.provider),
        paymentKey: data.paymentKey,
        providerOrderId: data.providerOrderId,
        orderNumber: this.commerceManager.createOrderNumber(),
      }),
      this.commerceRepository.findUserById(data.userId),
    ]);

    if (user) {
      void this.webhookService.dispatch('order.completed', {
        orderId: order.id,
        orderNumber: order.order_number,
        userId: data.userId,
        totalAmount: cartItems.reduce(
          (sum, item) => sum + item.courses.price,
          0,
        ),
        courses: cartItems.map((item) => ({
          id: item.course_id,
          title: item.courses.title,
        })),
      });
      void this.notificationService.notifyPurchaseComplete({
        userName: user.name,
        userEmail: user.email,
        orderNumber: order.order_number,
        courses: cartItems.map((item) => ({
          title: item.courses.title,
          price: item.courses.price,
        })),
        totalAmount: cartItems.reduce(
          (sum, item) => sum + item.courses.price,
          0,
        ),
      });
    }

    return this.commerceManager.toOrder(order);
  }

  async getOrders(userId: number) {
    await this.commerceRepository.assertUserExists(userId);
    const orders = await this.commerceRepository.getOrdersByUser(userId);
    return orders.map((order) => this.commerceManager.toOrder(order));
  }

  async cancelOrder(orderId: number, data: CancelOrderRequest) {
    await this.commerceRepository.assertUserExists(data.userId);
    const order = await this.commerceRepository.getOrderByIdForUser(
      orderId,
      data.userId,
    );
    const orderItemIds = this.commerceManager.resolveRefundItemIds(
      order,
      data.orderItemIds,
    );
    const updatedOrder = await this.commerceRepository.refundOrderItems(
      orderId,
      data.userId,
      orderItemIds,
      data.reason,
      data.reasonDetail,
    );

    void this.webhookService.dispatch('order.canceled', {
      orderId,
      userId: data.userId,
      reason: data.reason,
    });
    return this.commerceManager.toOrder(updatedOrder);
  }

  async prepareTossPayment(data: TossPrepareRequest) {
    await this.commerceRepository.assertUserExists(data.userId);

    const cartItems = await this.commerceRepository.getCheckoutCartItems(
      data.userId,
      data.cartItemIds,
    );

    this.commerceManager.assertCheckoutCartItemsFound(
      cartItems,
      data.cartItemIds,
    );
    this.commerceManager.assertCoursesPurchasable(cartItems);

    const activeEnrollments =
      await this.commerceRepository.findActiveEnrollmentsForCourses(
        data.userId,
        cartItems.map((item) => item.course_id),
      );
    this.commerceManager.assertNoDuplicatePurchasedCourses(activeEnrollments);

    const orderId = this.commerceManager.createOrderNumber();
    const amount = cartItems.reduce((sum, item) => sum + item.courses.price, 0);
    const orderName =
      cartItems.length === 1
        ? cartItems[0].courses.title
        : `${cartItems[0].courses.title} 외 ${cartItems.length - 1}개`;

    return { orderId, orderName, amount };
  }

  async confirmTossPayment(data: TossConfirmRequest) {
    await this.commerceRepository.assertUserExists(data.userId);

    await this.tossPaymentService.confirmPayment(
      data.paymentKey,
      data.orderId,
      data.amount,
    );

    const cartItems = await this.commerceRepository.getCheckoutCartItems(
      data.userId,
      data.cartItemIds,
    );

    this.commerceManager.assertCheckoutCartItemsFound(
      cartItems,
      data.cartItemIds,
    );
    this.commerceManager.assertCoursesPurchasable(cartItems);

    const expectedAmount = cartItems.reduce(
      (sum, item) => sum + item.courses.price,
      0,
    );
    if (expectedAmount !== data.amount) {
      throw new BadRequestException('결제 금액이 일치하지 않습니다.');
    }

    const activeEnrollments =
      await this.commerceRepository.findActiveEnrollmentsForCourses(
        data.userId,
        cartItems.map((item) => item.course_id),
      );
    this.commerceManager.assertNoDuplicatePurchasedCourses(activeEnrollments);

    const [order, user] = await Promise.all([
      this.commerceRepository.createPaidOrderFromCart({
        userId: data.userId,
        cartItems,
        provider: PaymentProvider.TOSS,
        paymentKey: data.paymentKey,
        providerOrderId: data.orderId,
        orderNumber: data.orderId,
      }),
      this.commerceRepository.findUserById(data.userId),
    ]);

    if (user) {
      void this.webhookService.dispatch('order.completed', {
        orderId: order.id,
        orderNumber: order.order_number,
        userId: data.userId,
        totalAmount: data.amount,
        courses: cartItems.map((item) => ({
          id: item.course_id,
          title: item.courses.title,
        })),
      });
      void this.notificationService.notifyPurchaseComplete({
        userName: user.name,
        userEmail: user.email,
        orderNumber: order.order_number,
        courses: cartItems.map((item) => ({
          title: item.courses.title,
          price: item.courses.price,
        })),
        totalAmount: data.amount,
      });
    }

    return this.commerceManager.toOrder(order);
  }

  async cancelCourse(courseId: number, data: CancelCourseRequest) {
    this.commerceManager.assertCourseCancellationReason(data.reason);
    return this.commerceRepository.cancelCourseAndRefund(
      courseId,
      data.reason,
      data.note,
    );
  }
}
