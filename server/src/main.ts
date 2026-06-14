import './instrument'; // Sentry must be imported first
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { winstonLogger } from './global/logger';

const REQUIRED_ENV = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const;

function validateEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `필수 환경변수 누락: ${missing.join(', ')} — 서버를 시작할 수 없습니다.`,
    );
  }
}

async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create(AppModule, { logger: winstonLogger });

  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  const clientOrigins = process.env.CLIENT_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: clientOrigins?.length ? clientOrigins : true,
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('sec101')
    .setDescription('document of sec101')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs-v1', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
