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
      logging.log("API Initialized");
      logging.log("----------------------------------------");
      logging.log("Documentation with Swagger");
      logging.log("----------------------------------------");
      logging.log(`${applicationMessage} ${ip.address()}:${port}`);
      logging.log("----------------------------------------");
    });
  } catch (error) {
    logging.error("Database connection error: " + error);
  }
}

startServer();