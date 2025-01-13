-- AlterTable
ALTER TABLE `group_logs` MODIFY `content` TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `personal_logs` MODIFY `content` TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `schedule` ALTER COLUMN `updatedAt` DROP DEFAULT;
