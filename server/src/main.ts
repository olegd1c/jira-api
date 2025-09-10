import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  process.env.TZ = "Europe/Kyiv";
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3007);
}
bootstrap();
