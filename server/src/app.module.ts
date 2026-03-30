import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './global/global.exception';
import { CourseModule } from './course/course.module';
import { ResponseInterCeptor } from './global/response.interceptor';
import { ChapterModule } from './chapter/chapter.module';
import { CategoryModule } from './category/category.module';
import { LectureModule } from './lecture/lecture.module';

@Module({
  imports: [CourseModule, ChapterModule, CategoryModule, LectureModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterCeptor,
    },
  ],
})
export class AppModule {}
