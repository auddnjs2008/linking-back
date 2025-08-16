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
  LoginResponseDto,
  TokenResponseDto,
  RegisterResponseDto,
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
    type: RegisterResponseDto,
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
      accessToken: await this.authService.issueToken(
        { id: req.user.sub },
        false,
      ),
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

  //-------------------- Google 로그인 ----------------------

  // 구글 로그인 시작포인트
  @Get('/google')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Google Oauth 시작',
    description: 'Google Oauth 인증을 시작합니다.',
  })
  @ApiResponse({
    status: 302,
    description: 'Google 로그인 페이지로 리다이렉트',
  })
  async googleAuth() {}

  //---- 구글 리다이렉트

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
  @ApiResponse({
    status: 400,
    description: 'Google OAuth 에러',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 에러',
  })
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    try {
      // Google OAuth 인증이 완료되면 req.user에 Google 사용자 정보가 들어있음
      const googleUser = req.user;
      if (!googleUser) {
        this.authService.redirectToError(
          res,
          'unknown_error',
          'Google 사용자 정보를 가져올 수 없습니다.',
        );
      }

      // AuthService를 통해 사용자 처리 및 토큰 발급
      const result = await this.authService.handleGoogleUser(googleUser);

      if (!result || !result.accessToken) {
        this.authService.redirectToError(
          res,
          'issue_token',
          '토큰 발급에 실패했습니다.',
        );
      }

      //토큰을 쿠키에 저장(httpOnly를 false로 설정)
      res.cookie('accessToken', result.accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15분
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, //7일
      });

      return this.authService.redirectToSuccess(res);
    } catch (error) {
      console.error('Google Oauth callback error:', error);

      // 에러 타입에 따른 처리
      let errorCode = 'unknown_error';
      let errorMessage = '알 수 없는 오류가 발생했습니다.';

      if (error.name === 'ValidationError') {
        errorCode = 'validation_error';
        errorMessage = '사용자 정보 검증에 실패했습니다.';
      } else if (error.name === 'DatabaseError') {
        errorCode = 'database_error';
        errorMessage = '데이터베이스 오류가 발생했습니다.';
      } else if (error.status === 409) {
        errorCode = 'user_exists';
        errorMessage = '이미 존재하는 사용자입니다.';
      } else if (error.status === 400) {
        errorCode = 'bad_request';
        errorMessage = '잘못된 요청입니다.';
      }

      return this.authService.redirectToError(res, errorCode, errorMessage);
    }
  }
}
