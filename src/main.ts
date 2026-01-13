import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
require('dotenv').config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
// O CORS deve ser uma das primeiras coisas!
  app.enableCors({
    origin: '*', // Teste com '*' para garantir que o problema é aqui
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
