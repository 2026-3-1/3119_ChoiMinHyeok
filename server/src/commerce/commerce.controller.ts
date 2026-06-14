import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../global/global_decorator/decorator.roles';
import { ResponseMessage } from '../global/global_decorator/decorator.message';
import { SwaggerResponse } from '../global/global_decorator/decorator.swagger-response';
import { JwtAuthGuard } from '../global/guards/jwt-auth.guard';
import { RolesGuard } from '../global/guards/roles.guard';
import { CommerceService } from './commerce.service';
import {
  AddCartItemRequest,
  CancelCourseRequest,
  CancelOrderRequest,
  CheckoutCartRequest,
  TossConfirmRequest,
  TossPrepareRequest,
  UserIdQueryRequest,
} from './dto/commerce.request';
import {
  CartSummaryResponse,
  CourseCancellationSummaryResponse,
  OrderResponse,
} from './dto/commerce.response';

@ApiTags('commerce')
@Controller('/api/v1')
export class CommerceController {
  constructor(private readonly commerceService: CommerceService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ResponseMessage('장바구니 조회에 성공했습니다.')
  @Get('cart')
  @ApiOperation({ summary: '사용자의 활성 장바구니를 조회합니다.' })
  @ApiQuery({ name: 'userId', type: Number, description: '사용자 ID' })
  @SwaggerResponse(CartSummaryResponse, false, 200, '장바구니 조회에 성공했습니다.')
  getCart(@Query() query: UserIdQueryRequest) {
    return this.commerceService.getCart(query.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ResponseMessage('장바구니 담기가 완료되었습니다.')
  @Post('cart/items')
  @HttpCode(201)
  @ApiOperation({ summary: '강의를 장바구니에 담습니다.' })
  @ApiBody({ type: AddCartItemRequest })
  @SwaggerResponse(CartSummaryResponse, false, 201, '장바구니 담기가 완료되었습니다.')
  addToCart(@Body() data: AddCartItemRequest) {
    return this.commerceService.addToCart(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ResponseMessage('장바구니 항목 삭제가 완료되었습니다.')
  @Delete('cart/items/:cartItemId')
  @ApiOperation({ summary: '장바구니 항목을 제거합니다.' })
  @ApiParam({ name: 'cartItemId', type: Number, description: '장바구니 항목 ID' })
  @ApiQuery({ name: 'userId', type: Number, description: '사용자 ID' })
  @SwaggerResponse(CartSummaryResponse, false, 200, '장바구니 항목 삭제가 완료되었습니다.')
  removeCartItem(
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
    @Query() query: UserIdQueryRequest,
  ) {
    return this.commerceService.removeCartItem(query.userId, cartItemId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ResponseMessage('장바구니 결제가 완료되었습니다.')
  @Post('orders/checkout')
  @HttpCode(201)
  @ApiOperation({ summary: '장바구니 강의 여러 개를 한 번에 결제합니다.' })
  @ApiBody({ type: CheckoutCartRequest })
  @SwaggerResponse(OrderResponse, false, 201, '장바구니 결제가 완료되었습니다.')
  checkoutCart(@Body() data: CheckoutCartRequest) {
    return this.commerceService.checkoutCart(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ResponseMessage('주문 내역 조회에 성공했습니다.')
  @Get('orders')
  @ApiOperation({ summary: '사용자의 주문/결제/환불 내역을 조회합니다.' })
  @ApiQuery({ name: 'userId', type: Number, description: '사용자 ID' })
  @SwaggerResponse(OrderResponse, true, 200, '주문 내역 조회에 성공했습니다.')
  getOrders(@Query() query: UserIdQueryRequest) {
    return this.commerceService.getOrders(query.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ResponseMessage('주문 취소 및 환불이 완료되었습니다.')
  @Post('orders/:orderId/cancel')
  @HttpCode(200)
  @ApiOperation({ summary: '주문 전체 또는 일부 강의를 환불 처리합니다.' })
  @ApiParam({ name: 'orderId', type: Number, description: '주문 ID' })
  @ApiBody({ type: CancelOrderRequest })
  @SwaggerResponse(OrderResponse, false, 200, '주문 취소 및 환불이 완료되었습니다.')
  cancelOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() data: CancelOrderRequest,
  ) {
    return this.commerceService.cancelOrder(orderId, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ResponseMessage('결제 준비가 완료되었습니다.')
  @Post('payments/toss/prepare')
  @HttpCode(200)
  @ApiOperation({ summary: '토스페이먼츠 결제 준비 - orderId/amount/orderName 반환' })
  @ApiBody({ type: TossPrepareRequest })
  prepareTossPayment(@Body() data: TossPrepareRequest) {
    return this.commerceService.prepareTossPayment(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ResponseMessage('결제가 완료되었습니다.')
  @Post('payments/toss/confirm')
  @HttpCode(201)
  @ApiOperation({ summary: '토스페이먼츠 결제 승인 - Toss API 검증 후 주문 생성' })
  @ApiBody({ type: TossConfirmRequest })
  @SwaggerResponse(OrderResponse, false, 201, '결제가 완료되었습니다.')
  confirmTossPayment(@Body() data: TossConfirmRequest) {
    return this.commerceService.confirmTossPayment(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR')
  @ResponseMessage('강의 취소 및 일괄 환불이 완료되었습니다.')
  @Post('courses/:courseId/cancel')
  @HttpCode(200)
  @ApiOperation({
    summary: '강의 취소 사유를 남기고 전체 수강생을 환불 처리합니다.',
  })
  @ApiParam({ name: 'courseId', type: Number, description: '강의 ID' })
  @ApiBody({ type: CancelCourseRequest })
  @SwaggerResponse(
    CourseCancellationSummaryResponse,
    false,
    200,
    '강의 취소 및 일괄 환불이 완료되었습니다.',
  )
  cancelCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() data: CancelCourseRequest,
  ) {
    return this.commerceService.cancelCourse(courseId, data);
  }
}
