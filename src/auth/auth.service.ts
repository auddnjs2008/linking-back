import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import User, { LoginType } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  //basic [[token]]
  // email:password (base64로 인코딩 되어 있음)

  parseBasicToken(rawToken: string) {
    const basicSplit = rawToken.split(' ');
    if (basicSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }
    const [basic, token] = basicSplit;

    if (basic.toLowerCase() !== 'basic') {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    const decoded = Buffer.from(token, 'base64').toString('utf-8');

    const tokenSplit = decoded.split(':');
    if (tokenSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    const [email, password] = tokenSplit;

    return { email, password };
  }

  async parseBearerToken(rawToken: string, isRefreshToken: boolean) {
    const bearerSplit = rawToken.split(' ');
    if (bearerSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    const [bearer, token] = bearerSplit;

    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      if (isRefreshToken) {
        if (payload.type !== 'refresh') {
          throw new BadRequestException('Refresh 토큰을 입력해주세요!');
        }
      } else {
        if (payload.type !== 'access') {
          throw new BadRequestException('Access 토큰을 입력해주세요!');
        }
      }
    } catch (e: unknown) {
      console.error(e);
      throw new UnauthorizedException('토큰이 만료되었습니다.');
    }
  }

  async authenticated(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('잘못된 로그인 정보입니다.');
    }

    const passOk = await bcrypt.compare(password, user.password);

    if (!passOk) {
      throw new BadRequestException('잘못된 로그인 정보입니다.');
    }
    return user;
  }

  async register(rawToken: string, registerUserDto: RegisterUserDto) {
    const { email, password } = this.parseBasicToken(rawToken);
    return this.userService.create({
      email,
      password,
      loginType: LoginType.LOCAL,
      ...registerUserDto,
    });
  }

  async issueToken(user: { id: number }, isRefreshToken: boolean) {
    const accessTokenSecret = this.configService.get<string>(
      'ACCESS_TOKEN_SECRET',
    );
    const refreshTokenSecret = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET',
    );

    return await this.jwtService.signAsync(
      {
        sub: user.id,
        type: isRefreshToken ? 'refresh' : 'access',
      },
      {
        secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
        expiresIn: isRefreshToken ? '24h' : 300,
      },
    );
  }

  async login(rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken);
    const user = await this.authenticated(email, password);
    return {
      refreshToken: await this.issueToken(user, true),
      accessToken: await this.issueToken(user, false),
    };
  }

  async handleGoogleUser(googleUser: any) {
    const { email, firstName, lastName, profile } = googleUser;

    // 기존 사용자인지 확인
    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // 새 사용자 생성 - firstName과 lastName을 name으로 결합
      const fullName = `${lastName} ${firstName}`.trim();
      user = await this.userService.create({
        email,
        name: fullName,
        password: null, // Google OAuth 사용자는 비밀번호 없음
        loginType: LoginType.GOGGLE, // 로그인 타입 설정
        profile, // Google 프로필 이미지
      });
    }

    // JWT 토큰 발급
    const accessToken = await this.issueToken(user, false);
    const refreshToken = await this.issueToken(user, true);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        loginType: user.loginType,
        profile: user.profile,
      },
      accessToken,
      refreshToken,
    };
  }
}
