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
import { JwtAuthGuard } from '../global/guards/jwt-auth.guard';
import { User } from '../global/global_decorator/decorator.user';
import { ResponseMessage } from '../global/global_decorator/decorator.message';
import { BoardService } from './board.service';
import {
  BoardQueryRequest,
  CreateCommentRequest,
  CreatePostRequest,
  UpdateCommentRequest,
  UpdatePostRequest,
} from './dto/board.request';

@ApiTags('board')
@Controller('/api/v1/board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  // ─── 게시글 ───────────────────────────────────────────────────────────────

  @Get('posts')
  @ResponseMessage('게시글 목록을 가져왔습니다.')
  @ApiOperation({ summary: '게시글 목록 조회 (공지 상단 고정)' })
  getPosts(@Query() query: BoardQueryRequest) {
    return this.boardService.getPosts(query);
  }

  @Get('posts/:postId')
  @ResponseMessage('게시글을 가져왔습니다.')
  @ApiOperation({ summary: '게시글 상세 조회 (댓글 포함)' })
  @ApiParam({ name: 'postId', type: Number })
  getPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.boardService.getPost(postId);
  }

  @Post('posts')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ResponseMessage('게시글이 작성되었습니다.')
  @ApiOperation({ summary: '게시글 작성 (학생: 일반글, 관리자: 공지 가능)' })
  @ApiQuery({ name: 'announcement', required: false, type: Boolean })
  @ApiBody({ type: CreatePostRequest })
  createPost(
    @User('sub') userId: number,
    @User('role') userRole: string,
    @Query('announcement') announcement: string,
    @Body() body: CreatePostRequest,
  ) {
    return this.boardService.createPost(
      userId,
      userRole,
      body,
      announcement === 'true',
    );
  }

  @Patch('posts/:postId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ResponseMessage('게시글이 수정되었습니다.')
  @ApiOperation({ summary: '게시글 수정 (본인 or 관리자)' })
  @ApiParam({ name: 'postId', type: Number })
  @ApiBody({ type: UpdatePostRequest })
  updatePost(
    @Param('postId', ParseIntPipe) postId: number,
    @User('sub') userId: number,
    @User('role') userRole: string,
    @Body() body: UpdatePostRequest,
  ) {
    return this.boardService.updatePost(postId, userId, userRole, body);
  }

  @Delete('posts/:postId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ResponseMessage('게시글이 삭제되었습니다.')
  @ApiOperation({ summary: '게시글 삭제 (본인 or 관리자)' })
  @ApiParam({ name: 'postId', type: Number })
  deletePost(
    @Param('postId', ParseIntPipe) postId: number,
    @User('sub') userId: number,
    @User('role') userRole: string,
  ) {
    return this.boardService.deletePost(postId, userId, userRole);
  }

  // ─── 댓글 ─────────────────────────────────────────────────────────────────

  @Post('posts/:postId/comments')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ResponseMessage('댓글이 작성되었습니다.')
  @ApiOperation({ summary: '댓글 작성 (로그인 유저 전체)' })
  @ApiParam({ name: 'postId', type: Number })
  @ApiBody({ type: CreateCommentRequest })
  createComment(
    @Param('postId', ParseIntPipe) postId: number,
    @User('sub') userId: number,
    @Body() body: CreateCommentRequest,
  ) {
    return this.boardService.createComment(postId, userId, body);
  }

  @Patch('posts/:postId/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ResponseMessage('댓글이 수정되었습니다.')
  @ApiOperation({ summary: '댓글 수정 (본인 or 관리자)' })
  @ApiParam({ name: 'postId', type: Number })
  @ApiParam({ name: 'commentId', type: Number })
  @ApiBody({ type: UpdateCommentRequest })
  updateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @User('sub') userId: number,
    @User('role') userRole: string,
    @Body() body: UpdateCommentRequest,
  ) {
    return this.boardService.updateComment(commentId, userId, userRole, body);
  }

  @Delete('posts/:postId/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ResponseMessage('댓글이 삭제되었습니다.')
  @ApiOperation({ summary: '댓글 삭제 (본인 or 관리자)' })
  @ApiParam({ name: 'postId', type: Number })
  @ApiParam({ name: 'commentId', type: Number })
  deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @User('sub') userId: number,
    @User('role') userRole: string,
  ) {
    return this.boardService.deleteComment(commentId, userId, userRole);
  }
}
