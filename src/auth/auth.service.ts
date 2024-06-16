import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signIn(username: string, password: string) {
    const user = await this.usersService.find({ username: username });
    if (bcrypt.compareSync(password, user.password)) {
      const tokens = await this.generateToken(user.id, user.username);
      await this.updateRefreshToken(user.id, tokens.refreshToken);
      return { user, tokens };
    }

    throw new UnauthorizedException({
      username: 'Username/Password mismtach',
      password: 'Username/Password is wrong',
    });
  }

  async generateToken(id: string, username: string) {
    // ref: https://github.com/nestjs/jwt/issues/1369
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken({ id, username }),
      this.signRefreshToken({ id, username }),
    ]);

    return { accessToken, refreshToken };
  }

  async updateRefreshToken(id: string, refreshToken: string) {
    const hashedRefreshToken = bcrypt.hashSync(refreshToken, 10);
    await this.usersService.update({
      where: { id },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  private getSecretAccessToken() {
    return this.configService.get('ACCESS_TOKEN_SECRET');
  }

  private getSecretRefreshToken() {
    return this.configService.get('REFRESH_TOKEN_SECRET');
  }

  signRefreshToken(data: { id: string; username: string }) {
    return this.jwtService.signAsync(data, {
      secret: this.getSecretRefreshToken(),
      expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRATION'),
    });
  }

  signAccessToken(data: { id: string; username: string }) {
    return this.jwtService.signAsync(data, {
      secret: this.getSecretAccessToken(),
      expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRATION'),
    });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.find({ id: userId });
    if (!user.refreshToken) {
      throw new ForbiddenException();
    }

    const isValid = bcrypt.compareSync(refreshToken, user.refreshToken);
    if (!isValid) {
      throw new ForbiddenException();
    }

    const tokens = await this.generateToken(user.id, user.username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  verifyRefreshToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: this.getSecretRefreshToken(),
    });
  }

  verifyAccessToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: this.getSecretAccessToken(),
    });
  }

  signout(id: string) {
    return this.usersService.update({
      where: { id },
      data: { refreshToken: null },
    });
  }
}
