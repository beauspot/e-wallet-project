import dotenv from "dotenv";
import ip from "ip";

import "@/utils/logging";
import { CreateAppServer } from "@/app";
import { db_init } from "@/configs/db.config";

dotenv.config();

const Port: number = Number(process.env.SERVER_PORT) || 3000;
const appServer = new CreateAppServer(Port);
const applicationMessage = "Application is running on:";

class CreateServer {
  constructor(private server: CreateAppServer,
    private port: typeof Port,
    private applicationMessage: string) { }
  
  async serverInit():Promise<void> {
    try {
      await db_init();
      this.server.listen(this.port);

      logging.log("----------------------------------------");
      logging.log(`Documentation with swagger`);
      logging.log("----------------------------------------");
      logging.log(`${this.applicationMessage} ${ip.address()}:${this.port}`);
      logging.log("----------------------------------------");
    } catch (error) {
      logging.error("Database connection error: " + error);
    }
  }
};

const server = new CreateServer(appServer, Port, applicationMessage);
server.serverInit();