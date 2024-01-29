import { io, sockets } from "..";
import { client } from "./client";
import qrcode from "qrcode";
import { messages } from "../messages/messages";
import { messageService } from "../services/message.service";
import { customerService } from "../services/customer.service";
import { prisma } from "../prisma";
import { decrypt } from "../encrypt";
import { userService } from "../services/user.service";

export enum MessageEnum {
  FIRST_CONTACT = "First Contact",
  CHOOSING_DEPARTMENT = "Choosing Department",
  SESSION_ACTIVE = "Session Active",
}

export type CustomerType = {
  id: number;
  name: string;
  number: string;
  userActive: number | null;
  messageType: MessageEnum;
  last_messages: {
    idUser: number;
    idCustomer: number;
    idMessage: number | null;
  }[];
};

export const customers: CustomerType[] = [];

customerService.getCustomers().then((customersList) => {
  customersList?.data?.map((customer) => {
    if (customer.userActive) {
      customers.push({ ...customer, messageType: MessageEnum.SESSION_ACTIVE });
      return;
    }

    customers.push({ ...customer, messageType: MessageEnum.FIRST_CONTACT });
  });
});

export let qrString: string | undefined;

client.on("qr", (qr) => {
  qrcode.toDataURL(qr, (err, src) => {
    console.log("Waiting for scan...");
    qrString = src;
    io.emit("qr", src);
  });
});

client.on("authenticated", () => {
  qrString = undefined;
  io.emit("scanned")
  console.log("Client authenticated successfully");
});

client.on("message", async (message) => {
  if (
    message.from !== "553537132922@c.us" &&
    message.from !== "553588121669@c.us"
  )
    return;

  const findCustomerIndex = customers.findIndex(
    (customer) => customer.number === message.from
  );

  if (findCustomerIndex === -1) {
    const customer = await messages.firstContact(message);

    const newCustomer = await prisma.customer.create({
      data: {
        name: "",
        number: message.from,
      },
    });

    if (!customer || !customer.data) return;

    customers.push({
      ...newCustomer,
      messageType: MessageEnum.CHOOSING_DEPARTMENT,
      last_messages: [],
    });
    return;
  }

  if (customers[findCustomerIndex].messageType === MessageEnum.FIRST_CONTACT) {
    await messages.firstContact(message);

    if (customers[findCustomerIndex]) {
      customers[findCustomerIndex].messageType =
        MessageEnum.CHOOSING_DEPARTMENT;
    }
    return;
  }

  if (
    customers[findCustomerIndex].messageType === MessageEnum.CHOOSING_DEPARTMENT
  ) {
    const index = await messages.choosingDepartment(
      message,
      customers[findCustomerIndex]
    );

    if (!index || !index.data) return;

    customers[findCustomerIndex].userActive = index.data;
    customers[findCustomerIndex].messageType = MessageEnum.SESSION_ACTIVE;

    return;
  }

  if (customers[findCustomerIndex].messageType === MessageEnum.SESSION_ACTIVE) {
    await messages.activeSession(message, customers[findCustomerIndex]);
  }
});
