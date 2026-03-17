import { Module } from '@nestjs/common';
import { LectureController } from './lecture.controller';
import { LectureService } from './lecture.service';

@Module({
  imports: [],
  controllers: [LectureController],
  providers: [LectureService],
})
export class AppModule {}
