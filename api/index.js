const { NestFactory } = require('@nestjs/core');

let app;

async function bootstrap() {
  if (!app) {
    const { AppModule } = require('../dist/src/app.module');
    app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
    app.enableCors({
      origin: [
        process.env.CORS_ORIGIN,
        'http://localhost:4200',
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
    await app.init();
  }
  return app;
}

module.exports = async (req, res) => {
  try {
    const nestApp = await bootstrap();
    const server = nestApp.getHttpAdapter().getInstance();
    server(req, res);
  } catch (error) {
    console.error('Bootstrap error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};
