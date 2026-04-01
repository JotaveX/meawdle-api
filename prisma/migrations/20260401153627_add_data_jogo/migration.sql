/*
  Warnings:

  - A unique constraint covering the columns `[data_jogo]` on the table `Cats` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Cats" ADD COLUMN     "data_jogo" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Cats_data_jogo_key" ON "Cats"("data_jogo");
