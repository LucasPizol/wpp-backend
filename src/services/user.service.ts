import { Request, Response } from "express";
import { prisma } from "../prisma";
import { jwtService } from "./jwt.service";

export const userService = {
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
        name: user.name,
        username: user.username,
      };

      const token = jwtService.signToken(payload);

      res.status(200).json({
        name: user.name,
        username: user.username,
        token,
      });
    } catch (error: any) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      }
    }
  },

  findByUsername: async (username: string) => {
    const user = await prisma.user.findFirst({
      where: {
        username,
      },
    });

    return user;
  },

  getUsers: async () => {
    try {
      const users = await prisma.user.findMany();
      return { data: users, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};
