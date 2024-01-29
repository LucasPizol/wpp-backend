import { prisma } from "../prisma";

export const departmentService = {
  getDepartments: async () => {
    try {
      const data = await prisma.department.findMany();
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};
