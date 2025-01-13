-- DropForeignKey
ALTER TABLE `uploads` DROP FOREIGN KEY `Uploads_createdById_fkey`;

-- AlterTable
ALTER TABLE `uploads` MODIFY `createdById` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Uploads` ADD CONSTRAINT `Uploads_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
