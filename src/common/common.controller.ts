import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CommonService } from './common.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Post('profile')
  @UseInterceptors(
    FileInterceptor('profile', {
      fileFilter: (req, file, callback) => {
        // 이미지만 허용
        if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException('이미지 파일만 업로드 가능합니다.'),
            false,
          );
        }
      },
    }),
  )
  uploadImage(@UploadedFile() profile: Express.Multer.File) {
    return {
      fileName: profile.filename,
    };
  }

  @Post('presigned-url')
  async createPresignedUrl(@Body('fileType') fileType: string) {
    if (!fileType || !['jpg', 'jpeg', 'png'].includes(fileType.toLowerCase())) {
      throw new BadRequestException('jpg 또는 png 파일만 업로드 가능합니다.');
    }

    return {
      url: await this.commonService.createPresignedUrl(
        300,
        fileType.toLowerCase(),
      ),
    };
  }
}
