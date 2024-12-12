import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

export const Cookies = createParamDecorator(
  (data: string, input: ExecutionContext) => {
    const request = input.switchToHttp().getRequest<Request>();

    if (data && !request.cookies?.[data]) {
      throw new BadRequestException('Cookie not found');
    }

    return data ? request.cookies?.[data] : request.cookies;
  },
);
