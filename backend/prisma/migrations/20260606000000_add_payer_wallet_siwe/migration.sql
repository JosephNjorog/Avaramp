-- Make email optional (allow NULL) and add walletAddress for SIWE payer auth
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "User" ADD COLUMN "walletAddress" TEXT;
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");
