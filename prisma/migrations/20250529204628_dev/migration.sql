/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Contribution` table. All the data in the column will be lost.
  - You are about to drop the column `iban` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeConnectId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `currency` to the `Contribution` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusPayment" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Contribution" DROP COLUMN "updatedAt",
ADD COLUMN     "currency" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "iban",
ADD COLUMN     "stripeConnectId" TEXT;

-- CreateTable
CREATE TABLE "StripeLink" (
    "id" TEXT NOT NULL,
    "creatorUsername" TEXT NOT NULL,
    "eventId" INTEGER NOT NULL,
    "articleId" INTEGER,
    "stripePaymentLinkId" TEXT NOT NULL,
    "paymentLinkUrl" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "StatusPayment" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StripeLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StripeLink_stripePaymentLinkId_key" ON "StripeLink"("stripePaymentLinkId");

-- CreateIndex
CREATE INDEX "StripeLink_stripePaymentLinkId_idx" ON "StripeLink"("stripePaymentLinkId");

-- CreateIndex
CREATE INDEX "StripeLink_creatorUsername_eventId_articleId_amount_currenc_idx" ON "StripeLink"("creatorUsername", "eventId", "articleId", "amount", "currency", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Event_token_key" ON "Event"("token");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeConnectId_key" ON "User"("stripeConnectId");

-- AddForeignKey
ALTER TABLE "StripeLink" ADD CONSTRAINT "StripeLink_creatorUsername_fkey" FOREIGN KEY ("creatorUsername") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeLink" ADD CONSTRAINT "StripeLink_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeLink" ADD CONSTRAINT "StripeLink_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
