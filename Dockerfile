FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
RUN printf 'import { defineConfig } from "prisma/config";\nexport default defineConfig({\n  schema: "prisma/schema.prisma",\n  datasource: { url: process.env.DATABASE_URL },\n});\n' > prisma.config.mjs

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy --config prisma.config.mjs && node dist/src/main"]
