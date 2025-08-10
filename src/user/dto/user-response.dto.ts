import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '홍길동' })
  name: string;

  @ApiProperty({ example: 'hong@example.com' })
  email: string;

  @ApiProperty({ example: 'google', required: false })
  loginType?: string;

  @ApiProperty({ example: 'https://example.com/profile.jpg', required: false })
  profile?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
