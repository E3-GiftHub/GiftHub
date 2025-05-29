/*
  Warnings:

  - You are about to drop the column `contributorUsername` on the `Contribution` table. All the data in the column will be lost.
  - The primary key for the `EventArticle` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Mark` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `creatorUsername` on the `StripeLink` table. All the data in the column will be lost.
  - Added the required column `guestUsername` to the `Contribution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guestUsername` to the `StripeLink` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_articleId_fkey";

-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_contributorUsername_fkey";

-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Mark" DROP CONSTRAINT "Mark_articleId_fkey";

-- DropForeignKey
ALTER TABLE "Mark" DROP CONSTRAINT "Mark_eventId_fkey";

-- DropForeignKey
ALTER TABLE "StripeLink" DROP CONSTRAINT "StripeLink_articleId_fkey";

-- DropForeignKey
ALTER TABLE "StripeLink" DROP CONSTRAINT "StripeLink_creatorUsername_fkey";

-- DropIndex
DROP INDEX "Invitation_guestUsername_idx";

-- DropIndex
DROP INDEX "StripeLink_creatorUsername_eventId_articleId_amount_currenc_idx";

-- DropIndex
DROP INDEX "StripeLink_stripePaymentLinkId_idx";

-- AlterTable
ALTER TABLE "Contribution" DROP COLUMN "contributorUsername",
ADD COLUMN     "guestUsername" TEXT NOT NULL,
ADD COLUMN     "itemId" INTEGER,
ALTER COLUMN "eventId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "EventArticle" DROP CONSTRAINT "EventArticle_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "EventArticle_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Mark" DROP CONSTRAINT "Mark_pkey",
ADD COLUMN     "itemId" INTEGER,
ALTER COLUMN "eventId" DROP NOT NULL,
ADD CONSTRAINT "Mark_pkey" PRIMARY KEY ("markerUsername", "articleId");

-- AlterTable
ALTER TABLE "StripeLink" DROP COLUMN "creatorUsername",
ADD COLUMN     "guestUsername" TEXT NOT NULL,
ADD COLUMN     "itemId" INTEGER,
ALTER COLUMN "eventId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Invitation_guestUsername_eventId_idx" ON "Invitation"("guestUsername", "eventId");

-- CreateIndex
CREATE INDEX "Invitation_eventId_idx" ON "Invitation"("eventId");

-- CreateIndex
CREATE INDEX "Invitation_status_idx" ON "Invitation"("status");

-- CreateIndex
CREATE INDEX "Item_retailerId_idx" ON "Item"("retailerId");

-- CreateIndex
CREATE INDEX "Media_uploaderUsername_eventId_idx" ON "Media"("uploaderUsername", "eventId");

-- CreateIndex
CREATE INDEX "StripeLink_eventId_articleId_status_idx" ON "StripeLink"("eventId", "articleId", "status");

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "EventArticle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_guestUsername_fkey" FOREIGN KEY ("guestUsername") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "EventArticle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeLink" ADD CONSTRAINT "StripeLink_guestUsername_fkey" FOREIGN KEY ("guestUsername") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeLink" ADD CONSTRAINT "StripeLink_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "EventArticle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeLink" ADD CONSTRAINT "StripeLink_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
