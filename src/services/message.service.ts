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
          idUser,
          type,
          media: media ? encrypt(media) : null,
        },
      });

      return { data: newMessage, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};
