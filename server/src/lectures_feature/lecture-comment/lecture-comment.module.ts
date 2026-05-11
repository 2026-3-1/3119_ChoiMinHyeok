import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LectureCommentController } from './lecture-comment.controller';
import { LectureCommentService } from './lecture-comment.service';
import { LectureCommentRepository } from './lecture-comment.repository';

@Module({
  imports: [JwtModule.register({})],
  controllers: [LectureCommentController],
  providers: [LectureCommentService, LectureCommentRepository],
})
export class LectureCommentModule {}
