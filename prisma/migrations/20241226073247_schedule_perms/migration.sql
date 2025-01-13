/*
  Warnings:

  - You are about to alter the column `expireTime` on the `special_schedule_permission` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `special_schedule_permission` MODIFY `expireTime` DATETIME(3) NULL;
