/*
  Warnings:

  - A unique constraint covering the columns `[projectId,userId]` on the table `ProjectMember` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workspaceId,userId]` on the table `WorkspaceMember` will be added. If there are existing duplicate values, this will fail.
  - Made the column `assignedTo` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ADMIN';

-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'BLOCKED';

-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_taskId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_uploadedBy_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_assignedTo_fkey";

-- DropForeignKey
ALTER TABLE "TaskComment" DROP CONSTRAINT "TaskComment_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TaskComment" DROP CONSTRAINT "TaskComment_userId_fkey";

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "assignedTo" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMember_workspaceId_userId_key" ON "WorkspaceMember"("workspaceId", "userId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
