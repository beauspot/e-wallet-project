/**
 * This file is strictly for setting up environmental configurations
 */

import dotenv from "dotenv";

dotenv.config();

export const DEVELOPMENT = process.env.SERVER_PORT === "development";
export const TEST = process.env.NODE_ENV === "test";

export const SERVER_PORT = process.env.SERVER_PORT
  ? Number(process.env.SERVER_PORT)
  : 12345;
