/*
  Warnings:

  - A unique constraint covering the columns `[createdByUsername,title]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[guestUsername,eventId]` on the table `Invitation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Event_createdByUsername_title_key" ON "Event"("createdByUsername", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_guestUsername_eventId_key" ON "Invitation"("guestUsername", "eventId");
