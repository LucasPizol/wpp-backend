import { prisma } from "../prisma";
import { Response } from "express";
import { AuthRequest } from "../middleware/check_authorization";
import { decrypt } from "../encrypt";
import { MessageEnum, customers } from "../whatsapp/whatsapp.functions";

export const customerController = {
  getCustomers: async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    try {
      const data = await prisma.customer.findMany({
        include: {
          last_messages: {
            where: {
              idUser: user.id,
            },
            include: {
              message: true,
            },
          },
        },
      });

      if (data.length === 0) {
        throw new Error("Nenhum cliente encontrado");
      }

      const customersList = data.map((customer) => {
        const message = customer.last_messages[0]?.message;
        return {
          id: customer.id,
          name: customer.name,
          number: customer.number,
          userActive: customer.userActive,
          lastMessage: !message
            ? {}
            : {
                ...message,
                content: decrypt(message?.content),
              },
        };
      });

      return res.status(200).json({ data: customersList });
    } catch (error: any) {
      if (error instanceof Error) {
        return res.status(404).json({ error: error.message });
      }
    }
  },

  updateName: async (req: AuthRequest, res: Response) => {
    const { name } = req.body;
    const { id } = req.params;
    try {
      await prisma.customer.update({
        data: {
          name,
        },
        where: {
          id: Number(id),
        },
      });

      const customerIndex = customers.findIndex(
        (customer) => customer.id === Number(id)
      );
      customers[customerIndex].name = name;
      return res.status(204).send();
    } catch (error: any) {
      return res
        .status(400)
        .json({ error: "Ocorreu um erro ao atualizar o nome" });
    }
  },

  leftSession: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
      await prisma.customer.update({
        data: {
          userActive: null,
        },
        where: {
          id: Number(id),
        },
      });

      const findIndex = customers.findIndex(
        (customer) => customer.id === Number(id)
      );

      customers[findIndex].messageType = MessageEnum.FIRST_CONTACT;

      return res.status(204).send();
    } catch (error: any) {
      return res
        .status(400)
        .json({ error: "Ocorreu um erro ao sair da sessão" });
    }
  },
};
