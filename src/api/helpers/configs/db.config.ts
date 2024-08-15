import dotenv from "dotenv";
import { DataSource } from "typeorm";
import logging from "@/utils/logging";
import { User } from "@/db/user.entity";
import { GDBWalletEntity } from "@/db/wallets/gdbWallet.entity";
import { EuroWalletEntity } from "@/db/wallets/euroWallet.entity";
import { NairaWalletEntity } from "@/db/wallets/nairaWallet.entity";
import { DollarWalletEntity } from "@/db/wallets/dollarWallet.entity";
import { TransactionEntity } from "@/api/db/transactions/transactions.entity";

dotenv.config();

export const dataSource = new DataSource({
  type: "mariadb",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || undefined,
  username: process.env.DB_USER || undefined,
  password: process.env.DB_PWD || undefined,
  database: process.env.DB_NAME || undefined,
  entities: [
    User,
    NairaWalletEntity,
    TransactionEntity,
    DollarWalletEntity,
    GDBWalletEntity,
    EuroWalletEntity,
  ],
  synchronize: true, // set to false in prod
  logging: false,
});

export const db_init = async () => {
  try {
    await dataSource.initialize();
    logging.info("Database connection established successfully.");
  } catch (error: any) {
    logging.error("Database initialization error:", error);
    logging.error(`Failed to initialize Mariadb database`);
  }
};
