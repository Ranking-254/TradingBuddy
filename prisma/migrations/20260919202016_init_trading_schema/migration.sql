-- CreateEnum
CREATE TYPE "TradeSide" AS ENUM ('LONG', 'SHORT');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('ASIAN', 'LONDON', 'NEW_YORK', 'OVERLAP');

-- CreateEnum
CREATE TYPE "EmotionType" AS ENUM ('CALM', 'FOMO', 'REVENGE', 'ANXIOUS', 'HESITANT');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "broker" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "initialBalance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "ticketId" TEXT,
    "symbol" TEXT NOT NULL,
    "side" "TradeSide" NOT NULL,
    "lotSize" DOUBLE PRECISION NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "exitPrice" DOUBLE PRECISION NOT NULL,
    "stopLoss" DOUBLE PRECISION,
    "takeProfit" DOUBLE PRECISION,
    "pnl" DOUBLE PRECISION NOT NULL,
    "pipsOrPoints" DOUBLE PRECISION,
    "commissionAndSwap" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "openTime" TIMESTAMP(3) NOT NULL,
    "closeTime" TIMESTAMP(3) NOT NULL,
    "session" "SessionType",
    "strategy" TEXT,
    "confluences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "followedRules" BOOLEAN NOT NULL DEFAULT true,
    "emotion" "EmotionType",
    "notes" TEXT,
    "screenshotBefore" TEXT,
    "screenshotAfter" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIReport" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "weekRange" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "analysis" TEXT NOT NULL,
    "metricsJSON" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trade_ticketId_key" ON "Trade"("ticketId");

-- CreateIndex
CREATE INDEX "Trade_accountId_closeTime_idx" ON "Trade"("accountId", "closeTime");

-- CreateIndex
CREATE INDEX "AIReport_accountId_weekRange_idx" ON "AIReport"("accountId", "weekRange");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIReport" ADD CONSTRAINT "AIReport_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
