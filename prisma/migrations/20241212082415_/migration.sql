-- AlterTable
ALTER TABLE `role` MODIFY `name` ENUM('SUPER_ADMIN', 'ADMIN', 'EMPLOYEE') NOT NULL;
