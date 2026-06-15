import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';

@Injectable()
export class UserManager {
  constructor(private readonly userRepository: UserRepository) {}

  async hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }

  async comparePassword(password: string, passwordHash: string) {
    return bcrypt.compare(password, passwordHash);
  }

  async verifyUser(email: string, password: string) {
    const user = await this.userRepository.findUserByEmail(email);

    if (!user) {
      throw new BadRequestException('존재하지 않는 이메일입니다.');
    }

    if (user.is_banned) {
      throw new ForbiddenException('정지된 계정입니다. 관리자에게 문의하세요.');
    }

    const isMatch = await this.comparePassword(password, user.password);

    if (!isMatch) {
      throw new BadRequestException('비밀번호가 올바르지 않습니다.');
    }

    return user;
  }
}
