import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChapterController } from './chapter.controller';
import { ChapterService } from './chapter.service';
import { ChapterRepository } from './chapter.repository';

@Module({
  imports: [JwtModule.register({})],
  controllers: [ChapterController],
  providers: [ChapterService, ChapterRepository],
})
export class ChapterModule {}
