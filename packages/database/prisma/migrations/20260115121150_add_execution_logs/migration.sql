/*
  Warnings:

  - The `constraints` column on the `problems` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "examples" JSONB,
DROP COLUMN "constraints",
ADD COLUMN     "constraints" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "execution_logs" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "execution_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "execution_logs" ADD CONSTRAINT "execution_logs_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
