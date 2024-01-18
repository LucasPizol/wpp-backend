import { db } from "../database/db";

export class User {
  static async getUserByUsername(user: string) {
    const getUser = await db.query(
      `SELECT * FROM user WHERE username = '${user}'`
    );

    //@ts-ignore
    return getUser[0][0];
  }

  static async updateSession(session: string, id: number) {
    await db.query(
      `UPDATE user
      SET session = '${session}'
      WHERE iduser = '${id}'`
    );
  }

  static async getUsers() {
    const users = await db.query("SELECT * FROM user");
    return users[0];
  }

  static async getUserFromSocket(socketId: string) {
    
    const user = await db.query(
      `SELECT * FROM user WHERE session = '${socketId}'`
    );

    //@ts-ignore
    return user[0][0];
  }
}
