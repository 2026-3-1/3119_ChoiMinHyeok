import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('인증 토큰이 없습니다.');
    }

    try {
      const payload = this.jwtService.verify<{ sub: number; email: string; role: string; type: string }>(
        token,
        { secret: process.env.JWT_ACCESS_SECRET },
      );

      if (payload.type !== 'access') {
        throw new UnauthorizedException('유효하지 않은 토큰 타입입니다.');
      }

      request['user'] = payload;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    return true;
  }

  private extractToken(request: Request): string | null {
    const auth = request.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return null;
    return auth.slice(7);
  }
}
