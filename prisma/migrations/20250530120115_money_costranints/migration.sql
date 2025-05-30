-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_itemId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_createdByUsername_fkey";

-- DropForeignKey
ALTER TABLE "StripeLink" DROP CONSTRAINT "StripeLink_articleId_fkey";

-- DropForeignKey
ALTER TABLE "StripeLink" DROP CONSTRAINT "StripeLink_eventId_fkey";

-- DropForeignKey
ALTER TABLE "StripeLink" DROP CONSTRAINT "StripeLink_itemId_fkey";

-- DropIndex
DROP INDEX "User_stripeConnectId_key";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "createdByUsername" SET DEFAULT 'DELETED_USER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailToken" TEXT,
ADD COLUMN     "tokenExpires" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdByUsername_fkey" FOREIGN KEY ("createdByUsername") REFERENCES "User"("username") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeLink" ADD CONSTRAINT "StripeLink_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeLink" ADD CONSTRAINT "StripeLink_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "EventArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeLink" ADD CONSTRAINT "StripeLink_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
