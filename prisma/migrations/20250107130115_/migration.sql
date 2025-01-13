-- AlterTable
ALTER TABLE `group` ALTER COLUMN `description` DROP DEFAULT;

-- AlterTable
ALTER TABLE `group_logs` ALTER COLUMN `content` DROP DEFAULT;

-- AlterTable
ALTER TABLE `personal_logs` ALTER COLUMN `content` DROP DEFAULT;

-- AlterTable
ALTER TABLE `schedule` ALTER COLUMN `updatedAt` DROP DEFAULT;
