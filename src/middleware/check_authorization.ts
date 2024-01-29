import { NextFunction, Request, Response } from "express";
import { jwtService } from "../services/jwt.service";
import { JwtPayload } from "jsonwebtoken";
import { userService } from "../services/user.service";

type User = {
  id: number;
  name: string;
  idDepartment: number;
  username: string;
  password: string;
};

export interface AuthRequest extends Request {
  user?: User;
}

export const checkAuthorization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const headers = req.headers.authorization;

  try {
    if (!headers) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const token = headers.split("Bearer ")[1];

    jwtService.verifyToken(token, async (err, decoded) => {
      if (err || !decoded)
        return res.status(401).json({ error: "Não autorizado" });

      const user = await userService.findByUsername(
        (decoded as JwtPayload).username
      );
      if (!user) {
        return res.status(401).json({ error: "Usuário não encontrado" });
      }

      req.user = user;

      next();
    });
  } catch (error) {
    if (error instanceof Error)
      return res.status(401).json({ error: error.message });
  }
};
