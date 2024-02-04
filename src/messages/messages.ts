import { Message } from "whatsapp-web.js";
import { prisma } from "../prisma";
import { CustomerType, MessageEnum, customers } from "../whatsapp/whatsapp.functions";
import { customerService } from "../services/customer.service";
import { sockets } from "..";
import { lastMessageService } from "../services/lastmessage.service";
import { messageService } from "../services/message.service";
import { decrypt } from "../encrypt";
import { Customer } from "../classes/Customer";

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
  .then((departments: any) => {
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

  choosingDepartment: async (message: Message, customer: Customer) => {
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

      const randomUserIndex = Math.floor(
        Math.random() * department.users.length
      );

      const user = department.users[randomUserIndex]

      await customerService.joinSession(user.id, customer.getId());

      const findLastMessage = customer
        .getLastMessages()
        .find(
          (message) =>
            message.idCustomer === customer.getId() &&
            message.idUser === user.id
        );

      const newMessage = await messageService.create(
        message.body,
        customer.getId(),
        user.id,
        "text"
      );

      if (!findLastMessage) {
        const lastMessage = await lastMessageService.create(
          user.id,
          customer.getId(),
          newMessage.data!.id
        );

        const findCustomer = customers.find(
          (cstmr) => cstmr.getId() === customer.getId()
        );

        findCustomer?.getLastMessages().push(lastMessage.data!);
      } else {
        await lastMessageService.set(
          user.id,
          customer.getId(),
          newMessage.data!.id
        );
      }

      message.reply(
        `Ótimo, estou lhe transferindo para o setor ${department.name}`
      );

      customer.setMessageType(MessageEnum.SESSION_ACTIVE)

      const socket = sockets.find((sckt) => sckt.idUser === user.id);

      if (!socket) return;
      socket.socket.emit(
        "recieved_message",
        {
          ...newMessage.data,
          content: decrypt(newMessage.data!.content),
        },
        customer.getCustomer()
      );

      return { data: user.id, error: null };

      //const user = await prisma.user.findFirst();
    } catch (error) {
      if (error instanceof Error) {
        return { data: null, error: error.message };
      }
    }
  },

  activeSession: async (message: Message, customer: Customer) => {
    if (!customer.getUserActive())
      return { data: null, error: "Sessão inativa" };

    const socket = sockets.find(
      (sckt) => sckt.idUser === customer.getUserActive()
    );

    try {
      if (message.hasMedia) {
        const downloadMedia = await message.downloadMedia();
        const type = downloadMedia.mimetype;
        const newMessage = await messageService.create(
          message.body,
          customer.getId(),
          customer.getUserActive()!,
          type,
          downloadMedia.data
        );

        await lastMessageService.set(
          customer.getUserActive()!,
          customer.getId(),
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
          customer.getCustomer()
        );

        return { data: newMessage, error: null };
      }

      const newMessage = await messageService.create(
        message.body,
        customer.getId(),
        customer.getUserActive()!,
        "text"
      );


      await lastMessageService.set(
        customer.getUserActive()!,
        customer.getId(),
        newMessage.data!.id
      );

      if (!socket) return { data: newMessage, error: null };

      socket.socket.emit(
        "recieved_message",
        {
          ...newMessage.data,
          content: decrypt(newMessage.data!.content),
        },
        customer.getCustomer()

      );

      return { data: newMessage, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};
