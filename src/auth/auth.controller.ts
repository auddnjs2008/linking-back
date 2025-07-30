import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
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

  @Post('login')
  loginUser(@Authorization() token: string) {
    return this.authService.login(token);
  }

  @Post('refresh')
  async rotateAccessToken(@Request() req) {
    return {
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }

  @Get('/google/login')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {
    console.log('/login');
    console.log(req);
  }

  @Get('/google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req) {
    // Google OAuth 인증이 완료되면 req.user에 Google 사용자 정보가 들어있음
    const googleUser = req.user;

    // AuthService를 통해 사용자 처리 및 토큰 발급
    const result = await this.authService.handleGoogleUser(googleUser);

    // 실제 프로덕션에서는 프론트엔드로 리다이렉트하거나 JSON 응답
    return {
      message: 'Google OAuth 인증 성공',
      ...result,
    };
  }
}
