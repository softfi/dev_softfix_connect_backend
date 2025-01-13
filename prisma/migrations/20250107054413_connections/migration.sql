-- AlterTable
ALTER TABLE `personal_logs` ADD COLUMN `connectionId` INTEGER NULL;

-- AlterTable
ALTER TABLE `schedule` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `Personal_Logs` ADD CONSTRAINT `Personal_Logs_connectionId_fkey` FOREIGN KEY (`connectionId`) REFERENCES `Connections`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
