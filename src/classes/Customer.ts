import { db } from "../database/db";

export class Customer {
  static async checkIfExists(number: string) {
    const user = await db.query(
      `SELECT * FROM customer WHERE number = '${number}'`
    );
    //@ts-ignore
    return user[0].length !== 0;
  }

  static async createNew(number: string) {
    await db.query(
      `
        INSERT INTO customer (number, name)
        VALUES (?, ?)
      `,
      [number, ""]
    );
  }

  static async updateName(name: string, number: string) {
    await db.query(
      `
        UPDATE customer
        SET name='${name}'
        WHERE number='${number}';
      `
    );
  }

  static async getByNumber(number: string) {
    const user = await db.query(
      `SELECT * FROM customer WHERE number = '${number}'`
    );

    //@ts-ignore
    return user[0][0];
  }

  static async joinSession(iduser: number, number: string) {
    await db.query(
      `
        UPDATE customer
        SET user_iduser=${iduser}
        WHERE number='${number}';
      `
    );
  }

  static async leftSession(number: string) {
    await db.query(
      `
        UPDATE customer
        SET user_iduser=null
        WHERE number='${number}';
      `
    );
  }

  static async getByNumberWithUser(number: string)  {
    const customer = await db.query(`SELECT * FROM customer INNER JOIN user ON customer.user_iduser = user.iduser WHERE number='${number}'`)

    //@ts-ignore
    return customer[0][0]
  }
}
