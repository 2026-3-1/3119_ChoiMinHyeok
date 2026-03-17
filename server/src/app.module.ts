import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './global/global.exception';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide : APP_FILTER,
      useClass : GlobalExceptionFilter
    }
  ],
})
export class AppModule {}
