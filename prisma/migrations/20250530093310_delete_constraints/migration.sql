-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_articleId_fkey";

-- DropForeignKey
ALTER TABLE "EventArticle" DROP CONSTRAINT "EventArticle_itemId_fkey";

-- AlterTable
ALTER TABLE "Contribution" ALTER COLUMN "articleId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "EventArticle" ALTER COLUMN "itemId" SET DEFAULT -1;

-- AddForeignKey
ALTER TABLE "EventArticle" ADD CONSTRAINT "EventArticle_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "EventArticle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
