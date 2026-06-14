import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsUrl } from 'class-validator';
import { Roles } from '../global/global_decorator/decorator.roles';
import { JwtAuthGuard } from '../global/guards/jwt-auth.guard';
import { RolesGuard } from '../global/guards/roles.guard';
import { ResponseMessage } from '../global/global_decorator/decorator.message';
import { WebhookEvent, WebhookService } from './webhook.service';

class RegisterWebhookDto {
  @IsUrl({ require_protocol: true })
  url: string | undefined;

  @IsEnum([
    'order.completed',
    'order.canceled',
    'course.canceled',
    'enrollment.created',
  ])
  event: WebhookEvent | undefined;
}

@ApiTags('webhooks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('/api/v1/webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @ResponseMessage('Webhook 목록 조회 성공')
  @Get()
  @ApiOperation({ summary: 'Webhook 엔드포인트 목록 조회 (ADMIN)' })
  list() {
    return this.webhookService.listEndpoints();
  }

  @ResponseMessage('Webhook 등록 완료')
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Webhook 엔드포인트 등록 (ADMIN)' })
  @ApiBody({ type: RegisterWebhookDto })
  register(@Body() body: RegisterWebhookDto) {
    if (!body.url || !body.event) {
      return;
    }
    return this.webhookService.registerEndpoint(body.url, body.event);
  }

  @ResponseMessage('Webhook 삭제 완료')
  @Delete(':id')
  @ApiOperation({ summary: 'Webhook 엔드포인트 삭제 (ADMIN)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.webhookService.removeEndpoint(id);
  }
}
