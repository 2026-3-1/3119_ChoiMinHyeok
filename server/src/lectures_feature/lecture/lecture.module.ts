import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LectureController } from './lecture.controller';
import { LectureService } from './lecture.service';
import { LectureRepository } from './lecture.repository';

@Module({
  imports: [JwtModule.register({})],
  controllers: [LectureController],
  providers: [LectureService, LectureRepository],
})
export class LectureModule {}
