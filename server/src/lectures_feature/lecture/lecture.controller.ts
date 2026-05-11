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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseMessage } from '../../global/global_decorator/decorator.message';
import { SwaggerResponse } from '../../global/global_decorator/decorator.swagger-response';
import { JwtAuthGuard } from '../../global/guards/jwt-auth.guard';
import { RolesGuard } from '../../global/guards/roles.guard';
import { Roles } from '../../global/global_decorator/decorator.roles';
import { LectureService } from './lecture.service';
import { createLecture, updateLecture } from './dto/lecture.request';
import { lecture, lectureDetail } from './dto/lecture.response';

@ApiTags('lectures')
@Controller('/api/v1')
export class LectureController {
  constructor(private readonly lectureService: LectureService) {}

  @ResponseMessage('강의 영상 목록 조회 완료')
  @Get('chapters/:chapterId/lectures')
  @ApiOperation({ summary: '강의 영상 목록 조회' })
  @ApiParam({ name: 'chapterId', required: true, type: Number })
  @SwaggerResponse(lecture, true, 200, '강의 영상 목록 조회 완료')
  getLectures(@Param('chapterId', ParseIntPipe) chapterId: number) {
    return this.lectureService.getLectures(chapterId);
  }

  @ResponseMessage('강의 영상 단건 조회 완료')
  @Get('lectures/:lectureId')
  @ApiOperation({ summary: '강의 영상 단건 조회' })
  @ApiParam({ name: 'lectureId', required: true, type: Number })
  @SwaggerResponse(lectureDetail, false, 200, '강의 영상 단건 조회 완료')
  getLecture(@Param('lectureId', ParseIntPipe) lectureId: number) {
    return this.lectureService.getLecture(lectureId);
  }

  @ResponseMessage('강의 영상 추가 완료')
  @Post('lectures')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '강의 영상 추가 (ADMIN)' })
  @ApiBody({ type: createLecture })
  @SwaggerResponse(null, false, 201, '강의 영상 추가 완료')
  addLecture(@Body() data: createLecture) {
    return this.lectureService.addLecture(data);
  }

  @ResponseMessage('강의 영상 수정 완료')
  @Patch('lectures/:lectureId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '강의 영상 수정 (ADMIN)' })
  @ApiParam({ name: 'lectureId', type: Number })
  @ApiBody({ type: updateLecture })
  @SwaggerResponse(lecture, false, 200, '강의 영상 수정 완료')
  updateLecture(
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @Body() data: updateLecture,
  ) {
    return this.lectureService.updateLecture(lectureId, data);
  }

  @ResponseMessage('강의 영상 삭제 완료')
  @Delete('lectures/:lectureId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '강의 영상 삭제 (ADMIN)' })
  @ApiParam({ name: 'lectureId', type: Number })
  @SwaggerResponse(null, false, 200, '강의 영상 삭제 완료')
  deleteLecture(@Param('lectureId', ParseIntPipe) lectureId: number) {
    return this.lectureService.deleteLecture(lectureId);
  }
}
