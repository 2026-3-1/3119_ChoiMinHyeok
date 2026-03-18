import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './global/global.exception';
import { CourseModule } from './course/course.module';
import { ResponseInterCeptor } from './global/response.interceptor';

@Module({
  imports: [CourseModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide : APP_FILTER,
      useClass : GlobalExceptionFilter
    },
    {
      provide : APP_INTERCEPTOR,
      useClass : ResponseInterCeptor
    }
  ],
})
export class AppModule {}
