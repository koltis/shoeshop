-- DropForeignKey
ALTER TABLE "ProductSeoName" DROP CONSTRAINT "ProductSeoName_productId_fkey";

-- AddForeignKey
ALTER TABLE "ProductSeoName" ADD CONSTRAINT "ProductSeoName_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
