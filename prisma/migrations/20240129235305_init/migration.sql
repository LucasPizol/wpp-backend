-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "idDepartment" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PalavraChave" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "idDepartment" INTEGER NOT NULL,

    CONSTRAINT "PalavraChave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "userActive" INTEGER,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idCustomer" INTEGER,
    "idUser" INTEGER,
    "recieved" BOOLEAN NOT NULL,
    "type" TEXT NOT NULL,
    "media" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LastMessage" (
    "id" SERIAL NOT NULL,
    "idMessage" INTEGER,
    "idUser" INTEGER NOT NULL,
    "idCustomer" INTEGER NOT NULL,

    CONSTRAINT "LastMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "idMessage" INTEGER NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PalavraChave_name_key" ON "PalavraChave"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_idMessage_key" ON "Notification"("idMessage");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_idDepartment_fkey" FOREIGN KEY ("idDepartment") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PalavraChave" ADD CONSTRAINT "PalavraChave_idDepartment_fkey" FOREIGN KEY ("idDepartment") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userActive_fkey" FOREIGN KEY ("userActive") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_idCustomer_fkey" FOREIGN KEY ("idCustomer") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LastMessage" ADD CONSTRAINT "LastMessage_idMessage_fkey" FOREIGN KEY ("idMessage") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LastMessage" ADD CONSTRAINT "LastMessage_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LastMessage" ADD CONSTRAINT "LastMessage_idCustomer_fkey" FOREIGN KEY ("idCustomer") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_idMessage_fkey" FOREIGN KEY ("idMessage") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
