import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/global/decorator/message.decorator';
import { SwaggerResponse } from 'src/global/decorator/swagger.response';
import { ChapterService } from './chapter.service';
import { createChapter } from './dto/chapter.request';
import { chapter } from './dto/chapter.response';

@ApiTags('chapters')
@Controller('/api/v1')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @ResponseMessage('챕터 목록 조회 성공')
  @Get('courses/:courseId/chapters')
  @ApiOperation({ summary: '챕터 목록 조회' })
  @ApiParam({ name: 'courseId', required: true, type: Number, description: '코스 ID' })
  @SwaggerResponse(chapter, true, 200, '챕터 목록 조회 성공')
  getChapters(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.chapterService.getChapters(courseId);
  }

  @ResponseMessage('챕터 단건 조회 성공')
  @Get('chapters/:chapterId')
  @ApiOperation({ summary: '챕터 단건 조회' })
  @ApiParam({ name: 'chapterId', required: true, type: Number, description: '챕터 ID' })
  @SwaggerResponse(chapter, false, 200, '챕터 단건 조회 성공')
  getChapter(@Param('chapterId', ParseIntPipe) chapterId: number) {
    return this.chapterService.getChapter(chapterId);
  }

  @ResponseMessage('챕터 추가 완료')
  @Post('chapters')
  @HttpCode(201)
  @ApiOperation({ summary: '챕터 추가' })
  @ApiBody({ type: createChapter })
  @SwaggerResponse(null, false, 201, '챕터 추가 완료')
  addChapter(@Body() data: createChapter) {
    return this.chapterService.addChapter(data);
  }
}
