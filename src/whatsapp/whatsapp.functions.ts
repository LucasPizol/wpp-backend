import { io } from "..";
import { client } from "./client";
import qrcode from "qrcode";
import { messages } from "../messages/messages";
import { customerService } from "../services/customer.service";
import { prisma } from "../prisma";
import { Customer } from "../classes/Customer";

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

export const customers: Customer[] = [];

customerService.getCustomers().then((customersList) => {
  customersList?.data?.map((customer: any) => {
    const newCustomer = new Customer(
      customer.id,
      customer.name,
      customer.number,
      customer.last_messages,
      MessageEnum.SESSION_ACTIVE,
      customer.userActive
    );

    if (customer.userActive) {
      customers.push(newCustomer);
      return;
    }

    newCustomer.setMessageType(MessageEnum.FIRST_CONTACT);
    customers.push(newCustomer);
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
  io.emit("scanned");
  console.log("Client authenticated successfully");
});

client.on("message", async (message) => {
  if (
    message.from !== "553537132922@c.us" &&
    message.from !== "553588121669@c.us"
  )
    return;

  const findCustomer = customers.find(
    (customer) => customer.getNumber() === message.from
  );

  if (!findCustomer) {
    const customer = await messages.firstContact(message);

    const newCustomer = await prisma.customer.create({
      data: {
        name: "",
        number: message.from,
      },
    });

    if (!customer || !customer.data) return;

    const customerObject = new Customer(
      newCustomer.id,
      newCustomer.name,
      newCustomer.number,
      [],
      MessageEnum.CHOOSING_DEPARTMENT,
      newCustomer.userActive
    );

    customers.push(customerObject);
    return;
  }

  if (findCustomer.getMessageType() === MessageEnum.FIRST_CONTACT) {
    await messages.firstContact(message);

    if (findCustomer) {
      findCustomer.setMessageType(MessageEnum.CHOOSING_DEPARTMENT);
    }
    return;
  }

  if (findCustomer.getMessageType() === MessageEnum.CHOOSING_DEPARTMENT) {
    const index = await messages.choosingDepartment(message, findCustomer);

    if (!index || !index.data) return;

    findCustomer.setUserActive(index.data);
    findCustomer.setMessageType(MessageEnum.SESSION_ACTIVE);

    return;
  }

  if (findCustomer.getMessageType() === MessageEnum.SESSION_ACTIVE) {
    await messages.activeSession(message, findCustomer);
  }
});
