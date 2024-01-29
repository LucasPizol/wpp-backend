import { prisma } from "../prisma";

export const lastMessageService = {
  create: async (idUser: number, idCustomer: number, idMessage: number) => {
    try {
      const data = await prisma.lastMessage.create({
        data: {
          idUser,
          idCustomer,
          idMessage,
        },
        include: {
          message: true,
        },
      });

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  set: async (idUser: number, idCustomer: number, idMessage: number) => {
    try {
      const data = await prisma.lastMessage.updateMany({
        data: {
          idMessage,
        },
        where: {
          idUser,
          idCustomer,
        },
      });

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getLastMessages: async () => {
    try {
      const data = await prisma.lastMessage.findMany();
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};
