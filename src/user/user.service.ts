import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (user) {
      throw new BadRequestException('이미 가입한 이메일입니다.');
    }

    const hashPassword = await bcrypt.hash(
      password,
      this.configService.get<string>('HASH_ROUNDS'),
    );
    await this.userRepository.save({
      name,
      email,
      password: hashPassword,
    });

    return this.userRepository.findOne({ where: { email } });
  }
}
