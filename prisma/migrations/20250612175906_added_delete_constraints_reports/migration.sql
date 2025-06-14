-- DropForeignKey
ALTER TABLE "EventReport" DROP CONSTRAINT "EventReport_reportedByUsername_fkey";

-- DropForeignKey
ALTER TABLE "UserReport" DROP CONSTRAINT "UserReport_reportedByUsername_fkey";

-- AlterTable
ALTER TABLE "EventReport" ALTER COLUMN "reportedByUsername" SET DEFAULT 'DELETED_USER';

-- AlterTable
ALTER TABLE "UserReport" ALTER COLUMN "reportedByUsername" SET DEFAULT 'DELETED_USER';

-- AddForeignKey
ALTER TABLE "UserReport" ADD CONSTRAINT "UserReport_reportedByUsername_fkey" FOREIGN KEY ("reportedByUsername") REFERENCES "User"("username") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventReport" ADD CONSTRAINT "EventReport_reportedByUsername_fkey" FOREIGN KEY ("reportedByUsername") REFERENCES "User"("username") ON DELETE SET DEFAULT ON UPDATE CASCADE;
