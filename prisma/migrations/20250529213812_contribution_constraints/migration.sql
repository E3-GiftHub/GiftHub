/*
  Warnings:

  - Added the required column `updatedAt` to the `Contribution` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_articleId_fkey";

-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_guestUsername_fkey";

-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_itemId_fkey";

-- DropForeignKey
ALTER TABLE "ContributionNotification" DROP CONSTRAINT "ContributionNotification_contributionId_fkey";

-- DropForeignKey
ALTER TABLE "ContributionNotification" DROP CONSTRAINT "ContributionNotification_username_fkey";

-- DropForeignKey
ALTER TABLE "EventArticle" DROP CONSTRAINT "EventArticle_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Mark" DROP CONSTRAINT "Mark_articleId_fkey";

-- DropForeignKey
ALTER TABLE "Mark" DROP CONSTRAINT "Mark_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Mark" DROP CONSTRAINT "Mark_itemId_fkey";

-- DropForeignKey
ALTER TABLE "Mark" DROP CONSTRAINT "Mark_markerUsername_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_uploaderUsername_fkey";

-- DropForeignKey
ALTER TABLE "MediaNotification" DROP CONSTRAINT "MediaNotification_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "MediaNotification" DROP CONSTRAINT "MediaNotification_username_fkey";

-- AlterTable
ALTER TABLE "Contribution" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "eventId" SET DEFAULT -1,
ALTER COLUMN "articleId" SET DEFAULT -1,
ALTER COLUMN "guestUsername" SET DEFAULT 'DELETED_USER',
ALTER COLUMN "itemId" SET DEFAULT -1;

-- AlterTable
ALTER TABLE "Media" ALTER COLUMN "uploaderUsername" SET DEFAULT 'DELETED_USER';

-- CreateIndex
CREATE INDEX "Contribution_guestUsername_eventId_idx" ON "Contribution"("guestUsername", "eventId");

-- CreateIndex
CREATE INDEX "ContributionNotification_username_idx" ON "ContributionNotification"("username");

-- CreateIndex
CREATE INDEX "EventArticle_eventId_idx" ON "EventArticle"("eventId");

-- CreateIndex
CREATE INDEX "EventArticle_itemId_idx" ON "EventArticle"("itemId");

-- CreateIndex
CREATE INDEX "Mark_eventId_idx" ON "Mark"("eventId");

-- CreateIndex
CREATE INDEX "MediaNotification_username_idx" ON "MediaNotification"("username");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_uploaderUsername_fkey" FOREIGN KEY ("uploaderUsername") REFERENCES "User"("username") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventArticle" ADD CONSTRAINT "EventArticle_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_markerUsername_fkey" FOREIGN KEY ("markerUsername") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "EventArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_guestUsername_fkey" FOREIGN KEY ("guestUsername") REFERENCES "User"("username") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "EventArticle"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaNotification" ADD CONSTRAINT "MediaNotification_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaNotification" ADD CONSTRAINT "MediaNotification_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributionNotification" ADD CONSTRAINT "ContributionNotification_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributionNotification" ADD CONSTRAINT "ContributionNotification_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "Contribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
