import { Message } from "whatsapp-web.js";
import { Department } from "../classes/Department";
import { User } from "../classes/User";
import { Customer } from "../classes/Customer";
import { Socket } from "socket.io";

export const DepartmentMsg = async (message: Message, customers: any[], socketList: Socket[], index: number) => {
  const department = message.body;

  const departments = await Department.getDepartments();
  //@ts-ignore
  const keyword = departments.find(
    (keyword: any) =>
      keyword.palavra === department ||
      keyword.name.toLowerCase() === department.toLowerCase()
  );

  if (!keyword) {
    message.reply("Não entendi o setor, por favor digite novamente.");
    return;
  }

  const users = await User.getUsers();

  //@ts-ignore
  const findUser = users.find(
    (user: any) =>
      user.department_iddepartment === keyword.department_iddepartment
  );

  await Customer.joinSession(findUser.iduser, message.from);

  customers[index].user_iduser = findUser.iduser;

  message.reply(
    `Ótimo, estou lhe transferindo para este setor: ${keyword.name}`
  );

  const socket = socketList.find((sckt) => sckt.id === findUser.session);

  socket?.emit("send_wpp_message", {
    userId: findUser.iduser,
    number: message.from,
    body: message.body,
  });
}

