import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  process.env.TZ = "Europe/Kyiv";
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,          // Видаляє поля, яких немає в DTO
    transform: true,          // АКТИВУЄ @Transform та перетворення типів
    transformOptions: {
      enableImplicitConversion: true, // Допомагає автоматично конвертувати типи
    },
  }));

  app.enableCors();
  await app.listen(3007);
}
bootstrap();
