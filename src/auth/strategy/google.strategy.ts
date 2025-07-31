import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    // Google OAuth에서 받은 프로필 정보를 처리
    const { name, emails, photos } = profile;

    const user = {
      email: emails[0].value,
      firstName: name.givenName || '',
      lastName: name.familyName || '',
      profile: photos?.[0]?.value || 'https://github.com/shadcn.png', // Google 프로필 이미지
      accessToken,
    };

    // 사용자가 존재하는지 확인하고, 없다면 생성
    // 여기서는 UserService를 사용하여 사용자 정보를 처리할 수 있습니다
    done(null, user);
  }
}
