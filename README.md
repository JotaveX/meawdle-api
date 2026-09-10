# 🐱 Meawdle API

> Backend do Meawdle, um Wordle diário em que a "palavra" do dia é sempre o nome de um gato real disponível para adoção. Esta API fornece o gato do dia (e de qualquer dia anterior) para o [meawdle-front](../meawdle-front) e mantém a base de gatos sincronizada a partir de um site de adoção.

## 🚀 Stack

| Tecnologia | Uso |
|---|---|
| **NestJS 11** | Framework backend (Node.js) |
| **TypeScript** | Tipagem estática |
| **Prisma ORM 7** | Modelagem e acesso ao banco (client gerado em `prisma/generated/prisma`, com driver adapter `pg`) |
| **PostgreSQL** | Banco de dados relacional |
| **Redis** (`cache-manager-redis-yet`) | Cache do gato/datas do dia (`CacheModule` global) |
| **Puppeteer** | Scraping de gatos disponíveis para adoção (script standalone, fora do runtime do Nest) |
| **ESLint + Prettier** | Padronização de código |
| **Vercel** | Deploy como função serverless |

## 🧠 Como o jogo funciona (do ponto de vista da API)

Cada linha da tabela `Cats` é um gato real. O campo `data_jogo` marca em qual dia esse gato é o "gato do dia" — é literalmente a resposta do Wordle daquele dia. A API nunca recebe ou valida palpites: o frontend guarda tudo (tentativas, progresso, letras usadas) no `localStorage` do navegador e só usa a API para descobrir **qual é o gato** e **quantas letras** o nome tem.

Resolução do gato do dia (`CatsService.getCatOfTheDay`):
1. Procura no Redis um valor em cache para a chave `catOfTheDay:<YYYY-MM-DD>`.
2. Se não houver cache, busca no banco um `Cats` cujo `data_jogo` seja hoje.
3. Se nenhum gato tiver `data_jogo` marcado para hoje (fallback), calcula um índice determinístico: `diasDesde('2024-01-01') % totalDeGatos`, sobre todos os gatos ordenados por `id`.

`getAvailableDates()` só retorna datas `<= hoje`, para não revelar respostas de dias futuros por engano.

## 📦 Estrutura do projeto

```
meawdle-api/
├── api/
│   └── index.js             # Entry point serverless (Vercel): builda e cacheia a app Nest, encaminha o request
├── prisma/
│   ├── schema.prisma         # Schema do banco (model Cats)
│   ├── migrations/
│   └── generated/prisma      # Client do Prisma gerado (custom output, não fica em node_modules/@prisma/client)
├── scripts/
│   └── scrape.mjs            # Script Puppeteer standalone que raspa catland.org.br/adote e faz POST em /scraping/sync
├── src/
│   ├── cats/                 # Módulo de gatos: controller, service, DTOs, entity
│   ├── prisma/                # Módulo/serviço Prisma (PrismaClient + pg.Pool + PrismaPg adapter)
│   ├── scraping/              # Módulo de sincronização (recebe o payload do scrape.mjs)
│   ├── app.module.ts          # Módulo raiz (registra CacheModule global com Redis)
│   └── main.ts                # Bootstrap local/dev (CORS, porta)
├── test/                      # Testes e2e
├── .github/workflows/
│   └── scraping.yml           # Cron semanal (domingo 03h UTC) que roda scripts/scrape.mjs
├── Dockerfile
├── vercel.json                # Rewrites + build command (prisma generate/migrate + nest build)
└── package.json
```

## 🗄️ Modelo de dados

```prisma
model Cats {
  id          Int       @id @default(autoincrement())
  nome        String    @unique   // resposta do jogo (nome do gato)
  url_imagem  String
  char_numero Int                 // número de letras do nome, usado pelo frontend p/ montar o grid
  url_adocao  String
  data_jogo   DateTime? @unique   // dia em que esse gato é o "gato do dia" (null = ainda não escalado)
}
```

## ⚡ Como rodar

### Pré-requisitos

- Node.js >= 18
- PostgreSQL rodando localmente ou em cloud
- Redis rodando localmente ou em cloud (opcional em dev: sem `REDIS_HOST` a app sobe sem cache, sem quebrar)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/jotaveX/meawdle-api.git
cd meawdle-api

# Instale as dependências
npm install

# Configure o .env na raiz:
# DATABASE_URL="postgresql://user:password@localhost:5432/meawdle"
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=
# CORS_ORIGIN=http://localhost:4200
# SCRAPING_API_KEY=alguma-chave-secreta   # usada pelo scripts/scrape.mjs para autenticar em /scraping/sync

# Rode as migrations do Prisma
npx prisma migrate dev

# Gere o client do Prisma (saída customizada em prisma/generated/prisma)
npx prisma generate

# (opcional) popule o banco com gatos de exemplo
npx prisma db seed

# Inicie o servidor em modo de desenvolvimento
npm run start:dev
```

O servidor roda por padrão em `http://localhost:3000`.

> Importe o tipo do client Prisma de `prisma/generated/prisma/client`, **não** de `@prisma/client` — o output é customizado (ver `src/prisma/prisma.service.ts`).

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run start` | Inicia em modo produção (sem watch) |
| `npm run start:dev` | Inicia em modo watch (dev) |
| `npm run start:debug` | Inicia com debugger + watch |
| `npm run build` | `prisma generate && nest build` |
| `npm run lint` | ESLint com `--fix` sobre `src/apps/libs/test` |
| `npm run format` | Prettier sobre `src` e `test` |
| `npm run test` | Testes unitários (Jest, `*.spec.ts`) |
| `npm run test:watch` | Testes unitários em modo watch |
| `npm run test:cov` | Testes unitários com cobertura |
| `npm run test:e2e` | Testes e2e (`test/*.e2e-spec.ts`) |

```bash
# Rodar um único arquivo de teste
npx jest src/cats/cats.service.spec.ts
```

## 📡 Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/cats/catOfTheDay` | Retorna o gato do dia (resposta do Wordle de hoje) |
| `GET` | `/cats/catByDate/:date` | Retorna o gato escalado para uma data específica (`YYYY-MM-DD`), para jogar dias anteriores |
| `GET` | `/cats/availableDates` | Lista as datas (`<= hoje`) que já têm um gato escalado, usada pelo calendário do frontend |
| `POST` | `/scraping/sync` | Recebe uma lista de gatos raspados e sincroniza com o banco. Exige header `x-api-key` igual a `SCRAPING_API_KEY` |

### Sincronização de gatos (`POST /scraping/sync`)

Chamado pelo `scripts/scrape.mjs`, que roda semanalmente via GitHub Actions (domingos às 03:00 UTC, `.github/workflows/scraping.yml`) ou manualmente via `workflow_dispatch`. `ScrapingService.syncCatsToDatabase`:

- Ignora nomes com espaço (o nome vira a "palavra" do Wordle, então precisa ser uma palavra só).
- Para gatos novos (por `nome` único), cria o registro e atribui o próximo `data_jogo` sequencial após o maior já usado (base: `2026-01-01`).
- Para gatos que já existem, apenas atualiza `url_imagem` e `url_adocao`, sem mexer no `data_jogo` já atribuído.

## 🚢 Deploy

Publicado na Vercel como função serverless: `api/index.js` constrói (e cacheia entre invocações) uma instância Nest a partir de `dist/src/app.module` e repassa cada request ao adapter HTTP subjacente. `vercel.json` reescreve todas as rotas para `/api` e roda `prisma generate && prisma migrate deploy && nest build` no build (script `vercel-build`) — as migrations são aplicadas automaticamente a cada deploy.

CORS é restrito a `CORS_ORIGIN` (env var) + `http://localhost:4200` para dev local — configurado tanto em `src/main.ts` quanto em `api/index.js`; mantenha os dois em sincronia se o comportamento de CORS mudar.

## 🔗 Projeto relacionado

- **Frontend:** [meawdle-front](../meawdle-front) — Interface Angular (Wordle) que consome esta API

## 📄 Licença

UNLICENSED — projeto pessoal, não licenciado para reuso.

---

Feito por [João Victor Piloni](https://github.com/jotaveX)
