/*
  Warnings:

  - You are about to drop the column `alwaysOpen` on the `special_schedule_permission` table. All the data in the column will be lost.
  - Made the column `expireTime` on table `special_schedule_permission` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `special_schedule_permission` DROP COLUMN `alwaysOpen`,
    MODIFY `expireTime` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `alwaysOpenSchedule` BOOLEAN NOT NULL DEFAULT false;
