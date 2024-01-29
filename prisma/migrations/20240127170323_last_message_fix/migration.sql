-- DropForeignKey
ALTER TABLE `lastmessage` DROP FOREIGN KEY `LastMessage_idMessage_fkey`;

-- AlterTable
ALTER TABLE `lastmessage` MODIFY `idMessage` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `LastMessage` ADD CONSTRAINT `LastMessage_idMessage_fkey` FOREIGN KEY (`idMessage`) REFERENCES `Message`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
