import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import e from 'express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import './utils/cloudinary';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.setGlobalPrefix('/v1/api');

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({ origin: process.env.ORIGIN });

  app.use(cookieParser());

  app.use(e.json({ limit: '50mb' }));

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Server is running on ${process.env.PORT ?? 3000}`);
  });
}

bootstrap();
