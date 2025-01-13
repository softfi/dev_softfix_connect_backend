/*
  Warnings:

  - You are about to drop the column `isExpired` on the `special_schedule_permission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `special_schedule_permission` DROP COLUMN `isExpired`,
    ADD COLUMN `alwaysOpen` BOOLEAN NOT NULL DEFAULT false;
