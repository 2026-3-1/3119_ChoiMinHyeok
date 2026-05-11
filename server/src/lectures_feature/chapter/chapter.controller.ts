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
import { ChapterService } from './chapter.service';
import { createChapter, updateChapter } from './dto/chapter.request';
import { chapter } from './dto/chapter.response';

@ApiTags('chapters')
@Controller('/api/v1')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @ResponseMessage('챕터 목록 조회 성공')
  @Get('courses/:courseId/chapters')
  @ApiOperation({ summary: '챕터 목록 조회' })
  @ApiParam({ name: 'courseId', required: true, type: Number })
  @SwaggerResponse(chapter, true, 200, '챕터 목록 조회 성공')
  getChapters(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.chapterService.getChapters(courseId);
  }

  @ResponseMessage('챕터 단건 조회 성공')
  @Get('chapters/:chapterId')
  @ApiOperation({ summary: '챕터 단건 조회' })
  @ApiParam({ name: 'chapterId', required: true, type: Number })
  @SwaggerResponse(chapter, false, 200, '챕터 단건 조회 성공')
  getChapter(@Param('chapterId', ParseIntPipe) chapterId: number) {
    return this.chapterService.getChapter(chapterId);
  }

  @ResponseMessage('챕터 추가 완료')
  @Post('chapters')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '챕터 추가 (ADMIN)' })
  @ApiBody({ type: createChapter })
  @SwaggerResponse(null, false, 201, '챕터 추가 완료')
  addChapter(@Body() data: createChapter) {
    return this.chapterService.addChapter(data);
  }

  @ResponseMessage('챕터 수정 완료')
  @Patch('chapters/:chapterId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '챕터 수정 (ADMIN)' })
  @ApiParam({ name: 'chapterId', type: Number })
  @ApiBody({ type: updateChapter })
  @SwaggerResponse(chapter, false, 200, '챕터 수정 완료')
  updateChapter(
    @Param('chapterId', ParseIntPipe) chapterId: number,
    @Body() data: updateChapter,
  ) {
    return this.chapterService.updateChapter(chapterId, data);
  }

  @ResponseMessage('챕터 삭제 완료')
  @Delete('chapters/:chapterId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '챕터 삭제 (ADMIN)' })
  @ApiParam({ name: 'chapterId', type: Number })
  @SwaggerResponse(null, false, 200, '챕터 삭제 완료')
  deleteChapter(@Param('chapterId', ParseIntPipe) chapterId: number) {
    return this.chapterService.deleteChapter(chapterId);
  }
}
