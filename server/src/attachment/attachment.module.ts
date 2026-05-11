import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { StorageModule } from '../storage/storage.module';
import { AttachmentController } from './attachment.controller';
import { AttachmentRepository } from './attachment.repository';
import { AttachmentService } from './attachment.service';

@Module({
  imports: [JwtModule.register({}), StorageModule],
  controllers: [AttachmentController],
  providers: [AttachmentService, AttachmentRepository],
})
export class AttachmentModule {}
