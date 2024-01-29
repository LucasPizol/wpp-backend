import { Message } from "whatsapp-web.js";
import { prisma } from "../prisma";
import {
  CustomerType,
  customers,
} from "../whatsapp/whatsapp.functions";
import { customerService } from "../services/customer.service";
import { sockets } from "..";
import { lastMessageService } from "../services/lastmessage.service";
import { messageService } from "../services/message.service";
import { decrypt } from "../encrypt";

type DepartmentType = {
  id: number;
  name: string;
  palavraChave: {
    name: string;
    idDepartment: number;
  }[];
  users: {
    id: number;
    name: string;
    username: string;
    password: string;
    idDepartment: number;
  }[];
};

const departmentsList: DepartmentType[] = [];

prisma.department
  .findMany({
    include: {
      palavraChave: true,
      users: true,
    },
  })
  .then((departments) => {
    departmentsList.push(...departments);
  });

export const messages = {
  firstContact: async (message: Message) => {
    try {
      let departmentsString = "";

      departmentsList.map(
        (department) =>
          (departmentsString += department.id + " - " + department.name)
      );

      message.reply(`Olá, seja bem vindo à Taty Sex Shop. Por favor, escolha um departamento:
${departmentsString}`);

      return {
        data: "Success",
        error: null,
      };
    } catch (error) {
      if (error instanceof Error) {
        return { data: null, error: error.message };
      }
    }
  },

  choosingDepartment: async (message: Message, customer: CustomerType) => {
    try {
      const department = departmentsList.find(
        (department) =>
          department.id === Number(message.body) ||
          department.palavraChave.find(
            (palavraChave) =>
              palavraChave.name.toLowerCase() === message.body.toLowerCase()
          )
      );

      if (!department) {
        message.reply(
          "Não entendi o departamento solicitado. Digite novamente, por favor"
        );
        return;
      }

      const randomUserIndex = Math.ceil(
        Math.random() * department.users.length
      );

      await customerService.joinSession(randomUserIndex, customer.id);

      const findLastMessage = customer.last_messages.find(
        (message) =>
          message.idCustomer === customer.id &&
          message.idUser === randomUserIndex
      );

      const newMessage = await messageService.create(
        message.body,
        customer.id,
        randomUserIndex,
        "text"
      );

      if (!findLastMessage) {
        const lastMessage = await lastMessageService.create(
          randomUserIndex,
          customer.id,
          newMessage.data!.id
        );

        const customerIndex = customers.findIndex(
          (cstmr) => customer.id === customer.id
        );
        customers[customerIndex].last_messages.push(lastMessage.data!);
      } else {
        await lastMessageService.set(
          randomUserIndex,
          customer.id,
          newMessage.data!.id
        );
      }

      message.reply(
        `Ótimo, estou lhe transferindo para o setor ${department.name}`
      );

      const socket = sockets.find((sckt) => sckt.idUser === randomUserIndex);

      if (!socket) return;
      socket.socket.emit(
        "recieved_message",
        {
          ...newMessage.data,
          content: decrypt(newMessage.data!.content),
        },
        customer
      );

      return { data: randomUserIndex, error: null };

      //const user = await prisma.user.findFirst();
    } catch (error) {
      if (error instanceof Error) {
        return { data: null, error: error.message };
      }
    }
  },

  activeSession: async (message: Message, customer: CustomerType) => {
    if (!customer.userActive) return { data: null, error: "Sessão inativa" };

    const socket = sockets.find((sckt) => sckt.idUser === customer.userActive);

    try {
      if (message.hasMedia) {
        const downloadMedia = await message.downloadMedia();
        const type = downloadMedia.mimetype;
        const newMessage = await messageService.create(
          message.body,
          customer.id,
          customer.userActive,
          type,
          downloadMedia.data
        );

        await lastMessageService.set(
          customer.userActive,
          customer.id,
          newMessage.data!.id
        );

        if (!socket) return { data: newMessage, error: null };

        socket.socket.emit(
          "recieved_message",
          {
            ...newMessage.data,
            content: decrypt(newMessage.data!.content),
            media: decrypt(newMessage.data!.media!),
          },
          customer
        );

        return { data: newMessage, error: null };
      }

      const newMessage = await messageService.create(
        message.body,
        customer.id,
        customer.userActive,
        "text"
      );

      await lastMessageService.set(
        customer.userActive,
        customer.id,
        newMessage.data!.id
      );

      if (!socket) return { data: newMessage, error: null };

      socket.socket.emit(
        "recieved_message",
        {
          ...newMessage.data,
          content: decrypt(newMessage.data!.content),
        },
        customer
      );

      return { data: newMessage, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};
