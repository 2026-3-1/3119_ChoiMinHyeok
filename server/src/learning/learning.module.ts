import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LearningController } from './learning.controller';
import { LearningManager } from './learning.manager';
import { LearningRepository } from './learning.repository';
import { LearningService } from './learning.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [LearningController],
  providers: [LearningService, LearningRepository, LearningManager],
})
export class LearningModule {}
