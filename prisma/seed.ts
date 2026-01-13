import { CreateCatDto } from "src/cats/dto/create-cat.dto";
import { PrismaClient } from "./generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL
});

// 2. Passa o pool para o adaptador do Prisma
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });
const cats: CreateCatDto[] =  require('./gatos.json')

async function main() {
    return prisma.cats.createMany({data: cats})
}

main().then((res) => {
        console.log(res);
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });