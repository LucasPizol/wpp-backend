import { db } from "../database/db";

export class Department {
  static async getDepartments() {
    const departments = await db.query(
      "SELECT * FROM palavras_chave INNER JOIN department ON department.iddepartment = palavras_chave.department_iddepartment"
    );

    return departments[0];
  }

  static async getOnlyDepartments() {
    const departments = await db.query(
      "SELECT * FROM department"
    );

    return departments[0];
  }

}
