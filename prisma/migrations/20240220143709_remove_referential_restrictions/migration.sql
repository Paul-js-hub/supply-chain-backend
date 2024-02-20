-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryID_fkey";

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryID_fkey" FOREIGN KEY ("categoryID") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
