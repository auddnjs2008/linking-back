import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configSerivce: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      next();
      return;
    }

    const token = this.validateBearerToken(authHeader);
    const decodedPayload = this.jwtService.decode(token);

    if (decodedPayload.type !== 'refresh' && decodedPayload.type !== 'access') {
      console.log('lala');
      throw new BadRequestException('잘못된 토큰입니다.');
    }

    try {
      const secretKey =
        decodedPayload.type === 'refresh'
          ? this.configSerivce.get<string>('ACCESS_TOKEN_SECRET')
          : this.configSerivce.get<string>('REFRESH_TOKEN_SECRET');

      const payload = await this.jwtService.verifyAsync(token, {
        secret: secretKey,
      });

      (req as any).user = payload;
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('토큰이 만료되었습니다.');
      }
    }

    // 토큰 유효성 처리를 한다.

    next();
  }

  validateBearerToken(rawToken: string) {
    const bearerSplit = rawToken.split(' ');
    if (bearerSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못 되었습니다.');
    }
    const [bearer, token] = bearerSplit;
    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }
    return token;
  }
}
