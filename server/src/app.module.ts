import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpLoggingMiddleware } from './global/http-logging.middleware';
import { GlobalExceptionFilter } from './global/global.exception';
import { ResponseInterCeptor } from './global/global.response-interceptor';
import { HealthModule } from './health/health.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { WebhookModule } from './webhook/webhook.module';
import { ChapterModule } from './lectures_feature/chapter/chapter.module';
import { CategoryModule } from './lectures_feature/category/category.module';
import { LectureModule } from './lectures_feature/lecture/lecture.module';
import { UserModule } from './user/user.module';
import { CommerceModule } from './commerce/commerce.module';
import { LearningModule } from './learning/learning.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { InstructorModule } from './instructor/instructor.module';
import { AdminModule } from './admin/admin.module';
import { ReportModule } from './report/report.module';
import { AttachmentModule } from './attachment/attachment.module';
import { LectureCommentModule } from './lectures_feature/lecture-comment/lecture-comment.module';
import { BoardModule } from './board/board.module';

@Module({
  imports: [
    // 인프라
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    // 기능 모듈
    HealthModule,
    SchedulerModule,
    WebhookModule,
    ChapterModule,
    CategoryModule,
    LectureModule,
    UserModule,
    CommerceModule,
    LearningModule,
    EnrollmentModule,
    InstructorModule,
    AdminModule,
    ReportModule,
    AttachmentModule,
    LectureCommentModule,
    BoardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterCeptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggingMiddleware).forRoutes('*');
  }
}
