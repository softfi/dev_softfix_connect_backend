-- AlterTable
ALTER TABLE `notification` MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `schedule` ALTER COLUMN `updatedAt` DROP DEFAULT;
