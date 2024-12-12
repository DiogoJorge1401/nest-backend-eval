import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { MongoId } from 'src/types/mongo-id.types';
import { User } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signIn(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (!(await user.comparePassword(pass))) {
      throw new UnauthorizedException();
    }

    return this.generateTokens(user);
  }

  async refresh(refreshToken: string) {
    try {
      const { sub, email } = await this.jwtService.verifyAsync<Promise<any>>(
        refreshToken,
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        },
      );

      const newRefreshToken = await this.jwtService.signAsync(
        { sub, email },
        {
          expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        },
      );

      const newAccessToken = await this.jwtService.signAsync({ sub, email });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException();
    }
  }

  async singOut(userId: MongoId) {
    return this.redis.del(`user:${userId}`);
  }

  private async generateTokens(user: User) {
    const payload = { sub: user._id, email: user.email };

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });

    const accessToken = await this.jwtService.signAsync(payload);

    await this.redis.set(`user:${user._id}`, JSON.stringify(user));

    return { accessToken, refreshToken };
  }
}
