/*
  Warnings:

  - You are about to drop the column `maxUser` on the `group` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `group` DROP COLUMN `maxUser`,
    ADD COLUMN `iconId` INTEGER NULL;

-- AlterTable
ALTER TABLE `schedule` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `imageId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_imageId_fkey` FOREIGN KEY (`imageId`) REFERENCES `Uploads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Group` ADD CONSTRAINT `Group_iconId_fkey` FOREIGN KEY (`iconId`) REFERENCES `Uploads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
