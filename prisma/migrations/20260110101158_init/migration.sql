/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Cats" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "url_imagem" TEXT NOT NULL,

    CONSTRAINT "Cats_pkey" PRIMARY KEY ("id")
);
