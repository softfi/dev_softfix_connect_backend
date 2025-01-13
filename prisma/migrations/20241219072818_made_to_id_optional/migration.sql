/*
  Warnings:

  - Made the column `fromId` on table `group_logs` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `group_logs` DROP FOREIGN KEY `Group_Logs_fromId_fkey`;

-- DropForeignKey
ALTER TABLE `group_logs` DROP FOREIGN KEY `Group_Logs_toId_fkey`;

-- AlterTable
ALTER TABLE `group_logs` MODIFY `fromId` INTEGER NOT NULL,
    MODIFY `toId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Group_Logs` ADD CONSTRAINT `Group_Logs_fromId_fkey` FOREIGN KEY (`fromId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Group_Logs` ADD CONSTRAINT `Group_Logs_toId_fkey` FOREIGN KEY (`toId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
