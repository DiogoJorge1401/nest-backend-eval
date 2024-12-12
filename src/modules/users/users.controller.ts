import { Body, Controller, Put, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { UsersService } from './users.service';
import { ApiCookieAuth } from '@nestjs/swagger';

@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiCookieAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Put('/password')
  updatePassword(@Request() req, @Body() body: UpdatePasswordDto) {
    return this.usersService.updatePassword(req.user._id, body);
  }
}
