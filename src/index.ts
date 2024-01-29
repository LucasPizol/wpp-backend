import "./database/db";
import cors from "cors";
import express from "express";
import SocketIo, { Socket } from "socket.io";
import { routes } from "./routes";
import "./whatsapp/whatsapp.functions";
import { qrString } from "./whatsapp/whatsapp.functions";

const PORT = 3001;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(routes);

const server = app.listen(PORT, () => {
  console.log("Server running at port: " + PORT);
});

export const io = new SocketIo.Server(server, { cors: { origin: "*" } });

type ArraySocket = {
  idUser: number;
  socket: Socket;
};

export const sockets: ArraySocket[] = [];

io.on("connection", (socket) => {
  socket.on("save_socket", (idUser: number) => {
    io.emit("qr", qrString);
    sockets.push({
      idUser,
      socket,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
    const index = sockets.findIndex((sckt) => sckt.socket.id === socket.id);
    sockets.splice(index, 1);
  });
});
