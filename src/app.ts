import "reflect-metadata";

import cors from "cors";
import path from "path";
import YAML from "yamljs";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import helmet, { HelmetOptions } from "helmet";
import statusCode from "http-status-codes";
import express, { Express, Response } from "express";

import "@/utils/logging";

import __404_err_page from "@/middlewares/__404_notfound";
import errorHandlerMiddleware from "@/middlewares/errHandler";
import { logging_middleware } from "@/middlewares/loggingmiddleware";

/// <reference path="./api/types/express/custom.d.ts" />

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});

export class CreateAppServer {
  private readonly app: Express;
  private readonly helmetConfig: HelmetOptions = {
    frameguard: { action: "deny" },
    xssFilter: true,
    referrerPolicy: { policy: "same-origin" },
    hsts: { maxAge: 15552000, includeSubDomains: true, preload: true },
  };
  constructor(private readonly port: string | number) {
    this.app = express();
    this.middleware();
    this.routes();
  }

  // loading swagger documentation from the pasth
  // private swaggerDoc = YAML.load(path.join(__dirname, "./../swagger.yaml"));

  public listen(port: number): void {
    this.app.listen(port, () => {
      logging.log("----------------------------------------");
      logging.log("Initialized API");
      logging.log("----------------------------------------");
    });
  }

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

    //TODO: Setting up redis

    /* const RedisStore = new connectRedis({
      client: runRedisOperation,
       prefix: "sessionStore",
    });*/

    // TODO: setting up middleware for session authentication
/*     
    this.app.use(
      session({
        // store: RedisStore,
        secret: process.env.SESSION_SECRET || "",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, httpOnly: true, maxAge: 20 * 60 * 1000 },
      })
    ); */
  
    this.app.use(limiter);

    if (process.env.NODE_ENV === "development") {
      this.app.use(logging_middleware);
    };

    // logging.log(`Current Environment : ${this.app.get('env')}`);
    // logging.log(`All current Env: ${JSON.stringify(process.env, null, 2)}`);

    // Serve the Swagger UI.
  /*   
    this.app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(this.swaggerDoc)
    ); */
   
  }

  // Routing for the application
  private routes() {
    logging.log("----------------------------------------");
    logging.log("Define Controller Routing");
    logging.log("----------------------------------------");
    this.app.get("/", (_, res: Response) => {
      res.send(
        '<h1>API Documentation</h1><a href="/api-docs">Documentation</a>'
      );
     
      res.json({ message: `e-wallet-api`, status: statusCode.OK });
    });

    // Routing goes here for the application

    this.app.all("*", __404_err_page);

    this.app.use(errorHandlerMiddleware);
  }
}
