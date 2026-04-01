import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { ScrapingService } from './scraping.service';

interface CatPayload {
  nome: string;
  url_imagem: string;
  char_numero: number;
  url_adocao: string;
}

@Controller('scraping')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Post('sync')
  async syncCats(
    @Headers('x-api-key') apiKey: string,
    @Body() cats: CatPayload[],
  ) {
    const expectedKey = process.env.SCRAPING_API_KEY;
    if (!expectedKey || apiKey !== expectedKey) {
      throw new UnauthorizedException('Chave de API inválida.');
    }

    return this.scrapingService.syncCatsToDatabase(cats);
  }
}
