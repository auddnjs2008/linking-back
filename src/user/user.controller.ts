import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { CurrentUser } from 'src/auth/decorator/authorization.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('사용자')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({
    summary: '내 정보 조회',
  })
  @ApiResponse({
    status: 200,
    description: '내 정보 조회 성공',
    type: UserResponseDto,
  })
  findMe(@CurrentUser() user: { sub: number }) {
    return this.userService.findOne(user.sub);
  }

  @Get()
  @ApiOperation({
    summary: '사용자 목록 조회',
    description: '모든 사용자를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 목록 조회 성공',
    type: [UserResponseDto],
  })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: '사용자 상세 조회',
    description: '특정 사용자의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '사용자 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '사용자 조회 성공',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Get(':id/stats')
  findUserStats(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findUserStats(id);
  }

  @Post()
  @ApiOperation({
    summary: '사용자 생성',
    description: '새로운 사용자를 생성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '사용자 생성 성공',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 사용자',
  })
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdateUserDto> {
    return this.userService.update(updateUserDto, id);
  }

  @Post('upload-profile-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: '프로필 이미지 업로드',
    description: '사용자의 프로필 이미지를 업로드하고 즉시 저장합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: '프로필 이미지 업로드 성공',
    schema: {
      type: 'object',
      properties: {
        fileName: { type: 'string', description: '업로드된 파일명' },
        imageUrl: { type: 'string', description: '이미지 URL' },
        message: { type: 'string', description: '성공 메시지' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 또는 존재하지 않는 사용자',
  })
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { sub: number },
  ) {
    return this.userService.uploadProfileImage(file, user.sub);
  }
}
