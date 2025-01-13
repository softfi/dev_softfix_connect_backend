-- AlterTable
ALTER TABLE `group_member` ADD COLUMN `unseen` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `schedule` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- CreateTable
CREATE TABLE `Group_Logs_Views` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `logId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `viewAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Group_Logs_Views` ADD CONSTRAINT `Group_Logs_Views_logId_fkey` FOREIGN KEY (`logId`) REFERENCES `Group_Logs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Group_Logs_Views` ADD CONSTRAINT `Group_Logs_Views_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
