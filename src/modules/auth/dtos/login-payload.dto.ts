import { IsEmail, IsString } from 'class-validator';

export class LoginPayloadDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
