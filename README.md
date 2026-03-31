# 🐱 Meawdle API

> API RESTful para a plataforma Meawdle — um catálogo de gatos disponíveis para adoção, com imagens, dados e links diretos para adotar.

## 🚀 Stack

| Tecnologia | Uso |
|---|---|
| **NestJS** | Framework backend (Node.js) |
| **TypeScript** | Tipagem estática |
| **Prisma ORM** | Modelagem e acesso ao banco de dados |
| **PostgreSQL** | Banco de dados relacional |
| **ESLint + Prettier** | Padronização de código |

## 📦 Estrutura do projeto

```
meawdle-api/
├── prisma/
│   └── schema.prisma       # Schema do banco (model Cats)
├── src/
│   ├── cats/                # Módulo de gatos (controller, service, DTOs)
│   ├── prisma/              # Módulo Prisma (service de conexão)
│   ├── app.module.ts        # Módulo raiz
│   └── main.ts              # Bootstrap da aplicação
├── test/                    # Testes e2e
├── nest-cli.json
├── tsconfig.json
└── package.json
```

## 🗄️ Modelo de dados

```prisma
model Cats {
  id           Int    @id @default(autoincrement())
  nome         String @unique
  url_imagem   String
  char_numero  Int
  url_adocao   String
}
```

## ⚡ Como rodar

### Pré-requisitos

- Node.js >= 18
- PostgreSQL rodando localmente ou em cloud
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/jotaveX/meawdle-api.git
cd meawdle-api

# Instale as dependências
npm install

# Configure o banco de dados
# Crie um arquivo .env na raiz com:
# DATABASE_URL="postgresql://user:password@localhost:5432/meawdle"

# Rode as migrations do Prisma
npx prisma migrate dev

# Gere o client do Prisma
npx prisma generate

# Inicie o servidor em modo de desenvolvimento
npm run start:dev
```

O servidor roda por padrão em `http://localhost:3000`.

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run start` | Inicia em modo produção |
| `npm run start:dev` | Inicia em modo watch (dev) |
| `npm run start:prod` | Inicia build de produção |
| `npm run test` | Executa testes unitários |
| `npm run test:e2e` | Executa testes e2e |

## 📡 Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/cats` | Lista todos os gatos disponíveis |
| `GET` | `/cats/:id` | Retorna um gato pelo ID |
| `POST` | `/cats` | Cadastra um novo gato |
| `PATCH` | `/cats/:id` | Atualiza dados de um gato |
| `DELETE` | `/cats/:id` | Remove um gato do catálogo |

## 🔗 Projeto relacionado

- **Frontend:** [meawdle-front](https://github.com/jotaveX/meawdle-front) — Interface Angular que consome esta API

## 📄 Licença

Este projeto é open source.

---

Feito por [João Victor Piloni](https://github.com/jotaveX)
