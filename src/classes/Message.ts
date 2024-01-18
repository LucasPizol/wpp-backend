import { Message } from "whatsapp-web.js";
import { db } from "../database/db";

export class MessageClass {
  static async recieveMessage(message: Message, iduser: number) {
    await db.query(
      `
        INSERT INTO message (message, created_at, number, user_iduser, recieved)
        VALUES (?, ?, ?, ?, ?)
      `,
      [message.body, new Date(), message.from, iduser, 1]
    );
  }

  static async getMessages(iduser: number) {
    const data = await db.query(
      `
        SELECT
        message,
        created_at as createdAt,
        customer.number as customerNumber,
        recieved,
        iduser,
        user.name as userName,
        customer.name as customerName
        FROM message
        INNER JOIN user
        ON user.iduser = message.user_iduser
        INNER JOIN customer
        ON customer.number = message.number
        WHERE iduser = ${iduser}
      `
    );
    return data[0];
  }

  static async sendMessage(number: string, body: string, user: any) {
    await db.query(
      `
        INSERT INTO message (message, created_at, number, user_iduser, recieved)
        VALUES (?, ?, ?, ?, ?)
      `,
      [body, new Date(), number, user.iduser, 0]
    );
  }
}
