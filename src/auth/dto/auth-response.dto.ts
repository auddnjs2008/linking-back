import { ApiProperty } from '@nestjs/swagger';
import { LoginType } from 'src/user/entity/user.entity';

// 사용자 정보 DTO
export class UserInfoDto {
  @ApiProperty({ example: 1, description: '사용자 ID' })
  id: number;

  @ApiProperty({ example: '홍길동', description: '사용자 이름' })
  name: string;

  @ApiProperty({ example: 'hong@example.com', description: '사용자 이메일' })
  email: string;

  @ApiProperty({
    enum: LoginType,
    example: LoginType.LOCAL,
    description: '로그인 타입 (local | google)',
  })
  loginType: LoginType;

  @ApiProperty({
    example: 'https://github.com/shadcn.png',
    description: '프로필 이미지 URL',
  })
  profile: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: '계정 생성 시간',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: '계정 정보 수정 시간',
  })
  updatedAt: Date;

  @ApiProperty({
    example: 1,
    description: '데이터 버전',
  })
  version: number;
}

// 회원가입 응답 DTO
export class RegisterResponseDto {
  @ApiProperty({
    description: '생성된 사용자 정보',
    type: UserInfoDto,
  })
  user: UserInfoDto;
}

// 로그인 응답 DTO
export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '액세스 토큰',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '리프레시 토큰',
  })
  refreshToken: string;
}

// 토큰 갱신 응답 DTO
export class TokenResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '새로운 액세스 토큰',
  })
  accessToken: string;
}

// Google OAuth 응답 DTO
export class GoogleAuthResponseDto {
  @ApiProperty({
    description: 'Google OAuth 사용자 정보',
    type: UserInfoDto,
  })
  user: UserInfoDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '액세스 토큰',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '리프레시 토큰',
  })
  refreshToken: string;
}

// 기존 AuthResponseDto는 하위 호환성을 위해 유지 (deprecated)
export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '액세스 토큰',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '리프레시 토큰',
  })
  refreshToken: string;

  @ApiProperty({
    example: 1,
    description: '사용자 ID',
  })
  userId: number;

  @ApiProperty({
    example: '홍길동',
    description: '사용자 이름',
  })
  userName: string;

  @ApiProperty({
    example: 'hong@example.com',
    description: '사용자 이메일',
  })
  userEmail: string;
}
