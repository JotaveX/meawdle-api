/*
  Warnings:

  - Added the required column `char_numero` to the `Cats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cats" ADD COLUMN     "char_numero" INTEGER NOT NULL;
