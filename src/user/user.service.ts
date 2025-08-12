import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from './entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
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

    const newPassword = updateUserDto.password
      ? await bcrypt.hash(
          updateUserDto.password,
          this.configService.get<string>('HASH_ROUNDS'),
        )
      : user.password;

    await this.userRepository.update(
      { id: userId },
      { ...updateUserDto, password: newPassword },
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
}
