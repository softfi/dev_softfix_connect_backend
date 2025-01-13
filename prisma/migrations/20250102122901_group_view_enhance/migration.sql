/*
  Warnings:

  - Added the required column `groupId` to the `Group_Logs_Views` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `group_logs_views` ADD COLUMN `groupId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `schedule` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `Group_Logs_Views` ADD CONSTRAINT `Group_Logs_Views_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
