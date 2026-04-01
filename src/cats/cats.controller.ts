import { Controller, Get, Param } from '@nestjs/common';
import { CatsService } from './cats.service';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get('catOfTheDay')
  getCatOfTheDay() {
    return this.catsService.getCatOfTheDay();
  }

  @Get('catByDate/:date')
  getCatByDate(@Param('date') date: string) {
    return this.catsService.getCatByDate(date);
  }

  @Get('availableDates')
  getAvailableDates() {
    return this.catsService.getAvailableDates();
  }
}
