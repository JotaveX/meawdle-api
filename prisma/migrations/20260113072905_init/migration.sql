/*
  Warnings:

  - Added the required column `url_adocao` to the `Cats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cats" ADD COLUMN     "url_adocao" TEXT NOT NULL;
