/**
 * Script de scraping standalone.
 * Roda via GitHub Actions (ou local com Node.js + Puppeteer instalado).
 *
 * Uso:
 *   API_URL=https://meawdle-api.vercel.app SCRAPING_API_KEY=chave node scripts/scrape.mjs
 */

import puppeteer from 'puppeteer';

const API_URL = process.env.API_URL || 'https://meawdle-api.vercel.app';
const API_KEY = process.env.SCRAPING_API_KEY;

if (!API_KEY) {
  console.error('SCRAPING_API_KEY não definida.');
  process.exit(1);
}

async function scrapeCats() {
  console.log('Iniciando scraping de catland.org.br/adote ...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://catland.org.br/adote', { waitUntil: 'networkidle2', timeout: 60000 });

    // Scroll até carregar todos os gatos
    let lastHeight = await page.evaluate(() => document.body.scrollHeight);
    const maxScrolls = 50;

    for (let i = 0; i < maxScrolls; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise(r => setTimeout(r, 3000));

      const newHeight = await page.evaluate(() => document.body.scrollHeight);
      if (newHeight === lastHeight) {
        console.log(`Scroll finalizado após ${i + 1} rolagens.`);
        break;
      }
      lastHeight = newHeight;
      console.log(`Rolagem ${i + 1}, altura: ${newHeight}`);
    }

    // Extrair dados
    const cats = await page.evaluate(() => {
      const result = [];
      const seen = new Set();

      document.querySelectorAll('div.jet-listing-grid__item').forEach(item => {
        const nameEl = item.querySelector('h2.elementor-heading-title');
        const imgEl = item.querySelector('img');
        const linkEl = item.querySelector('a');

        const nome = nameEl?.textContent?.trim() || '';
        if (!nome || seen.has(nome)) return;
        seen.add(nome);

        result.push({
          nome,
          url_imagem: imgEl?.getAttribute('src') || '',
          char_numero: nome.length,
          url_adocao: linkEl?.getAttribute('href') || '',
        });
      });

      return result;
    });

    console.log(`${cats.length} gatos extraídos.`);
    return cats;
  } finally {
    await browser.close();
  }
}

async function syncToApi(cats) {
  console.log(`Enviando ${cats.length} gatos para ${API_URL}/scraping/sync ...`);

  const res = await fetch(`${API_URL}/scraping/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify(cats),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API respondeu ${res.status}: ${text}`);
  }

  const result = await res.json();
  console.log('Resultado:', result);
  return result;
}

try {
  const cats = await scrapeCats();
  if (cats.length === 0) {
    console.log('Nenhum gato encontrado. Abortando sync.');
    process.exit(0);
  }
  await syncToApi(cats);
  console.log('Scraping e sync concluídos com sucesso!');
} catch (err) {
  console.error('Erro:', err);
  process.exit(1);
}
