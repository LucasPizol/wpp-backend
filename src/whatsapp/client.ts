import { Client, LocalAuth, Message } from "whatsapp-web.js";

export const client = new Client({
  authStrategy: new LocalAuth(),
});


client.initialize().then(() => {
  console.log("Client Whatsapp Initialized");
});