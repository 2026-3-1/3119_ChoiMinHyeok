import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import prisma from '../../../prisma/prisma.client';
import { RedisService } from './redis.service';

export interface AccessTokenPayload {
  sub: number;
  email: string;
  role: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: number;
  email: string;
  role: string;
  jti: string;
  type: 'refresh';
}

const ACCESS_TTL_SECONDS = 60 * 15;
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async generateTokens(userId: number, email: string, role: string) {
    const jti = randomUUID();

    const accessToken = this.jwtService.sign(
      { sub: userId, email, role, type: 'access' } satisfies AccessTokenPayload,
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: ACCESS_TTL_SECONDS },
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: userId,
        email,
        role,
        jti,
        type: 'refresh',
      } satisfies RefreshTokenPayload,
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: REFRESH_TTL_SECONDS,
      },
    );

    await this.redisService.set(
      `refresh:${jti}`,
      String(userId),
      REFRESH_TTL_SECONDS,
    );

    return { accessToken, refreshToken };
  }

  async rotateTokens(incomingRefreshToken: string) {
    let payload: RefreshTokenPayload;

    try {
      payload = this.jwtService.verify<RefreshTokenPayload>(
        incomingRefreshToken,
        {
          secret: process.env.JWT_REFRESH_SECRET,
        },
      );
    } catch {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }

    if (payload.type !== 'refresh' || !payload.jti) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }

    const storedUserId = await this.redisService.get(`refresh:${payload.jti}`);

    if (!storedUserId || Number(storedUserId) !== payload.sub) {
      throw new UnauthorizedException(
        '만료되었거나 이미 사용된 리프레시 토큰입니다.',
      );
    }

    const user = await prisma.users.findUnique({
      where: { id: payload.sub },
      select: { is_banned: true },
    });
    if (user?.is_banned) {
      await this.redisService.del(`refresh:${payload.jti}`);
      throw new ForbiddenException('정지된 계정입니다. 관리자에게 문의하세요.');
    }

    await this.redisService.del(`refresh:${payload.jti}`);

    return this.generateTokens(payload.sub, payload.email, payload.role);
  }

  async revokeRefreshToken(incomingRefreshToken: string): Promise<void> {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(
        incomingRefreshToken,
        { secret: process.env.JWT_REFRESH_SECRET },
      );
      if (payload.jti) {
        await this.redisService.del(`refresh:${payload.jti}`);
      }
    } catch {
      // ignore — already expired or invalid
    }
  }
}
