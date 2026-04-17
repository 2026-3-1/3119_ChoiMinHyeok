import {
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';

const REFRESH_COOKIE = 'refresh_token';
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_MAX_AGE_MS,
    path: '/',
  });
}

@ApiTags('auth')
@Controller('/api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'HTTP-only 쿠키의 refresh_token으로 새 access_token 발급' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const incoming = (req.cookies as Record<string, string>)?.[REFRESH_COOKIE];
    if (!incoming) throw new UnauthorizedException('리프레시 토큰이 없습니다.');

    const { accessToken, refreshToken } =
      await this.authService.rotateTokens(incoming);

    setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: '로그아웃: refresh_token 무효화 및 쿠키 제거' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const incoming = (req.cookies as Record<string, string>)?.[REFRESH_COOKIE];
    if (incoming) {
      await this.authService.revokeRefreshToken(incoming);
    }
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    return { message: '로그아웃되었습니다.' };
  }
}
