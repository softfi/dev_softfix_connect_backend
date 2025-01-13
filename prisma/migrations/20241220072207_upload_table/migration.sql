-- AlterTable
ALTER TABLE `group_logs` ADD COLUMN `fileId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Uploads` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `extension` VARCHAR(191) NOT NULL DEFAULT '',
    `path` VARCHAR(191) NOT NULL DEFAULT '',
    `url` VARCHAR(191) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Group_Logs` ADD CONSTRAINT `Group_Logs_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `Uploads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Uploads` ADD CONSTRAINT `Uploads_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
