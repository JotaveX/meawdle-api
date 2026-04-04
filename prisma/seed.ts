import { PrismaClient } from "./generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface CatJson {
    nome: string;
    url_imagem: string;
    char_numero: number;
    url_adocao: string;
}

const cats: CatJson[] = require('./gatos.json');

async function main() {
    const baseDate = new Date('2026-01-01T00:00:00.000Z');

    // Busca o último data_jogo atribuído para continuar a sequência
    const lastCat = await prisma.cats.findFirst({
        where: { data_jogo: { not: null } },
        orderBy: { data_jogo: 'desc' },
    });

    let nextDayOffset = 0;
    if (lastCat?.data_jogo) {
        const diffMs = lastCat.data_jogo.getTime() - baseDate.getTime();
        nextDayOffset = Math.floor(diffMs / (1000 * 3600 * 24)) + 1;
    }

    let inserted = 0;
    let skipped = 0;
    for (let i = 0; i < cats.length; i++) {
        const cat = cats[i];

        if (cat.nome.includes(' ')) {
            skipped++;
            continue;
        }

        const existing = await prisma.cats.findUnique({ where: { nome: cat.nome } });

        if (!existing) {
            const dataJogo = new Date(baseDate);
            dataJogo.setUTCDate(dataJogo.getUTCDate() + nextDayOffset);

            await prisma.cats.create({
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
        }
    }

    // Atribui data_jogo para gatos existentes que ainda não têm
    const catsWithoutDate = await prisma.cats.findMany({
        where: { data_jogo: null },
        orderBy: { id: 'asc' },
    });

    for (const cat of catsWithoutDate) {
        const dataJogo = new Date(baseDate);
        dataJogo.setUTCDate(dataJogo.getUTCDate() + nextDayOffset);

        await prisma.cats.update({
            where: { id: cat.id },
            data: { data_jogo: dataJogo },
        });

        nextDayOffset++;
        inserted++;
    }

    console.log(`Seed concluído: ${inserted} gatos inseridos/atualizados, ${skipped} ignorados (nome com espaço). Total de dias cobertos: ${nextDayOffset}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
