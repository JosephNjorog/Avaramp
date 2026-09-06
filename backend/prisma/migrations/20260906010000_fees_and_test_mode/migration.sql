-- AlterTable
ALTER TABLE "ApiKey" ADD COLUMN     "isTest" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "feeAmount" TEXT,
ADD COLUMN     "feeBps" INTEGER,
ADD COLUMN     "isTest" BOOLEAN NOT NULL DEFAULT false;

