import { Response } from "express";
import { AuthRequest } from "../middleware/check_authorization";
import { prisma } from "../prisma";
import { encrypt, decrypt } from "../encrypt";
import { client } from "../whatsapp/client";
import { customers } from "../whatsapp/whatsapp.functions";

export const messageController = {
  sendMessage: async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { content, idCustomer } = req.body;

    const encryptMessage = encrypt(content);

    try {
      const message = await prisma.message.create({
        data: {
          content: encryptMessage,
          idCustomer,
          recieved: false,
          idUser: user.id,
          type: "text",
        },
      });
      await prisma.lastMessage.updateMany({
        data: {
          idMessage: message.id,
        },
        where: {
          idCustomer,
          idUser: user.id,
        },
      });

      const number = customers.find((customer) => customer.id === idCustomer);

      if (!number) {
        throw new Error("Erro, número não encontrado");
      }

      client.sendMessage(
        number?.number,
        `*${user.name}*
${content}`
      );

      return res.status(200).json({ message });
    } catch (error) {
      if (error instanceof Error)
        return res.status(400).json({ error: error.message });
    }
  },

  getMessages: async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { idCustomer } = req.query;

    try {
      const messages = await prisma.message.findMany({
        where: {
          idUser: user.id,
          idCustomer: Number(idCustomer),
        },
      });

      const messagesDecrypted = messages.map((message) => {
        return {
          ...message,
          content: decrypt(message.content),
          media: message.media ? decrypt(message.media) : null,
        };
      });

      return res.status(200).json({ messages: messagesDecrypted });
    } catch (error) {
      if (error instanceof Error)
        return res.status(400).json({ error: error.message });
    }
  },
};
