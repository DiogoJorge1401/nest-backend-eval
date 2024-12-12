import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request as IRequest, Response as IResponse } from 'express';
import { Cookies } from 'src/decorators/cookies.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RegisterUserDto } from '../users/dtos/create-user.dto';
import { User } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginPayloadDto } from './dtos/login-payload.dto';
import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registra um novo usuário' })
  async create(@Body() body: RegisterUserDto) {
    return this.usersService.create(body);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Autentica o usuário e adiciona os cookies de autenticação',
  })
  async signIn(@Body() signInDto: LoginPayloadDto, @Response() res: IResponse) {
    const tokens = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
    );

    this.setAuthCookies(res, tokens);

    res.sendStatus(HttpStatus.OK);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Desloga o usuário' })
  async logout(@Request() req: IRequest, @Response() res: IResponse) {
    await this.authService.singOut((req.user as User)._id);

    res.clearCookie('refresh_token');
    res.clearCookie('access_token');
    res.sendStatus(HttpStatus.OK);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Atualiza os tokens de autenticação',
  })
  async refresh(
    @Response() res: IResponse,
    @Cookies('refresh_token') refreshToken: string,
  ) {
    const tokens = await this.authService.refresh(refreshToken);

    this.setAuthCookies(res, tokens);
    return res.sendStatus(HttpStatus.OK);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    type: User,
  })
  @ApiOperation({ summary: 'Retorna os dados do usuário autenticado' })
  async me(@Request() req: IRequest) {
    return req.user;
  }

  private setAuthCookies(
    res: IResponse,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    const REFRESH_TOKEN_MAX_AGE = +this.configService.get(
      'REFRESH_TOKEN_MAX_AGE',
    );
    const ACCESS_TOKEN_MAX_AGE = +this.configService.get(
      'ACCESS_TOKEN_MAX_AGE',
    );

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_MAX_AGE,
      expires: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE),
    });

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_MAX_AGE,
      expires: new Date(Date.now() + ACCESS_TOKEN_MAX_AGE),
    });
  }
}
