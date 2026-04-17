import { Module } from '@nestjs/common';
import { CommerceController } from './commerce.controller';
import { CommerceManager } from './commerce.manager';
import { CommerceRepository } from './commerce.repository';
import { CommerceService } from './commerce.service';

@Module({
  controllers: [CommerceController],
  providers: [CommerceService, CommerceRepository, CommerceManager],
  exports: [CommerceService],
})
export class CommerceModule {}
