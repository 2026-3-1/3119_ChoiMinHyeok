import { Injectable } from '@nestjs/common';
import {
  AddCartItemRequest,
  CancelCourseRequest,
  CancelOrderRequest,
  CheckoutCartRequest,
} from './dto/commerce.request';
import { CommerceManager } from './commerce.manager';
import { CommerceRepository } from './commerce.repository';

@Injectable()
export class CommerceService {
  constructor(
    private readonly commerceRepository: CommerceRepository,
    private readonly commerceManager: CommerceManager,
  ) {}

  async getCart(userId: number) {
    await this.commerceRepository.assertUserExists(userId);
    const items = await this.commerceRepository.getActiveCart(userId);
    return this.commerceManager.toCartSummary(items);
  }

  async addToCart(data: AddCartItemRequest) {
    await this.commerceRepository.assertUserExists(data.userId);

    const [course, existingActiveCartItem, activeEnrollment] = await Promise.all([
      this.commerceRepository.findCourseById(data.courseId),
      this.commerceRepository.findActiveCartItem(data.userId, data.courseId),
      this.commerceRepository.findActiveEnrollment(data.userId, data.courseId),
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

    const order = await this.commerceRepository.createPaidOrderFromCart({
      userId: data.userId,
      cartItems,
      provider: this.commerceManager.getProvider(data.provider),
      paymentKey: data.paymentKey,
      providerOrderId: data.providerOrderId,
      orderNumber: this.commerceManager.createOrderNumber(),
    });

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

    return this.commerceManager.toOrder(updatedOrder);
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
