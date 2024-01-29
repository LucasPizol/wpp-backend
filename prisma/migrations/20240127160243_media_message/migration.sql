/*
  Warnings:

  - Added the required column `type` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `message` ADD COLUMN `media` VARCHAR(191) NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL;
