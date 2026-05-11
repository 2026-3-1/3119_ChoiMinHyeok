import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseMessage } from '../global/global_decorator/decorator.message';
import { SwaggerResponse } from '../global/global_decorator/decorator.swagger-response';
import { ReportService } from './report.service';
import { CreateReportRequest } from './dto/report.request';
import { ReportResponse } from './dto/report.response';

@ApiTags('reports')
@Controller('/api/v1')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @ResponseMessage('신고가 접수되었습니다.')
  @Post('courses/:courseId/reports')
  @HttpCode(201)
  @ApiOperation({ summary: '강의를 신고합니다.' })
  @ApiParam({ name: 'courseId', type: Number, description: '신고할 강의 ID' })
  @ApiBody({ type: CreateReportRequest })
  @SwaggerResponse(ReportResponse, false, 201, '신고가 접수되었습니다.')
  createReport(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() data: CreateReportRequest,
  ) {
    return this.reportService.createReport(courseId, data);
  }
}
