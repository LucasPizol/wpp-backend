import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const secret = String(process.env.JWT_SECRET);

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
