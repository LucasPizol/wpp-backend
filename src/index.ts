import express from "express";
import { createServer } from "http";
import SocketIot, { Socket } from "socket.io";
import { Client, LocalAuth, Message, MessageMedia } from "whatsapp-web.js";
import { db } from "./database/db";
import { Customer } from "./classes/Customer";
import qrcode from "qrcode";
import { MessageClass } from "./classes/Message";
import { User } from "./classes/User";
import { jwtService } from "./services/jwtService";
import { JwtPayload } from "jsonwebtoken";
import { Department } from "./classes/Department";
import { Unauthorized } from "./messages/Unauthorized";
import { DepartmentMsg } from "./messages/DepartmentMsg";

const PORT = 3001;

let isActive = false;
let isLoading = false;
let clientActive = false;
let activeUsers = 0;

const app = express();
const server = createServer(app);
const io = new SocketIot.Server(server, { cors: { origin: "*" } });

const customers: any[] = [];

const client = new Client({
  authStrategy: new LocalAuth(),
});

const socketList: Socket[] = [];

io.on("connection", async (socket) => {
  activeUsers += 1;

  const getOnList = socketList.find((sckt) => sckt.id === socket.id);

  if (!getOnList) {
    socketList.push(socket);
  }

  socket.emit("get_token");

  socket.on("get_token", (token) => {
    jwtService.verifyToken(token, async (err, decoded) => {
      if (err || !decoded) return;
      await User.updateSession(socket.id, (decoded as JwtPayload).iduser);
    });
  });

  socket.on("recieve_message_wpp", async ({ body, number, userId }) => {
    await MessageClass.recieveMessage(
      { from: number, body: body } as Message,
      userId
    );

    const messages = await MessageClass.getMessages(userId);

    socket.emit("recieved_message", {
      recievedMessages: messages,
      iduser: userId,
    });

    return;
  });

  socket.on("send_message", async ({ body, number, token, isLeaving }) => {
    jwtService.verifyToken(token, async (err, decoded) => {
      if (err || !decoded) return;

      const user = await User.getUserByUsername(
        (decoded as JwtPayload).username
      );

      if (!number) return;
      try {
        await MessageClass.sendMessage(number, body, user);
        const messages = await MessageClass.getMessages(user.iduser);

        socket.emit("recieved_message", {
          recievedMessages: messages,
          iduser: user.iduser,
        });

        await client.sendMessage(
          number,
          `*${user.name}*
${body}`
        );

        if (isLeaving) {
          const findIndex = customers.findIndex(
            (customer) => customer.number === number
          );
          customers.splice(findIndex, 1);
          await Customer.leftSession(number);
        }
      } catch (error: any) {
        console.log(error.message);
      }
    });
  });

  socket.on("update_name", async ({ name, number, token }) => {
    jwtService.verifyToken(token, async (err, decoded) => {
      if (err || !decoded) return;

      const user = await User.getUserByUsername(
        (decoded as JwtPayload).username
      );
      try {
        await Customer.updateName(name, number);
        const messages = await MessageClass.getMessages(user.iduser);
        socket.emit("recieved_message", {
          recievedMessages: messages,
          iduser: user.iduser,
        });
      } catch (error: any) {
        console.log(error.message);
      }
    });
  });

  socket.on("login", async ({ user, password }) => {
    const getUser = await User.getUserByUsername(user);
    if (!getUser) {
      socket.emit("access", { error: "Usuário ou senha inválidos" });
      return;
    }

    if (getUser.password !== password) {
      socket.emit("access", { error: "Usuário ou senha inválidos" });
      return;
    }
    const token = jwtService.signToken(getUser);

    socket.emit("access", { data: getUser, token });
  });

  socket.on("get_user", async ({ token }) => {
    jwtService.verifyToken(token, async (err, decoded) => {
      if (err || !decoded) return;
      const getUser = await User.getUserByUsername(
        (decoded as JwtPayload).username
      );
      socket.emit("access", { data: getUser, token });
    });
  });

  socket.on("get_messages", async ({ token }) => {
    jwtService.verifyToken(token, async (err, decoded) => {
      if (err || !decoded) return;
      const messages = await MessageClass.getMessages(
        (decoded as JwtPayload).iduser
      );

      await User.updateSession(socket.id, (decoded as JwtPayload).iduser);

      socket.emit("recieved_message", {
        recievedMessages: messages,
        iduser: (decoded as JwtPayload).iduser,
      });
    });
  });

  socket.on("disconnect", () => {
    console.log("Disconnect: " + String(activeUsers));
    const socketIndex = socketList.findIndex((sckt) => sckt.id == socket.id);

    if (socketIndex !== -1) {
      socketList.splice(socketIndex, 1);
    }

    console.log("User disconnected: " + socket.id);
  });

  if (isLoading && isActive) {
    socket.emit(
      "qr",
      "https://imagepng.org/wp-content/uploads/2019/12/check-icone-1-scaled.png"
    );
  }
  if (isActive) return;

  client.on("qr", (qr) => {
    console.log("Aguardando conexão com QRCODE");

    qrcode.toDataURL(qr, (err, src) => {
      socket.emit("qr", src);
    });
  });
});

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

if (!isActive) {
  client.on("authenticated", () => {
    console.log("Autenticado");
  });
  client.initialize().then(() => {
    console.log("Conexão estabelecida");
  });
}

// client.on("message", async (message) => {
//   if (message.from !== "553537132922@c.us") return;

//   message.reply(
//     "Olá, nenhum de nossos atendentes está online, tente novamente mais tarde."
//   );
// });

const sendRegisteredMessage = async (message: Message, socket: Socket) => {
  if (
    message.from === "status@broadcast" ||
    message.isStatus ||
    message.from.includes("@g.us")
  ) {
    return;
  }

  if (message.hasMedia) {
    const media = await message.downloadMedia();

    message.body = media.data;
  }

  try {
    const customerExists = await Customer.checkIfExists(message.from);

    if (!customerExists) {
      await Customer.createNew(message.from);
    }

    const customer = await Customer.getByNumber(message.from);

    if (!customer.user_iduser) {
      return;
    }

    socket.emit("send_wpp_message", {
      userId: customer.user_iduser,
      number: message.from,
      body: message.body,
    });
  } catch (error: any) {
    console.log(error.message);
  }
};

client.on("message", async (message) => {
  if (message.from !== "553537132922@c.us") return;
  const customer = await Customer.getByNumberWithUser(message.from);

  const findCustomer = customers.findIndex(
    (user) => user.number === message.from
  );

  if (customers[findCustomer]?.user_iduser) {
    const socket = socketList.find((sckt) => sckt.id === customer?.session);

    if (!socket) return;
    if (customer.session !== socket.id) return;
    sendRegisteredMessage(message, socket);
    return;
  }

  if (findCustomer === -1) {
    await Unauthorized(message, customers);
    return;
  }

  if (!customers[findCustomer].user_iduser) {
    await DepartmentMsg(message, customers, socketList, findCustomer);
    return;
  }
});
