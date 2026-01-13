import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
require('dotenv').config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
  app.enableCors({ origin: {
  origin: [
    process.env.CORS_ORIGIN,
    'http://localhost:4200'                  // Para testes locais
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
} });
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
