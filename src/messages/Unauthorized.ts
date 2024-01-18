import { Message } from "whatsapp-web.js";
import { Customer } from "../classes/Customer";
import { Department } from "../classes/Department";

export const Unauthorized = async (message: Message, customers: any[]) => {
  const checkIfExists = await Customer.checkIfExists(message.from);
  if (!checkIfExists) {
    await Customer.createNew(message.from);
  }
  const customer = await Customer.getByNumber(message.from);
  if (customer.user_iduser) {
    await Customer.leftSession(message.from);
    customer.user_iduser = null;
  }
  customers.push(customer);
  const getDepartments = await Department.getOnlyDepartments();
  let departments = ``;
  //@ts-ignore
  getDepartments.map((department) => {
    departments += `${department.iddepartment} - ${department.name}
`;
  });
  message.reply(
    `Olá, sou a Vulpe, atendente virtual da Vulpe Tech. Em qual setor deseja falar?
${departments}`
  );
};
