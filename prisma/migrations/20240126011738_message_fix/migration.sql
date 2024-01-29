-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_idCustomer_fkey`;

-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_idUser_fkey`;

-- AlterTable
ALTER TABLE `message` MODIFY `idCustomer` INTEGER NULL,
    MODIFY `idUser` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_idCustomer_fkey` FOREIGN KEY (`idCustomer`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
