import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../global/guards/jwt-auth.guard';
import { User } from '../../global/global_decorator/decorator.user';
import { ResponseMessage } from '../../global/global_decorator/decorator.message';
import { LectureCommentService } from './lecture-comment.service';
import { CreateLectureCommentRequest } from './dto/lecture-comment.request';

@ApiTags('lecture-comments')
@Controller('/api/v1')
export class LectureCommentController {
  constructor(private readonly lectureCommentService: LectureCommentService) {}

  @Get('lectures/:lectureId/comments')
  @ApiOperation({ summary: '강의 댓글 목록 조회' })
  @ApiParam({ name: 'lectureId', type: Number })
  @ResponseMessage('댓글 목록을 가져왔습니다.')
  getComments(@Param('lectureId', ParseIntPipe) lectureId: number) {
    return this.lectureCommentService.getComments(lectureId);
  }

  @Post('lectures/:lectureId/comments')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '강의 댓글 작성' })
  @ApiParam({ name: 'lectureId', type: Number })
  @ResponseMessage('댓글이 작성되었습니다.')
  createComment(
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @User('sub') userId: number,
    @Body() body: CreateLectureCommentRequest,
  ) {
    return this.lectureCommentService.createComment(userId, lectureId, body.content);
  }

  @Delete('lectures/:lectureId/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '강의 댓글 삭제 (본인)' })
  @ApiParam({ name: 'lectureId', type: Number })
  @ApiParam({ name: 'commentId', type: Number })
  @ResponseMessage('댓글이 삭제되었습니다.')
  deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @User('sub') userId: number,
  ) {
    return this.lectureCommentService.deleteComment(commentId, userId);
  }
}
