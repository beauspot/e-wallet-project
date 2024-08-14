import dotenv from "dotenv";
import { DataSource } from "typeorm";
import logging from "@/utils/logging";
import { User } from "@/db/user.entity";
import { AccountBalance } from "@/db/userWallet.entity";

dotenv.config();

export const TypeormConfig = new DataSource({
  type: "mariadb",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || undefined,
  username: process.env.DB_USER || undefined,
  password: process.env.DB_PWD || undefined,
  database: process.env.DB_NAME || undefined,
  entities: [User, AccountBalance],
  synchronize: true, // set to false in prod
  logging: false,
});

export const db_init = async () => {
  try {
    await TypeormConfig.initialize();
    logging.info("Database connection established successfully.");
  } catch (error: any) {
    logging.error("Database initialization error:", error);
    logging.error(`Failed to initialize Mysql database`);
  }
};
