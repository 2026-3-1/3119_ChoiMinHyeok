import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/global/decorator/message.decorator';
import { SwaggerResponse } from 'src/global/decorator/swagger.response';
import { LectureService } from './lecture.service';
import { createLecture } from './dto/lecture.request';
import { lecture, lectureDetail } from './dto/lecture.response';

@ApiTags('lectures')
@Controller('/api/v1')
export class LectureController {
  constructor(private readonly lectureService: LectureService) {}

  @ResponseMessage('강의 영상 목록 조회 완료')
  @Get('chapters/:chapterId/lectures')
  @ApiOperation({ summary: '강의 영상 목록 조회' })
  @ApiParam({ name: 'chapterId', required: true, type: Number, description: '챕터 ID' })
  @SwaggerResponse(lecture, true, 200, '강의 영상 목록 조회 완료')
  getLectures(@Param('chapterId', ParseIntPipe) chapterId: number) {
    return this.lectureService.getLectures(chapterId);
  }

  @ResponseMessage('강의 영상 단건 조회 완료')
  @Get('lectures/:lectureId')
  @ApiOperation({ summary: '강의 영상 단건 조회' })
  @ApiParam({ name: 'lectureId', required: true, type: Number, description: '강의 영상 ID' })
  @SwaggerResponse(lectureDetail, false, 200, '강의 영상 단건 조회 완료')
  getLecture(@Param('lectureId', ParseIntPipe) lectureId: number) {
    return this.lectureService.getLecture(lectureId);
  }

  @ResponseMessage('강의 영상 추가 완료')
  @Post('lectures')
  @HttpCode(201)
  @ApiOperation({ summary: '강의 영상 추가' })
  @ApiBody({ type: createLecture })
  @SwaggerResponse(null, false, 201, '강의 영상 추가 완료')
  addLecture(@Body() data: createLecture) {
    return this.lectureService.addLecture(data);
  }
}
