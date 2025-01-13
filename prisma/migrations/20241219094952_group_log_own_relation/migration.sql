-- DropForeignKey
ALTER TABLE `group_logs` DROP FOREIGN KEY `Group_Logs_repliedToId_fkey`;

-- AddForeignKey
ALTER TABLE `Group_Logs` ADD CONSTRAINT `Group_Logs_repliedToId_fkey` FOREIGN KEY (`repliedToId`) REFERENCES `Group_Logs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
