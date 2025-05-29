-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_itemId_fkey";

-- DropForeignKey
ALTER TABLE "StripeLink" DROP CONSTRAINT "StripeLink_eventId_fkey";

-- DropForeignKey
ALTER TABLE "StripeLink" DROP CONSTRAINT "StripeLink_guestUsername_fkey";

-- AlterTable
ALTER TABLE "Contribution" ALTER COLUMN "eventId" DROP DEFAULT,
ALTER COLUMN "itemId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "StripeLink" ALTER COLUMN "guestUsername" SET DEFAULT 'DELETED_USER';

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeLink" ADD CONSTRAINT "StripeLink_guestUsername_fkey" FOREIGN KEY ("guestUsername") REFERENCES "User"("username") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeLink" ADD CONSTRAINT "StripeLink_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
