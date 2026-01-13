/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `Cats` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Cats_nome_key" ON "Cats"("nome");
