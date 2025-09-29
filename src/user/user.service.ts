import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from './entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { Link } from 'src/link/entity/link.entity';
import { Group } from 'src/group/entity/group.entity';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly commonService: CommonService,

    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,

    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, loginType } = createUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (user) {
      throw new BadRequestException('이미 가입한 이메일입니다.');
    }

    // OAuth 사용자인 경우 비밀번호 해싱하지 않음
    let hashedPassword = null;

    if (password) {
      hashedPassword = await bcrypt.hash(
        password,
        +this.configService.get<string>('HASH_ROUNDS'),
      );
    }

    await this.userRepository.save({
      name,
      email,
      password: hashedPassword,
      loginType,
    });

    return this.userRepository.findOne({ where: { email } });
  }

  async update(updateUserDto: UpdateUserDto, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }

    //----- 패스워드 변경 -------------------------
    const newPassword = updateUserDto.password
      ? await bcrypt.hash(
          updateUserDto.password,
          this.configService.get<string>('HASH_ROUNDS'),
        )
      : user.password;

    //--------이름 변경 --------------------------------
    const newName = updateUserDto.name ?? user.name;

    //-----------------------------------------------
    await this.userRepository.update(
      { id: userId },
      { name: newName, password: newPassword },
    );

    // 업데이트된 사용자 정보 반환
    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    return updatedUser;
  }

  async findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new BadRequestException('존재하는 유저 아이디가 없습니다.');
    }

    return user;
  }

  async uploadProfileImage(file: Express.Multer.File, userId: number) {
    // 파일 존재 여부 확인
    if (!file) {
      throw new BadRequestException('파일이 선택되지 않았습니다.');
    }

    // 이미지 파일만 허용
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('이미지 파일만 업로드 가능합니다.');
    }

    // 파일 크기 제한 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('파일 크기는 5MB를 초과할 수 없습니다.');
    }

    // 사용자 존재 여부 확인
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }

    // S3에 이미지 업로드
    const { fileName, imageUrl } = await this.commonService.uploadProfileImage(
      file,
      userId,
    );

    // 사용자 프로필 이미지 URL 업데이트
    await this.userRepository.update({ id: userId }, { profile: imageUrl });

    return {
      fileName,
      imageUrl,
      message: '프로필 이미지가 성공적으로 업로드되었습니다.',
    };
  }

  async findUserStats(userId: number) {
    const linkCount = await this.linkRepository.count({
      where: { user: { id: userId } },
    });

    const groupCount = await this.groupRepository.count({
      where: { user: { id: userId } },
    });

    const linkBookmarkCount = await this.linkRepository
      .createQueryBuilder('link')
      .leftJoin('link.bookmarkedUsers', 'bookmarkUser')
      .where('link.user.id = :userId', { userId })
      .select('COUNT(bookmarkUser.linkId)', 'bookmarkCount')
      .getRawOne();

    const groupBookmarkCount = await this.groupRepository
      .createQueryBuilder('group')
      .leftJoin('group.bookmarkedUsers', 'bookmarkUser')
      .where('group.user.id = :userId', { userId })
      .select('COUNT(bookmarkUser.groupId)', 'bookmarkCount')
      .getRawOne();

    return {
      createdLinkCount: linkCount,
      createdGroupCount: groupCount,
      receivedLinkBookmark: parseInt(linkBookmarkCount.bookmarkCount),
      receivedGroupBookmark: parseInt(groupBookmarkCount.bookmarkCount),
    };
  }
}
