import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/global/decorator/message.decorator';
import { SwaggerResponse } from 'src/global/decorator/swagger.response';
import { CourseService } from './course.service';
import { createCourse, getCourse } from './dto/courses.request';
import { course, courseListData } from './dto/courses.response';

@ApiTags('courses')
@Controller('/api/v1')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @ResponseMessage('강의 목록 조회 성공')
  @Get('courses')
  @ApiOperation({ summary: '강의 목록 조회' })
  @ApiQuery({ name: 'search', required: false, type: String, description: '검색어' })
  @ApiQuery({ name: 'categoryId', required: false, type: Number, description: '카테고리 ID' })
  @ApiQuery({ name: 'page', required: true, type: Number, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: true, type: Number, description: '페이지 크기' })
  @SwaggerResponse(courseListData, false, 200, '강의 목록 조회 성공')
  getCourses(@Query() query: getCourse) {
    return this.courseService.getCourses(query);
  }

  @ResponseMessage('강의 단건 조회 성공')
  @Get('courses/:courseId')
  @ApiOperation({ summary: '강의 단건 조회' })
  @ApiParam({ name: 'courseId', required: true, type: Number, description: '강의 ID' })
  @SwaggerResponse(course, false, 200, '강의 단건 조회 성공')
  getCourseDetail(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.courseService.getCourseDetail(courseId);
  }

  @ResponseMessage('강의 추가 완료')
  @Post('courses')
  @HttpCode(201)
  @ApiOperation({ summary: '강의 추가' })
  @ApiBody({ type: createCourse })
  @SwaggerResponse(null, false, 201, '강의 추가 완료')
  addCourses(@Body() data: createCourse) {
    return this.courseService.addCourses(data);
  }
}
