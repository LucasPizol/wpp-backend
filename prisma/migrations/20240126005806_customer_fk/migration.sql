-- AlterTable
ALTER TABLE `customer` ADD COLUMN `userActive` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_userActive_fkey` FOREIGN KEY (`userActive`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
