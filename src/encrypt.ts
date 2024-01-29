import crypto from "crypto";
import { env } from "./lib/env";

export const encrypt = (content: string) => {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(env.CRYPTO_KEY),
    Buffer.from(env.VECTOR)
  );
  var crypted = cipher.update(content, "utf8", "hex");

  crypted += cipher.final("hex");
  return crypted;
};

export const decrypt = (content: string) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(env.CRYPTO_KEY),
    Buffer.from(env.VECTOR)
  );
  let dec = decipher.update(content, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
};
