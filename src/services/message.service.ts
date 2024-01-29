import { Types } from "mongoose";
import { AuthRequest } from "../middleware/check_authorization";
import { prisma } from "../prisma";
import { encrypt } from "../encrypt";

export const messageService = {
  create: async (
    content: string,
    idCustomer: number,
    idUser: number,
    type: string,
    media?: string
  ) => {
    try {
      const newMessage = await prisma.message.create({
        data: {
          content: encrypt(content),
          recieved: true,
          idCustomer,
          type,
          media: media ? encrypt(media) : null,
          idUser,
        },
      });

      return { data: newMessage, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};
