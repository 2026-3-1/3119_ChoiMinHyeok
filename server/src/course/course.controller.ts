import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CourseService } from './course.service';
import { createCourse } from './dto/courses.request';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/global/decorator/message.decorator';
import { SwaggerResponse } from 'src/global/decorator/swagger.response';
import { course } from './dto/courses.response';

@ApiTags('courses')
@Controller('/api/v1')
export class CourseController {
  constructor(private readonly courseService : CourseService) {}

  @ResponseMessage('강의 목록 조회 성공')
  @Get('courses')
  @ApiOperation({ summary : '강의 목록 조회'})
  @ApiQuery({ name : 'categoryId', required : false, type : Number})
  @ApiQuery({ name : 'keyword' , required : false, type : String})
  @SwaggerResponse(course, true, 200, '강의 목록 조회 성공')
  getCourses(
    @Query('categoryId', ParseIntPipe) categoryId? : number,
    @Query('keyword')    keyword?    : string,
  ) {
    return this.courseService.getCourses(categoryId, keyword)
  }
  
  @ResponseMessage('강의 단건 조회 성공')
  @Get('courses/:courseId')
  @ApiOperation({ summary : '강의 단건 조회'})
  @ApiParam({ name : 'courseId', required : true, type : String })
  @SwaggerResponse(course, true, 200, '강의 단건 조회 성공')
  getCourseDetail(@Param('courseId', ParseIntPipe) courseId : number) {
    return this.courseService.getCourseDetail(courseId)
  }
  
  @Post('courses')
  addCourses(@Body() data : createCourse) {
    return this.courseService.createCourses(data)
  }

}
