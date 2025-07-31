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
import { AuthService } from './auth.service';
import { Authorization } from './decorator/authorization.decorator';
import { RegisterUserDto } from './dto/register-user.dto';
import { GoogleAuthGuard } from './guard/googleAuth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerUser(
    @Authorization() token: string,
    @Body() registerUserDto: RegisterUserDto,
  ) {
    return this.authService.register(token, registerUserDto);
  }

  @Post('refresh')
  async rotateAccessToken(@Request() req) {
    return {
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }

  @Get('/google/callback')
  @UseGuards(GoogleAuthGuard)
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
