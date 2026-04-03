import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cache } from 'cache-manager';

@Injectable()
export class CatsService {

  constructor(private prisma: PrismaService, @Inject(CACHE_MANAGER) private cache: Cache) {}

  async getCatOfTheDay() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const key = `catOfTheDay:${today.toISOString().split('T')[0]}`;

    const cachedCat = await this.cache.get(key);
    if (cachedCat) return cachedCat;

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
    await this.cache.set(key, allCats[catIndex]);
    return allCats[catIndex];
  }

  async getCatByDate(dateStr: string) {
    const date = new Date(dateStr + 'T00:00:00.000Z');
    const key = `catOfTheDay:${date.toISOString().split('T')[0]}`;

    const cachedCat = await this.cache.get(key);
    if (cachedCat) return cachedCat;

    const cat = await this.prisma.cats.findFirst({
      where: { data_jogo: date },
    });

    await this.cache.set(key, cat);
    
    return cat;
  }

  async getAvailableDates() {
    const key = 'availableDates';
    const cachedDates = await this.cache.get(key);
    if (cachedDates) return cachedDates;

    const cats = await this.prisma.cats.findMany({
      where: { data_jogo: { not: null } },
      select: { data_jogo: true },
      orderBy: { data_jogo: 'asc' },
    });

    await this.cache.set(key, cats);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Retorna apenas datas até hoje (não revelar gatos futuros)
    return cats
      .filter(c => c.data_jogo && c.data_jogo <= today)
      .map(c => c.data_jogo!.toISOString().split('T')[0]);
  }
}
