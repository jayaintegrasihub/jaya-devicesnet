import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInUserDto } from './dto/signin.dto';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { AuthPayload } from './auth.decorator';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AccessTokenGuard } from './guards/access-token.guard';

@Controller('auth')
@UsePipes(ZodValidationPipe)
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() { username, password }: SignInUserDto) {
    const { tokens } = await this.authService.signIn(username, password);
    return {
      status: 'success',
      data: { ...tokens },
    };
  }

  @Get('/refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @AuthPayload() { id, refreshToken }: { refreshToken: string; id: string },
  ) {
    const tokens = await this.authService.refreshTokens(id, refreshToken);
    return { status: 'success', data: tokens };
  }

  @Get('/signout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async signout(@AuthPayload() { id }: { id: string }) {
    await this.authService.signout(id);
    return { status: 'success', data: null };
  }
}
