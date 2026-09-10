import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './cats/cats.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { ScrapingModule } from './scraping/scraping.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CatsModule,
    PrismaModule,
    ScrapingModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const redisHost = process.env.REDIS_HOST;
        if (!redisHost) {
          return {};
        }

        try {
          const store = await redisStore({
            socket: {
              host: redisHost,
              port: process.env.REDIS_PORT
                ? Number(process.env.REDIS_PORT)
                : 6379,
            },
            password: process.env.REDIS_PASSWORD,
            ttl: 60_000, // ⚠️ agora é em milissegundos no v6+
          });
          return { store };
        } catch (err) {
          // Sem Redis disponível, a aplicação não pode falhar no bootstrap:
          // cai para o cache em memória padrão do cache-manager.
          Logger.error(
            `Redis indisponível, usando cache em memória: ${err}`,
            'CacheModule',
          );
          return {};
        }
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
