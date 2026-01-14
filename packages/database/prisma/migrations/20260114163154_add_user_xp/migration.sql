/*
  Warnings:

  - The `status` column on the `submissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `shortDescription` to the `problems` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `track` on the `problems` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ProblemTrack" AS ENUM ('ROUTING', 'MIDDLEWARE', 'SECURITY', 'DATABASE');

-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "shortDescription" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "track",
ADD COLUMN     "track" "ProblemTrack" NOT NULL;

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "score" INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0;
