/*
  Warnings:

  - You are about to drop the column `productId` on the `ProductSeoName` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `ProductSeoName` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ProductSeoName" DROP CONSTRAINT "ProductSeoName_productId_fkey";

-- AlterTable
ALTER TABLE "ProductSeoName" DROP COLUMN "productId";

-- CreateTable
CREATE TABLE "_ProductToProductSeoName" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToProductSeoName_AB_unique" ON "_ProductToProductSeoName"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToProductSeoName_B_index" ON "_ProductToProductSeoName"("B");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSeoName_name_key" ON "ProductSeoName"("name");

-- AddForeignKey
ALTER TABLE "_ProductToProductSeoName" ADD CONSTRAINT "_ProductToProductSeoName_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToProductSeoName" ADD CONSTRAINT "_ProductToProductSeoName_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductSeoName"("id") ON DELETE CASCADE ON UPDATE CASCADE;
