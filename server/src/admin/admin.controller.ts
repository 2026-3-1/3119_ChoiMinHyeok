import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseMessage } from '../global/global_decorator/decorator.message';
import { SwaggerResponse } from '../global/global_decorator/decorator.swagger-response';
import { JwtAuthGuard } from '../global/guards/jwt-auth.guard';
import { RolesGuard } from '../global/guards/roles.guard';
import { Roles } from '../global/global_decorator/decorator.roles';
import { AdminService } from './admin.service';
import {
  AdminCourseQueryRequest,
  AdminCourseStatusRequest,
  AdminReportQueryRequest,
  AdminUserQueryRequest,
  ChangeRoleRequest,
  ResolveReportRequest,
} from './dto/admin.request';
import {
  AdminCourseResponse,
  AdminDashboardResponse,
  AdminReportResponse,
  AdminUserResponse,
} from './dto/admin.response';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('/api/v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── 대시보드 ─────────────────────────────────────────────────────────────

  @ResponseMessage('대시보드 통계 조회에 성공했습니다.')
  @Get('dashboard')
  @ApiOperation({ summary: '전체 통계를 조회합니다.' })
  @SwaggerResponse(
    AdminDashboardResponse,
    false,
    200,
    '대시보드 통계 조회에 성공했습니다.',
  )
  getDashboard() {
    return this.adminService.getDashboard();
  }

  // ─── 사용자 관리 ──────────────────────────────────────────────────────────

  @ResponseMessage('사용자 목록 조회에 성공했습니다.')
  @Get('users')
  @ApiOperation({ summary: '전체 사용자 목록을 조회합니다.' })
  @SwaggerResponse(
    AdminUserResponse,
    true,
    200,
    '사용자 목록 조회에 성공했습니다.',
  )
  getUsers(@Query() query: AdminUserQueryRequest) {
    return this.adminService.getUsers(query);
  }

  @ResponseMessage('사용자가 삭제되었습니다.')
  @Delete('users/:userId')
  @ApiOperation({ summary: '사용자를 삭제합니다.' })
  @ApiParam({ name: 'userId', type: Number })
  @SwaggerResponse(null, false, 200, '사용자가 삭제되었습니다.')
  deleteUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.adminService.deleteUser(userId);
  }

  @ResponseMessage('사용자가 정지되었습니다.')
  @Post('users/:userId/ban')
  @HttpCode(200)
  @ApiOperation({ summary: '사용자를 정지합니다 (로그인 차단).' })
  @ApiParam({ name: 'userId', type: Number })
  @SwaggerResponse(null, false, 200, '사용자가 정지되었습니다.')
  banUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.adminService.banUser(userId);
  }

  @ResponseMessage('정지가 해제되었습니다.')
  @Post('users/:userId/unban')
  @HttpCode(200)
  @ApiOperation({ summary: '사용자 정지를 해제합니다.' })
  @ApiParam({ name: 'userId', type: Number })
  @SwaggerResponse(null, false, 200, '정지가 해제되었습니다.')
  unbanUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.adminService.unbanUser(userId);
  }

  @ResponseMessage('역할이 변경되었습니다.')
  @Patch('users/:userId/role')
  @ApiOperation({ summary: '사용자 역할을 변경합니다.' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiBody({ type: ChangeRoleRequest })
  @SwaggerResponse(null, false, 200, '역할이 변경되었습니다.')
  changeUserRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() data: ChangeRoleRequest,
  ) {
    return this.adminService.changeUserRole(userId, data.role);
  }

  // ─── 강의 관리 ────────────────────────────────────────────────────────────

  @ResponseMessage('강의 목록 조회에 성공했습니다.')
  @Get('courses')
  @ApiOperation({ summary: '전체 강의 목록을 조회합니다.' })
  @SwaggerResponse(
    AdminCourseResponse,
    true,
    200,
    '강의 목록 조회에 성공했습니다.',
  )
  getCourses(@Query() query: AdminCourseQueryRequest) {
    return this.adminService.getCourses(query);
  }

  @ResponseMessage('강의 상태가 변경되었습니다.')
  @Patch('courses/:courseId/status')
  @ApiOperation({ summary: '강의 상태를 변경합니다.' })
  @ApiParam({ name: 'courseId', type: Number })
  @ApiBody({ type: AdminCourseStatusRequest })
  @SwaggerResponse(null, false, 200, '강의 상태가 변경되었습니다.')
  setCourseStatus(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() data: AdminCourseStatusRequest,
  ) {
    return this.adminService.setCourseStatus(courseId, data.status);
  }

  @ResponseMessage('강의가 삭제되었습니다.')
  @Delete('courses/:courseId')
  @ApiOperation({ summary: '강의를 삭제합니다.' })
  @ApiParam({ name: 'courseId', type: Number })
  @SwaggerResponse(null, false, 200, '강의가 삭제되었습니다.')
  deleteCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.adminService.deleteCourse(courseId);
  }

  // ─── 신고 관리 ────────────────────────────────────────────────────────────

  @ResponseMessage('신고 목록 조회에 성공했습니다.')
  @Get('reports')
  @ApiOperation({ summary: '신고 목록을 조회합니다.' })
  @SwaggerResponse(
    AdminReportResponse,
    true,
    200,
    '신고 목록 조회에 성공했습니다.',
  )
  getReports(@Query() query: AdminReportQueryRequest) {
    return this.adminService.getReports(query);
  }

  @ResponseMessage('신고가 처리되었습니다.')
  @Patch('reports/:reportId')
  @ApiOperation({ summary: '신고 처리 여부를 변경합니다.' })
  @ApiParam({ name: 'reportId', type: Number })
  @ApiBody({ type: ResolveReportRequest })
  @SwaggerResponse(null, false, 200, '신고가 처리되었습니다.')
  resolveReport(
    @Param('reportId', ParseIntPipe) reportId: number,
    @Body() data: ResolveReportRequest,
  ) {
    return this.adminService.resolveReport(reportId, data);
  }
}
