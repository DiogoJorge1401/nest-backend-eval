import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import e from 'express';
import { AppModule } from './app.module';
import metadata from './metadata';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  await SwaggerModule.loadPluginMetadata(metadata);

  const config = new DocumentBuilder()
    .setTitle('User Transactions API')
    .setVersion('1.0')
    .addCookieAuth('access_token', { type: 'http' })
    .build();

  SwaggerModule.setup('/v1/api/docs', app, () =>
    SwaggerModule.createDocument(app, config),
  );

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
