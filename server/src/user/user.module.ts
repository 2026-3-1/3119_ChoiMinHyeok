import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { UserController } from './user.controller';
import { UserManager } from './user.manager';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [AuthModule, NotificationModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserManager],
  exports: [UserRepository, UserService],
})
export class UserModule {}
