import { Body, Controller, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Authorization } from './decorator/authorization.decorator';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerUser(
    @Authorization() token: string,
    @Body() registerUserDto: RegisterUserDto,
  ) {
    return this.authService.register(token, registerUserDto);
  }

  @Post('login')
  loginUser(@Authorization() token: string) {
    return this.authService.login(token);
  }

  @Post('refresh')
  async rotateAccessToken(@Request() req) {
    console.log(req);

    return {
      accessToken: await this.authService.issueToken({ id: 1 }, false),
    };
  }
}
