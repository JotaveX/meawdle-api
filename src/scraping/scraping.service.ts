import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

interface CatJson {
  nome: string;
  url_imagem: string;
  char_numero: number;
  url_adocao: string;
}

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  constructor(private prisma: PrismaService) {}

  async syncCatsToDatabase(cats: CatJson[]): Promise<{ inserted: number; updated: number; total: number }> {
    const baseDate = new Date('2026-01-01T00:00:00.000Z');

    const lastCat = await this.prisma.cats.findFirst({
      where: { data_jogo: { not: null } },
      orderBy: { data_jogo: 'desc' },
    });

    let nextDayOffset = 0;
    if (lastCat?.data_jogo) {
      const diffMs = lastCat.data_jogo.getTime() - baseDate.getTime();
      nextDayOffset = Math.floor(diffMs / (1000 * 3600 * 24)) + 1;
    }

    let inserted = 0;
    let updated = 0;

    const validCats = cats.filter(cat => !cat.nome.includes(' '));
    this.logger.log(`Filtrando ${cats.length - validCats.length} gatos com espaço no nome.`);

    for (const cat of validCats) {
      const existing = await this.prisma.cats.findUnique({
        where: { nome: cat.nome },
      });

      if (!existing) {
        const dataJogo = new Date(baseDate);
        dataJogo.setUTCDate(dataJogo.getUTCDate() + nextDayOffset);

        await this.prisma.cats.create({
          data: {
            nome: cat.nome,
            url_imagem: cat.url_imagem,
            char_numero: cat.char_numero,
            url_adocao: cat.url_adocao,
            data_jogo: dataJogo,
          },
        });

        nextDayOffset++;
        inserted++;
      } else {
        await this.prisma.cats.update({
          where: { nome: cat.nome },
          data: {
            url_imagem: cat.url_imagem,
            url_adocao: cat.url_adocao,
          },
        });
        updated++;
      }
    }

    this.logger.log(`Sync concluído: ${inserted} novos, ${updated} atualizados de ${cats.length} total.`);
    return { inserted, updated, total: validCats.length };
  }
}
