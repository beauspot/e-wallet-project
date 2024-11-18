import dotenv from "dotenv";
import ip from "ip";

import logging from "@/utils/logging";
import { createApp } from "@/app";
import { db_init } from "@/configs/db.config";

dotenv.config();

const port = Number(process.env.SERVER_PORT) || 3000;
const applicationMessage = "Application is running on:";

async function startServer(): Promise<void> {
  try {
    await db_init();
    const app = createApp();

    app.listen(port, () => {
      logging.info("----------------------------------------");
      logging.info("API Initialized");
      logging.info("Documentation with Swagger");
      logging.info("----------------------------------------");
      logging.info(`${applicationMessage} ${ip.address()}:${port}`);
      logging.info("----------------------------------------");
    });
  } catch (error) {
    logging.error("Database connection error: " + error);
  }
}

startServer();