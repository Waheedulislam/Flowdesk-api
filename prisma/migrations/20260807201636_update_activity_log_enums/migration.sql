/*
  Warnings:

  - The values [FILE] on the enum `ActivityEntity` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityAction" ADD VALUE 'ADD_MEMBER';
ALTER TYPE "ActivityAction" ADD VALUE 'UPDATE_ROLE';
ALTER TYPE "ActivityAction" ADD VALUE 'REMOVE_MEMBER';
ALTER TYPE "ActivityAction" ADD VALUE 'ASSIGN_TASK';
ALTER TYPE "ActivityAction" ADD VALUE 'CHANGE_STATUS';
ALTER TYPE "ActivityAction" ADD VALUE 'ACCEPT_INVITATION';

-- AlterEnum
BEGIN;
CREATE TYPE "ActivityEntity_new" AS ENUM ('WORKSPACE', 'PROJECT', 'PROJECT_MEMBER', 'TASK', 'COMMENT', 'INVITATION');
ALTER TABLE "ActivityLog" ALTER COLUMN "entity" TYPE "ActivityEntity_new" USING ("entity"::text::"ActivityEntity_new");
ALTER TYPE "ActivityEntity" RENAME TO "ActivityEntity_old";
ALTER TYPE "ActivityEntity_new" RENAME TO "ActivityEntity";
DROP TYPE "public"."ActivityEntity_old";
COMMIT;
