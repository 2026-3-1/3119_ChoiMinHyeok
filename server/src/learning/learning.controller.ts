import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
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
import { LearningService } from './learning.service';
import {
  AddLectureBookmarkRequest,
  CreateCourseReviewRequest,
  LearningUserQueryRequest,
  UpdateLectureProgressRequest,
} from './dto/learning.request';
import {
  CourseLearningStatusResponse,
  CourseReviewResponse,
  LearningCourseCardResponse,
  LectureBookmarkResponse,
  LectureProgressResponse,
  PlaybackHistoryItemResponse,
} from './dto/learning.response';

@ApiTags('learning')
@Controller('/api/v1')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ResponseMessage('내 학습 목록 조회에 성공했습니다.')
  @Get('users/:userId/learning')
  @ApiOperation({
    summary: '사용자의 현재 수강 목록과 이어보기 정보를 조회합니다.',
  })
  @ApiParam({ name: 'userId', type: Number, description: '사용자 ID' })
  @SwaggerResponse(
    LearningCourseCardResponse,
    true,
    200,
    '내 학습 목록 조회에 성공했습니다.',
  )
  getMyLearning(@Param('userId', ParseIntPipe) userId: number) {
    return this.learningService.getMyLearning(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ResponseMessage('강의 학습 상태 조회에 성공했습니다.')
  @Get('users/:userId/courses/:courseId/learning-status')
  @ApiOperation({ summary: '수강 여부, 진도율, 리뷰 가능 여부를 조회합니다.' })
  @ApiParam({ name: 'userId', type: Number, description: '사용자 ID' })
  @ApiParam({ name: 'courseId', type: Number, description: '강의 ID' })
  @SwaggerResponse(
    CourseLearningStatusResponse,
    false,
    200,
    '강의 학습 상태 조회에 성공했습니다.',
  )
  getCourseLearningStatus(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.learningService.getCourseLearningStatus(userId, courseId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ResponseMessage('강의 진도 조회에 성공했습니다.')
  @Get('lectures/:lectureId/progress')
  @ApiOperation({ summary: '강의 이어보기 위치와 진도를 조회합니다.' })
  @ApiParam({ name: 'lectureId', type: Number, description: '강의 ID' })
  @ApiQuery({ name: 'userId', type: Number, description: '사용자 ID' })
  @SwaggerResponse(
    LectureProgressResponse,
    false,
    200,
    '강의 진도 조회에 성공했습니다.',
  )
  getLectureProgress(
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @Query() query: LearningUserQueryRequest,
  ) {
    return this.learningService.getLectureProgress(query.userId, lectureId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ResponseMessage('강의 진도 저장에 성공했습니다.')
  @Put('lectures/:lectureId/progress')
  @ApiOperation({ summary: '강의 시청 히스토리와 이어보기 위치를 저장합니다.' })
  @ApiParam({ name: 'lectureId', type: Number, description: '강의 ID' })
  @ApiBody({ type: UpdateLectureProgressRequest })
  @SwaggerResponse(
    LectureProgressResponse,
    false,
    200,
    '강의 진도 저장에 성공했습니다.',
  )
  updateLectureProgress(
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @Body() data: UpdateLectureProgressRequest,
  ) {
    return this.learningService.updateLectureProgress(lectureId, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ResponseMessage('강의 시청 히스토리 조회에 성공했습니다.')
  @Get('lectures/:lectureId/history')
  @ApiOperation({ summary: '강의 시청 히스토리 로그를 조회합니다.' })
  @ApiParam({ name: 'lectureId', type: Number, description: '강의 ID' })
  @ApiQuery({ name: 'userId', type: Number, description: '사용자 ID' })
  @SwaggerResponse(
    PlaybackHistoryItemResponse,
    true,
    200,
    '강의 시청 히스토리 조회에 성공했습니다.',
  )
  getLectureHistory(
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @Query() query: LearningUserQueryRequest,
  ) {
    return this.learningService.getLectureHistory(query.userId, lectureId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ResponseMessage('전체 북마크 조회에 성공했습니다.')
  @Get('bookmarks')
  @ApiOperation({ summary: '내 전체 북마크 목록을 조회합니다.' })
  @ApiQuery({ name: 'userId', type: Number, description: '사용자 ID' })
  getAllBookmarks(@Query() query: LearningUserQueryRequest) {
    return this.learningService.getAllBookmarks(query.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ResponseMessage('북마크 조회에 성공했습니다.')
  @Get('lectures/:lectureId/bookmarks')
  @ApiOperation({ summary: '강의 북마크 목록을 조회합니다.' })
  @ApiParam({ name: 'lectureId', type: Number, description: '강의 ID' })
  @ApiQuery({ name: 'userId', type: Number, description: '사용자 ID' })
  @SwaggerResponse(
    LectureBookmarkResponse,
    true,
    200,
    '북마크 조회에 성공했습니다.',
  )
  getLectureBookmarks(
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @Query() query: LearningUserQueryRequest,
  ) {
    return this.learningService.getLectureBookmarks(query.userId, lectureId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ResponseMessage('북마크 추가에 성공했습니다.')
  @Post('lectures/:lectureId/bookmarks')
  @ApiOperation({ summary: '강의 북마크를 추가합니다.' })
  @ApiParam({ name: 'lectureId', type: Number, description: '강의 ID' })
  @ApiBody({ type: AddLectureBookmarkRequest })
  @SwaggerResponse(
    LectureBookmarkResponse,
    true,
    201,
    '북마크 추가에 성공했습니다.',
  )
  createLectureBookmark(
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @Body() data: AddLectureBookmarkRequest,
  ) {
    return this.learningService.createLectureBookmark(lectureId, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ResponseMessage('북마크 삭제에 성공했습니다.')
  @Delete('bookmarks/:bookmarkId')
  @ApiOperation({ summary: '강의 북마크를 삭제합니다.' })
  @ApiParam({ name: 'bookmarkId', type: Number, description: '북마크 ID' })
  @ApiQuery({ name: 'userId', type: Number, description: '사용자 ID' })
  @SwaggerResponse(
    LectureBookmarkResponse,
    true,
    200,
    '북마크 삭제에 성공했습니다.',
  )
  removeLectureBookmark(
    @Param('bookmarkId', ParseIntPipe) bookmarkId: number,
    @Query() query: LearningUserQueryRequest,
  ) {
    return this.learningService.removeLectureBookmark(query.userId, bookmarkId);
  }

  @ResponseMessage('리뷰 조회에 성공했습니다.')
  @Get('courses/:courseId/reviews')
  @ApiOperation({ summary: '강의 리뷰 목록을 조회합니다.' })
  @ApiParam({ name: 'courseId', type: Number, description: '강의 ID' })
  @SwaggerResponse(CourseReviewResponse, true, 200, '리뷰 조회에 성공했습니다.')
  getCourseReviews(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.learningService.getCourseReviews(courseId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ResponseMessage('리뷰 저장에 성공했습니다.')
  @Post('courses/:courseId/reviews')
  @ApiOperation({
    summary: '진도율 80% 이상일 때 리뷰를 작성하거나 수정합니다.',
  })
  @ApiParam({ name: 'courseId', type: Number, description: '강의 ID' })
  @ApiBody({ type: CreateCourseReviewRequest })
  @SwaggerResponse(CourseReviewResponse, true, 201, '리뷰 저장에 성공했습니다.')
  createCourseReview(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() data: CreateCourseReviewRequest,
  ) {
    return this.learningService.createCourseReview(courseId, data);
  }
}
