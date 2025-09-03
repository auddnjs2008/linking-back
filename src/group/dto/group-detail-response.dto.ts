import { Link } from 'src/link/entity/link.entity';
import { GroupResponseDto } from './group-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { GroupUserBookmark } from '../entity/group-user-bookmark.entity';

export class GroupDetailResponseDto extends GroupResponseDto {
  @ApiProperty({
    type: [Link],
    description: '그룹에 연결된 링크 목록',
    example: [
      {
        id: 1,
        title: 'React 공식 문서',
        description: 'React 학습을 위한 공식 문서',
        linkUrl: 'https://react.dev',
        thumbnail: 'https://example.com/thumb.jpg',
        tags: ['react', 'frontend'],
        user: {
          id: 1,
          name: '홍길동',
          email: 'hong@example.com',
          loginType: 'google',
          profile: 'https://example.com/profile.jpg',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ],
  })
  linkedLinks: Link[];

  @ApiProperty({
    type: [GroupUserBookmark],
    description: '그룹을 북마크한 사용자 목록',
    example: [
      {
        groupId: 1,
        userId: 2,
        user: {
          id: 1,
          name: '홍길동',
          email: 'hong@example.com',
          loginType: 'google',
          profile: 'https://example.com/profile.jpg',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        isBookmarked: true,
      },
    ],
  })
  bookmarkedUsers: GroupUserBookmark[];
}
