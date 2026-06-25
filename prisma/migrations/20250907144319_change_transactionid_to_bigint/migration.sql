/*
  Warnings:

  - The primary key for the `Transaction` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "banking"."Transaction" DROP CONSTRAINT "Transaction_pkey",
ALTER COLUMN "transactionId" SET DATA TYPE bigint,
ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY ("transactionId");
