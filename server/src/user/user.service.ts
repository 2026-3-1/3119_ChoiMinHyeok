import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginRequest } from './dto/login.request';
import { RegisterRequest } from './dto/register.request';
import { UserRepository } from './user.repository';
import { UserManager } from './user.manager';
import { AuthService } from './auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userManager: UserManager,
    private readonly authService: AuthService,
  ) {}

  async createUser(data: RegisterRequest) {
    const existingUser = await this.userRepository.findUserByEmail(data.email);

    if (existingUser) {
      throw new BadRequestException('이미 사용 중인 이메일입니다.');
    }

    const passwordHash = await this.userManager.hashPassword(data.password);
    const user = await this.userRepository.createUser({
      email: data.email,
      name: data.name,
      password: passwordHash,
      roles: data.roles,
      description: data.description,
    });

    const profile = this.toProfile(user);
    const tokens = await this.authService.generateTokens(
      user.id,
      user.email,
      user.roles,
    );

    return { user: profile, ...tokens };
  }

  async loginUser(data: LoginRequest) {
    const user = await this.userManager.verifyUser(data.email, data.password);
    const profile = this.toProfile(user);
    const tokens = await this.authService.generateTokens(
      user.id,
      user.email,
      user.roles,
    );

    return { user: profile, ...tokens };
  }

  async getUsers() {
    const users = await this.userRepository.getUsers();
    return users.map((user) => this.toProfile(user));
  }

  async getUserProfile(userId: number) {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return this.toProfile(user);
  }

  private toProfile(user: {
    id: number;
    name: string;
    email: string;
    roles: any;
    description: string | null;
    created_at: Date;
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      description: user.description,
      created_at: user.created_at,
    };
  }
}
