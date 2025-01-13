/*
  Warnings:

  - You are about to drop the `peronal_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `peronal_logs` DROP FOREIGN KEY `Peronal_Logs_fileId_fkey`;

-- DropForeignKey
ALTER TABLE `peronal_logs` DROP FOREIGN KEY `Peronal_Logs_fromId_fkey`;

-- DropForeignKey
ALTER TABLE `peronal_logs` DROP FOREIGN KEY `Peronal_Logs_repliedToId_fkey`;

-- DropForeignKey
ALTER TABLE `peronal_logs` DROP FOREIGN KEY `Peronal_Logs_toId_fkey`;

-- AlterTable
ALTER TABLE `schedule` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- DropTable
DROP TABLE `peronal_logs`;

-- CreateTable
CREATE TABLE `Personal_Logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fromId` INTEGER NOT NULL,
    `toId` INTEGER NULL,
    `repliedToId` INTEGER NULL,
    `content` VARCHAR(191) NOT NULL DEFAULT '',
    `type` ENUM('MESSAGE', 'ACTION') NOT NULL,
    `msgType` ENUM('TEXT', 'FILE') NULL,
    `fileId` INTEGER NULL,
    `isEdited` BOOLEAN NOT NULL DEFAULT false,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `editedAt` DATETIME(3) NOT NULL,
    `seenAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Personal_Logs` ADD CONSTRAINT `Personal_Logs_fromId_fkey` FOREIGN KEY (`fromId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Personal_Logs` ADD CONSTRAINT `Personal_Logs_toId_fkey` FOREIGN KEY (`toId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Personal_Logs` ADD CONSTRAINT `Personal_Logs_repliedToId_fkey` FOREIGN KEY (`repliedToId`) REFERENCES `Personal_Logs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Personal_Logs` ADD CONSTRAINT `Personal_Logs_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `Uploads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
