-- AlterTable
ALTER TABLE `notification` ADD COLUMN `connectionSenderId` INTEGER NULL,
    ADD COLUMN `groupAdderId` INTEGER NULL,
    ADD COLUMN `repliedPersonId` INTEGER NULL;

-- AlterTable
ALTER TABLE `schedule` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_connectionSenderId_fkey` FOREIGN KEY (`connectionSenderId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_groupAdderId_fkey` FOREIGN KEY (`groupAdderId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_repliedPersonId_fkey` FOREIGN KEY (`repliedPersonId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
