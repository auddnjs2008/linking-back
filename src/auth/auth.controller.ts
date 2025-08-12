import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Authorization } from './decorator/authorization.decorator';
import { RegisterUserDto } from './dto/register-user.dto';
import { GoogleAuthGuard } from './guard/googleAuth.guard';
import {
  AuthResponseDto,
  LoginResponseDto,
  TokenResponseDto,
} from './dto/auth-response.dto';
import { Public } from './decorator/public.decorator';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @ApiOperation({
    summary: '사용자 등록',
    description: '새로운 사용자를 등록합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '사용자 등록 성공',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 사용자',
  })
  registerUser(
    @Authorization() token: string,
    @Body() registerUserDto: RegisterUserDto,
  ) {
    return this.authService.register(token, registerUserDto);
  }

  @Post('refresh')
  @Public()
  @ApiOperation({
    summary: '액세스 토큰 갱신',
    description: '리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  async rotateAccessToken(@Request() req) {
    return {
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }

  @Post('login')
  @Public()
  @ApiOperation({
    summary: '로그인',
    description:
      'Authorization: Basic token(이메일:패스워드 base64인코딩) 한 걸 기본으로 로그인',
  })
  @ApiResponse({
    status: 201,
    description: '로그인 성공',
    type: LoginResponseDto,
  })
  async login(@Authorization() token: string) {
    return this.authService.login(token);
  }

  @Get('/google/callback')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Google OAuth 콜백',
    description: 'Google OAuth 인증 완료 후 처리',
  })
  @ApiResponse({
    status: 302,
    description: '프론트엔드로 리다이렉트',
  })
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    // Google OAuth 인증이 완료되면 req.user에 Google 사용자 정보가 들어있음
    const googleUser = req.user;

    // AuthService를 통해 사용자 처리 및 토큰 발급
    const result = await this.authService.handleGoogleUser(googleUser);

    // 방법 1: 프론트엔드로 리다이렉트 (토큰을 URL 파라미터로 전달)
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;

    return res.redirect(redirectUrl);
  }
}
