-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityAction" ADD VALUE 'FILE_UPLOAD';
ALTER TYPE "ActivityAction" ADD VALUE 'FILE_DELETE';

-- AlterEnum
ALTER TYPE "ActivityEntity" ADD VALUE 'FILE';

-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "emailSent" BOOLEAN NOT NULL DEFAULT false;
