import { Request, Response } from "express";
import { prisma } from "../prisma";
import { jwtService } from "../services/jwt.service";
import { AuthRequest } from "../middleware/check_authorization";

export const userController = {
  login: async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
      const user = await prisma.user.findFirst({
        where: {
          username,
        },
      });

      if (!user) throw new Error("Usuário ou senha inválidos");

      if (user.password !== password)
        throw new Error("Usuário ou senha inválidos");

      const payload = {
        id: user.id,
        department: user.idDepartment,
        name: user.name,
        username: user.username,
      };

      const token = jwtService.signToken(payload);

      return res.status(200).json({
        name: user.name,
        username: user.username,
        id: user.id,
        idDepartment: user.idDepartment,
        token,
      });
    } catch (error: any) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      }
    }
  },

  get: async (req: AuthRequest, res: Response) => {
    const { id, idDepartment, username, name } = req.user!;

    return res.status(200).json({ id, idDepartment, username, name });
  },
};
