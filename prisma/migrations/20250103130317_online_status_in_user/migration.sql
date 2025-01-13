-- AlterTable
ALTER TABLE `connections` MODIFY `status` ENUM('PENDING', 'ACTIVE', 'BLOCKED', 'REJECTED') NOT NULL;

-- AlterTable
ALTER TABLE `schedule` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `isOnline` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lastOnline` DATETIME(3) NULL;
