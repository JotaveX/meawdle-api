import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from 'prisma/generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 1. Cria o pool do driver 'pg' usando a string de conexão
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL
    });

    // 2. Passa o pool para o adaptador do Prisma
    const adapter = new PrismaPg(pool);

    // 3. Inicializa o PrismaClient com o adaptador
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}