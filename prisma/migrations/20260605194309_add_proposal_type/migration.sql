-- CreateEnum
CREATE TYPE "ProposalType" AS ENUM ('edit');

-- AlterTable
ALTER TABLE "place" ADD COLUMN     "proposalType" "ProposalType";
