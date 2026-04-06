import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const clientOrigins = process.env.CLIENT_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: clientOrigins?.length ? clientOrigins : true,
    credentials: true,
  });
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

  await app.listen(process.env.PORT ?? 3010);
}
bootstrap();
