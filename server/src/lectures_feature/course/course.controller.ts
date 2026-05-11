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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseMessage } from '../../global/global_decorator/decorator.message';
import { SwaggerResponse } from '../../global/global_decorator/decorator.swagger-response';
import { JwtAuthGuard } from '../../global/guards/jwt-auth.guard';
import { RolesGuard } from '../../global/guards/roles.guard';
import { Roles } from '../../global/global_decorator/decorator.roles';
import { CourseService } from './course.service';
import { createCourse, getCourse, updateCourse } from './dto/courses.request';
import { course, courseListData } from './dto/courses.response';

@ApiTags('courses')
@Controller('/api/v1')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @ResponseMessage('코스 목록 조회 성공')
  @Get('courses')
  @ApiOperation({ summary: '코스 목록 조회' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 12 })
  @SwaggerResponse(courseListData, false, 200, '코스 목록 조회 성공')
  getCourses(@Query() query: getCourse) {
    return this.courseService.getCourses(query);
  }

  @ResponseMessage('코스 상세 조회 성공')
  @Get('courses/:courseId')
  @ApiOperation({ summary: '코스 상세 조회' })
  @ApiParam({ name: 'courseId', required: true, type: Number })
  @SwaggerResponse(course, false, 200, '코스 상세 조회 성공')
  getCourseDetail(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.courseService.getCourseDetail(courseId);
  }

  @ResponseMessage('코스 생성 완료')
  @Post('courses')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '코스 생성 (INSTRUCTOR, ADMIN)' })
  @ApiBody({ type: createCourse })
  @SwaggerResponse(null, false, 201, '코스 생성 완료')
  addCourses(@Body() data: createCourse) {
    return this.courseService.addCourses(data);
  }

  @ResponseMessage('코스 수정 완료')
  @Patch('courses/:courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '코스 수정 (ADMIN)' })
  @ApiParam({ name: 'courseId', type: Number })
  @ApiBody({ type: updateCourse })
  @SwaggerResponse(course, false, 200, '코스 수정 완료')
  updateCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() data: updateCourse,
  ) {
    return this.courseService.updateCourse(courseId, data);
  }

  @ResponseMessage('코스 삭제 완료')
  @Delete('courses/:courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '코스 삭제 (ADMIN)' })
  @ApiParam({ name: 'courseId', type: Number })
  @SwaggerResponse(null, false, 200, '코스 삭제 완료')
  deleteCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.courseService.deleteCourse(courseId);
  }
}
