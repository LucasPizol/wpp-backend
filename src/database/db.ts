import mongoose from "mongoose";
import { env } from "../lib/env";
import mysql from "mysql2";

export let db = mysql.createPool(env.DATABASE_URL);

export default mongoose;
