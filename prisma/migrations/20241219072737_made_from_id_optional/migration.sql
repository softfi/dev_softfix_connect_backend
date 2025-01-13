-- DropForeignKey
ALTER TABLE `group_logs` DROP FOREIGN KEY `Group_Logs_fromId_fkey`;

-- AlterTable
ALTER TABLE `group_logs` MODIFY `fromId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Group_Logs` ADD CONSTRAINT `Group_Logs_fromId_fkey` FOREIGN KEY (`fromId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
