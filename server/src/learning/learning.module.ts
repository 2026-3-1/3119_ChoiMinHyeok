import { Module } from '@nestjs/common';
import { LearningController } from './learning.controller';
import { LearningManager } from './learning.manager';
import { LearningRepository } from './learning.repository';
import { LearningService } from './learning.service';

@Module({
  controllers: [LearningController],
  providers: [LearningService, LearningRepository, LearningManager],
})
export class LearningModule {}
