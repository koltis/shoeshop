/*
  Warnings:

  - The primary key for the `Gender` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `Gender` table. All the data in the column will be lost.
  - The required column `id` was added to the `Gender` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "_GenderToProduct" DROP CONSTRAINT "_GenderToProduct_A_fkey";

-- AlterTable
ALTER TABLE "Gender" DROP CONSTRAINT "Gender_pkey",
DROP COLUMN "Id",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Gender_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "_GenderToProduct" ADD CONSTRAINT "_GenderToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Gender"("id") ON DELETE CASCADE ON UPDATE CASCADE;
