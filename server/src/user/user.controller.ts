import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ResponseMessage } from '../global/global_decorator/decorator.message';
import { SwaggerResponse } from '../global/global_decorator/decorator.swagger-response';
import { LoginRequest } from './dto/login.request';
import { RegisterRequest } from './dto/register.request';
import { UserProfileResponse } from './dto/user.response';
import { UserService } from './user.service';

const REFRESH_COOKIE = 'refresh_token';
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_MAX_AGE_MS,
    path: '/',
  });
}

@ApiTags('users')
@Controller('/api/v1')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ResponseMessage('회원가입이 완료되었습니다.')
  @Post('auth/register')
  @HttpCode(201)
  @ApiOperation({ summary: '회원가입 후 access_token 반환, refresh_token은 쿠키로 설정' })
  @ApiBody({ type: RegisterRequest })
  @SwaggerResponse(UserProfileResponse, false, 201, '회원가입이 완료되었습니다.')
  async createUser(
    @Body() data: RegisterRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.userService.createUser(data);
    setRefreshCookie(res, refreshToken);
    return { user, accessToken };
  }

  @ResponseMessage('로그인이 완료되었습니다.')
  @Post('auth/login')
  @HttpCode(200)
  @ApiOperation({ summary: '로그인 후 access_token 반환, refresh_token은 쿠키로 설정' })
  @ApiBody({ type: LoginRequest })
  @SwaggerResponse(UserProfileResponse, false, 200, '로그인이 완료되었습니다.')
  async loginUser(
    @Body() data: LoginRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.userService.loginUser(data);
    setRefreshCookie(res, refreshToken);
    return { user, accessToken };
  }

  @ResponseMessage('사용자 목록 조회에 성공했습니다.')
  @Get('users')
  @ApiOperation({ summary: '전체 사용자 목록을 조회합니다.' })
  @SwaggerResponse(UserProfileResponse, true, 200, '사용자 목록 조회에 성공했습니다.')
  getUsers() {
    return this.userService.getUsers();
  }

  @ResponseMessage('사용자 프로필 조회에 성공했습니다.')
  @Get('users/:userId')
  @ApiOperation({ summary: '사용자 프로필을 조회합니다.' })
  @ApiParam({ name: 'userId', type: Number, description: '사용자 ID' })
  @SwaggerResponse(UserProfileResponse, false, 200, '사용자 프로필 조회에 성공했습니다.')
  getUserProfile(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.getUserProfile(userId);
  }
}
