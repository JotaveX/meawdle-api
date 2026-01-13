import { Injectable } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CatsService {

  constructor(private prisma: PrismaService) {}

  async getCatOfTheDay() {
    const allCats = await this.prisma.cats.findMany();

    if (allCats.length === 0) return null;

    // Calcula o número de dias desde uma data base (ex: 01/01/2024)
    const now = new Date();
    const baseDate = new Date('2024-01-01');
    const diffInTime = now.getTime() - baseDate.getTime();
    const daysSinceBase = Math.floor(diffInTime / (1000 * 3600 * 24));

    const catIndex = daysSinceBase % allCats.length;

    return allCats[catIndex];
  }
}
