import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../global/guards/jwt-auth.guard';
import { RolesGuard } from '../global/guards/roles.guard';
import { Roles } from '../global/global_decorator/decorator.roles';
import { User } from '../global/global_decorator/decorator.user';
import { ResponseMessage } from '../global/global_decorator/decorator.message';
import { AttachmentService } from './attachment.service';

const FILE_SIZE_LIMIT = 50 * 1024 * 1024; // 50 MB

@ApiTags('attachments')
@Controller('/api/v1')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  // ─── 강사: 업로드 ─────────────────────────────────────────────────────────

  @Post('instructor/lectures/:lectureId/attachments')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: '강의 자료 파일 업로드 (강사 전용)' })
  @ApiParam({ name: 'lectureId', type: Number })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: FILE_SIZE_LIMIT },
    }),
  )
  @ResponseMessage('파일이 업로드되었습니다.')
  upload(
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @User('sub') instructorId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentService.upload(instructorId, lectureId, file);
  }

  // ─── 강사: 삭제 ─────────────────────────────────────────────────────────

  @Delete('instructor/attachments/:attachmentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: '강의 자료 파일 삭제 (강사 전용)' })
  @ApiParam({ name: 'attachmentId', type: Number })
  @ResponseMessage('파일이 삭제되었습니다.')
  remove(
    @Param('attachmentId', ParseIntPipe) attachmentId: number,
    @User('sub') instructorId: number,
  ) {
    return this.attachmentService.remove(instructorId, attachmentId);
  }

  // ─── 공개: 첨부파일 목록 ──────────────────────────────────────────────────

  @Get('lectures/:lectureId/attachments')
  @ApiOperation({ summary: '강의 첨부파일 목록 조회' })
  @ApiParam({ name: 'lectureId', type: Number })
  @ResponseMessage('첨부파일 목록을 가져왔습니다.')
  list(@Param('lectureId', ParseIntPipe) lectureId: number) {
    return this.attachmentService.listByLecture(lectureId);
  }

  // ─── 수강생: 다운로드 ────────────────────────────────────────────────────

  @Get('attachments/:attachmentId/download')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '첨부파일 다운로드 (수강생/강사)' })
  @ApiParam({ name: 'attachmentId', type: Number })
  async download(
    @Param('attachmentId', ParseIntPipe) attachmentId: number,
    @User('sub') userId: number,
    @Res() res: Response,
  ) {
    const { stream, filename, mimeType, size } =
      await this.attachmentService.getDownloadStream(userId, attachmentId);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', size);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    );
    stream.pipe(res);
  }
}
