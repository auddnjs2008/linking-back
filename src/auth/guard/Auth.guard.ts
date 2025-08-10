import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Public } from '../decorator/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get(Public, context.getHandler());

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { sub: number; type: string };

    if (!user) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    // 기본적인 인가 체크 추가
    if (!user.sub || user.type !== 'access') {
      throw new UnauthorizedException('유효하지 않은 사용자 정보입니다.');
    }

    return true;
  }
}
