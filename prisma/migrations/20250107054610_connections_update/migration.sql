/*
  Warnings:

  - Made the column `connectionId` on table `personal_logs` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `personal_logs` DROP FOREIGN KEY `Personal_Logs_connectionId_fkey`;

-- AlterTable
ALTER TABLE `personal_logs` MODIFY `connectionId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `schedule` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `Personal_Logs` ADD CONSTRAINT `Personal_Logs_connectionId_fkey` FOREIGN KEY (`connectionId`) REFERENCES `Connections`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
