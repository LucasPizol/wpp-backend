import jwt from "jsonwebtoken";
import { env } from "../lib/env";

const secret = String(env.JWT_SECRET);

export const jwtService = {
  verifyToken: (token: string, callbackfn: jwt.VerifyCallback) => {
    jwt.verify(token, secret, callbackfn);
  },

  signToken: (payload: string | object | Buffer) => {
    return jwt.sign(payload, secret, {
      expiresIn: "7d",
    });
  },
};
