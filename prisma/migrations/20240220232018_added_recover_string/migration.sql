/*
  Warnings:

  - A unique constraint covering the columns `[recoverString]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "admin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recoverString" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_recoverString_key" ON "User"("recoverString");
