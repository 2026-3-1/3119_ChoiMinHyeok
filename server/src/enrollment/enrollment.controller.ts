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
import { EnrollmentService } from './enrollment.service';
import { EnrollRequest, EnrollUserQueryRequest } from './dto/enrollment.request';
import { EnrollmentResponse } from './dto/enrollment.response';

@ApiTags('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT')
@Controller('/api/v1')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @ResponseMessage('수강 목록 조회에 성공했습니다.')
  @Get('enrollments')
  @ApiOperation({ summary: '내 수강 목록을 조회합니다.' })
  @ApiQuery({ name: 'userId', type: Number, description: '사용자 ID' })
  @SwaggerResponse(EnrollmentResponse, true, 200, '수강 목록 조회에 성공했습니다.')
  getMyEnrollments(@Query() query: EnrollUserQueryRequest) {
    return this.enrollmentService.getMyEnrollments(query.userId);
  }

  @ResponseMessage('수강 신청이 완료되었습니다.')
  @Post('enrollments')
  @HttpCode(201)
  @ApiOperation({ summary: '무료 강의를 수강 신청합니다.' })
  @ApiBody({ type: EnrollRequest })
  @SwaggerResponse(EnrollmentResponse, false, 201, '수강 신청이 완료되었습니다.')
  enroll(@Body() data: EnrollRequest, @Query() query: EnrollUserQueryRequest) {
    return this.enrollmentService.enroll(query.userId, data.courseId);
  }

  @ResponseMessage('수강 취소가 완료되었습니다.')
  @Delete('enrollments/:enrollmentId')
  @ApiOperation({ summary: '수강을 취소합니다.' })
  @ApiParam({ name: 'enrollmentId', type: Number, description: '수강 ID' })
  @ApiQuery({ name: 'userId', type: Number, description: '사용자 ID' })
  @SwaggerResponse(null, false, 200, '수강 취소가 완료되었습니다.')
  cancelEnrollment(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @Query() query: EnrollUserQueryRequest,
  ) {
    return this.enrollmentService.cancelEnrollment(query.userId, enrollmentId);
  }
}
