import "reflect-metadata";
import ip from "ip";
import cors from "cors";
import path from "path";
import YAML from "yamljs";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import helmet, { HelmetOptions } from "helmet";
import statusCode from "http-status-codes";
import express, { Application, Response } from "express";

import "@/utils/logging";
import { SERVER_PORT } from "@/configs/app.config";
import { db_init } from "@/configs/db.config";
import __404_err_page from "@/middlewares/__404_notfound";
import errorHandlerMiddleware from "@/middlewares/errHandler";
import { logging_middleware } from "@/middlewares/loggingmiddleware";

dotenv.config();

export class App {
  private readonly app: Application;
  private readonly APPLICATION_RUNNING = "Application is running on: ";
  private readonly helmetConfig: HelmetOptions = {
    frameguard: { action: "deny" },
    xssFilter: true,
    referrerPolicy: { policy: "same-origin" },
    hsts: { maxAge: 15552000, includeSubDomains: true, preload: true },
  };
  constructor(private readonly port: string | number = SERVER_PORT) {
    this.app = express();
    this.middleware();
    this.routes();
  }

  private limiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 mins
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    // store: // for redis
  });

  async listen(): Promise<void> {
    try {
      await db_init();
      logging.log("----------------------------------------");
      logging.log("Initializing API");
      this.app.listen(this.port);
      logging.log("----------------------------------------");
      logging.log(`Documentation with swagger`);
      logging.log("----------------------------------------");
      logging.log(`${this.APPLICATION_RUNNING} ${ip.address()}:${this.port}`);
      logging.log("----------------------------------------");
    } catch (error) {
      logging.error("Database connection error: " + error);
    }
  }

  // loading swagger documentation from the pasth
  //   private swaggerDoc = YAML.load(path.join(__dirname, "./../swagger.yaml"));

  private middleware(): void {
    logging.log("----------------------------------------");
    logging.log("Logging & Configuration");
    logging.log("----------------------------------------");
    this.app.set("trust proxy", 10);
    this.app.use(cors({ origin: "*", credentials: true }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(helmet({ contentSecurityPolicy: false })); // Disable the default CSP middleware
    this.app.use(helmet(this.helmetConfig));
    this.app.use(helmet.hidePoweredBy());
    this.app.use(helmet.noSniff());
    this.app.use(helmet.ieNoOpen());
    this.app.use(helmet.dnsPrefetchControl());
    this.app.use(helmet.permittedCrossDomainPolicies());
    this.app.use(cookieParser());
    //Setting up redis

    /* const RedisStore = new connectRedis({
      client: runRedisOperation,
       prefix: "sessionStore",
    });*/

    /*
    this.app.use(
      session({
        // store: RedisStore,
        secret: process.env.SESSION_SECRET || "",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, httpOnly: true, maxAge: 20 * 60 * 1000 },
      })
    );
    */
    this.app.use(this.limiter);
    this.app.use(logging_middleware);

    // Serve the Swagger UI
    /*
    this.app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(this.swaggerDoc)
    );
    */
  }

  // Routing for the application
  private routes() {
    logging.log("----------------------------------------");
    logging.log("Define Controller Routing");
    logging.log("----------------------------------------");
    this.app.get("/", (_, res: Response) => {
      /*res.send(
        '<h1>Swanky-EXCHANGE API Documentation</h1><a href="/api-docs">Documentation</a>'
      );
      */
      res.json({ message: `PayMetro API Index route`, status: statusCode.OK });
    });

    // Routing goes here for the application

    this.app.all("*", __404_err_page);

    this.app.use(errorHandlerMiddleware);
  }
}
