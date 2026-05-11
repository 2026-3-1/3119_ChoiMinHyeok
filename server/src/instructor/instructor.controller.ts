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
  UseGuards,
} from '@nestjs/common';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
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
import { User } from '../global/global_decorator/decorator.user';
import { InstructorService } from './instructor.service';
import {
  CreateChapterRequest,
  CreateInstructorCourseRequest,
  CreateLectureRequest,
  UpdateChapterRequest,
  UpdateCourseRequest,
  UpdateLectureRequest,
} from './dto/instructor.request';
import {
  InstructorChapterResponse,
  InstructorCourseResponse,
  InstructorLectureResponse,
  InstructorStudentResponse,
} from './dto/instructor.response';

class SetCourseStatusRequest {
  @IsEnum(['DRAFT', 'OPEN'])
  @ApiProperty({ enum: ['DRAFT', 'OPEN'], example: 'OPEN' })
  status!: 'DRAFT' | 'OPEN';
}

@ApiTags('instructor')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('INSTRUCTOR')
@Controller('/api/v1/instructor')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  // ─── 강의 관리 ────────────────────────────────────────────────────────────

  @ResponseMessage('강의가 개설되었습니다.')
  @Post('courses')
  @HttpCode(201)
  @ApiOperation({ summary: '새 강의를 개설합니다.' })
  @ApiBody({ type: CreateInstructorCourseRequest })
  @SwaggerResponse(InstructorCourseResponse, false, 201, '강의가 개설되었습니다.')
  createCourse(
    @User('sub') instructorId: number,
    @Body() data: CreateInstructorCourseRequest,
  ) {
    return this.instructorService.createCourse(instructorId, data);
  }

  @ResponseMessage('내 강의 목록 조회에 성공했습니다.')
  @Get('courses')
  @ApiOperation({ summary: '내 강의 목록을 조회합니다.' })
  @SwaggerResponse(InstructorCourseResponse, true, 200, '내 강의 목록 조회에 성공했습니다.')
  getMyCourses(@User('sub') instructorId: number) {
    return this.instructorService.getMyCourses(instructorId);
  }

  @ResponseMessage('강의 수정이 완료되었습니다.')
  @Patch('courses/:courseId')
  @ApiOperation({ summary: '내 강의를 수정합니다.' })
  @ApiParam({ name: 'courseId', type: Number })
  @ApiBody({ type: UpdateCourseRequest })
  @SwaggerResponse(InstructorCourseResponse, false, 200, '강의 수정이 완료되었습니다.')
  updateCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @User('sub') instructorId: number,
    @Body() data: UpdateCourseRequest,
  ) {
    return this.instructorService.updateCourse(courseId, instructorId, data);
  }

  @ResponseMessage('강의 삭제가 완료되었습니다.')
  @Delete('courses/:courseId')
  @ApiOperation({ summary: '내 강의를 삭제합니다.' })
  @ApiParam({ name: 'courseId', type: Number })
  @SwaggerResponse(null, false, 200, '강의 삭제가 완료되었습니다.')
  deleteCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @User('sub') instructorId: number,
  ) {
    return this.instructorService.deleteCourse(courseId, instructorId);
  }

  @ResponseMessage('강의 공개 상태가 변경되었습니다.')
  @Patch('courses/:courseId/status')
  @ApiOperation({ summary: '강의를 공개(OPEN) 또는 임시저장(DRAFT)으로 변경합니다.' })
  @ApiParam({ name: 'courseId', type: Number })
  @SwaggerResponse(InstructorCourseResponse, false, 200, '강의 공개 상태가 변경되었습니다.')
  setCourseStatus(
    @Param('courseId', ParseIntPipe) courseId: number,
    @User('sub') instructorId: number,
    @Body() body: SetCourseStatusRequest,
  ) {
    return this.instructorService.setCourseStatus(courseId, instructorId, body.status);
  }

  // ─── 챕터 관리 ────────────────────────────────────────────────────────────

  @ResponseMessage('챕터 추가가 완료되었습니다.')
  @Post('courses/:courseId/chapters')
  @HttpCode(201)
  @ApiOperation({ summary: '강의에 챕터를 추가합니다.' })
  @ApiParam({ name: 'courseId', type: Number })
  @ApiBody({ type: CreateChapterRequest })
  @SwaggerResponse(InstructorChapterResponse, false, 201, '챕터 추가가 완료되었습니다.')
  addChapter(
    @Param('courseId', ParseIntPipe) courseId: number,
    @User('sub') instructorId: number,
    @Body() data: CreateChapterRequest,
  ) {
    return this.instructorService.addChapter(courseId, instructorId, data);
  }

  @ResponseMessage('챕터 수정이 완료되었습니다.')
  @Patch('courses/:courseId/chapters/:chapterId')
  @ApiOperation({ summary: '챕터를 수정합니다.' })
  @ApiParam({ name: 'courseId', type: Number })
  @ApiParam({ name: 'chapterId', type: Number })
  @ApiBody({ type: UpdateChapterRequest })
  @SwaggerResponse(InstructorChapterResponse, false, 200, '챕터 수정이 완료되었습니다.')
  updateChapter(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('chapterId', ParseIntPipe) chapterId: number,
    @User('sub') instructorId: number,
    @Body() data: UpdateChapterRequest,
  ) {
    return this.instructorService.updateChapter(courseId, chapterId, instructorId, data);
  }

  @ResponseMessage('챕터 삭제가 완료되었습니다.')
  @Delete('courses/:courseId/chapters/:chapterId')
  @ApiOperation({ summary: '챕터를 삭제합니다.' })
  @ApiParam({ name: 'courseId', type: Number })
  @ApiParam({ name: 'chapterId', type: Number })
  @SwaggerResponse(null, false, 200, '챕터 삭제가 완료되었습니다.')
  deleteChapter(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('chapterId', ParseIntPipe) chapterId: number,
    @User('sub') instructorId: number,
  ) {
    return this.instructorService.deleteChapter(courseId, chapterId, instructorId);
  }

  // ─── 강의 영상 관리 ──────────────────────────────────────────────────────

  @ResponseMessage('강의 영상 추가가 완료되었습니다.')
  @Post('chapters/:chapterId/lectures')
  @HttpCode(201)
  @ApiOperation({ summary: '챕터에 강의 영상을 추가합니다.' })
  @ApiParam({ name: 'chapterId', type: Number })
  @ApiBody({ type: CreateLectureRequest })
  @SwaggerResponse(InstructorLectureResponse, false, 201, '강의 영상 추가가 완료되었습니다.')
  addLecture(
    @Param('chapterId', ParseIntPipe) chapterId: number,
    @User('sub') instructorId: number,
    @Body() data: CreateLectureRequest,
  ) {
    return this.instructorService.addLecture(chapterId, instructorId, data);
  }

  @ResponseMessage('강의 영상 수정이 완료되었습니다.')
  @Patch('lectures/:lectureId')
  @ApiOperation({ summary: '강의 영상을 수정합니다.' })
  @ApiParam({ name: 'lectureId', type: Number })
  @ApiBody({ type: UpdateLectureRequest })
  @SwaggerResponse(InstructorLectureResponse, false, 200, '강의 영상 수정이 완료되었습니다.')
  updateLecture(
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @User('sub') instructorId: number,
    @Body() data: UpdateLectureRequest,
  ) {
    return this.instructorService.updateLecture(lectureId, instructorId, data);
  }

  @ResponseMessage('강의 영상 삭제가 완료되었습니다.')
  @Delete('lectures/:lectureId')
  @ApiOperation({ summary: '강의 영상을 삭제합니다.' })
  @ApiParam({ name: 'lectureId', type: Number })
  @SwaggerResponse(null, false, 200, '강의 영상 삭제가 완료되었습니다.')
  deleteLecture(
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @User('sub') instructorId: number,
  ) {
    return this.instructorService.deleteLecture(lectureId, instructorId);
  }

  // ─── 수강생 관리 ──────────────────────────────────────────────────────────

  @ResponseMessage('수강생 목록 조회에 성공했습니다.')
  @Get('courses/:courseId/students')
  @ApiOperation({ summary: '강의의 수강생 목록을 조회합니다.' })
  @ApiParam({ name: 'courseId', type: Number })
  @SwaggerResponse(InstructorStudentResponse, true, 200, '수강생 목록 조회에 성공했습니다.')
  getStudents(
    @Param('courseId', ParseIntPipe) courseId: number,
    @User('sub') instructorId: number,
  ) {
    return this.instructorService.getStudents(courseId, instructorId);
  }

  @ResponseMessage('수강생 추방이 완료되었습니다.')
  @Delete('courses/:courseId/students/:userId')
  @ApiOperation({ summary: '수강생을 강의에서 추방합니다.' })
  @ApiParam({ name: 'courseId', type: Number })
  @ApiParam({ name: 'userId', type: Number })
  @SwaggerResponse(null, false, 200, '수강생 추방이 완료되었습니다.')
  kickStudent(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @User('sub') instructorId: number,
  ) {
    return this.instructorService.kickStudent(courseId, userId, instructorId);
  }
}
