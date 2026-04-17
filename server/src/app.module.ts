import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './global/global.exception';
import { CourseModule } from './lectures_feature/course/course.module';
import { ChapterModule } from './lectures_feature/chapter/chapter.module';
import { CategoryModule } from './lectures_feature/category/category.module';
import { LectureModule } from './lectures_feature/lecture/lecture.module';
import { ResponseInterCeptor } from './global/global.response-interceptor';
import { UserModule } from './user/user.module';
import { CommerceModule } from './commerce/commerce.module';
import { LearningModule } from './learning/learning.module';


@Module({
  imports: [
    CourseModule,
    ChapterModule,
    CategoryModule,
    LectureModule,
    UserModule,
    CommerceModule,
    LearningModule,
  ],
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
