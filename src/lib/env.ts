import { z } from "zod";
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string(),
  CRYPTO_KEY: z.string(),
  VECTOR: z.string(),
});

export const env = envSchema.parse(process.env);
