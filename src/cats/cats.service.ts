import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CatsService {

  constructor(private prisma: PrismaService) {}

  async getCatOfTheDay() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const cat = await this.prisma.cats.findFirst({
      where: { data_jogo: today },
    });

    if (cat) return cat;

    // Fallback: se nenhum gato tem a data de hoje, usa o cálculo antigo
    const allCats = await this.prisma.cats.findMany({ orderBy: { id: 'asc' } });
    if (allCats.length === 0) return null;

    const baseDate = new Date('2024-01-01');
    const diffInTime = today.getTime() - baseDate.getTime();
    const daysSinceBase = Math.floor(diffInTime / (1000 * 3600 * 24));
    const catIndex = daysSinceBase % allCats.length;

    return allCats[catIndex];
  }

  async getCatByDate(dateStr: string) {
    const date = new Date(dateStr + 'T00:00:00.000Z');

    const cat = await this.prisma.cats.findFirst({
      where: { data_jogo: date },
    });

    return cat;
  }

  async getAvailableDates() {
    const cats = await this.prisma.cats.findMany({
      where: { data_jogo: { not: null } },
      select: { data_jogo: true },
      orderBy: { data_jogo: 'asc' },
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Retorna apenas datas até hoje (não revelar gatos futuros)
    return cats
      .filter(c => c.data_jogo && c.data_jogo <= today)
      .map(c => c.data_jogo!.toISOString().split('T')[0]);
  }
}
