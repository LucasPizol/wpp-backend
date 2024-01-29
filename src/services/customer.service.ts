import { prisma } from "../prisma";

export const customerService = {
  create: async (name: string, number: string) => {
    try {
      const data = await prisma.customer.create({
        data: {
          name: name,
          number: number,
        },
      });

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getByNumber: async (number: string) => {
    try {
      const data = await prisma.customer.findFirst({
        where: {
          number,
        },
      });

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  joinSession: async (userActive: number, id: number) => {
    try {
      await prisma.customer.update({
        data: {
          userActive,
        },
        where: {
          id: id,
        },
      });
      return { data: "Success", error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getCustomers: async () => {
    try {
      const customers = await prisma.customer.findMany({
        include: {
          last_messages: true,
        },
      });

      return { data: customers, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};
