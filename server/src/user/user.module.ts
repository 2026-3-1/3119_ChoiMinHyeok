import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserController } from './user.controller';
import { UserManager } from './user.manager';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserManager],
  exports: [UserRepository, UserService],
})
export class UserModule {}
