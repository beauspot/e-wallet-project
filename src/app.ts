import "reflect-metadata";
import cors from "cors";
import path from "path";
import YAML from "yamljs";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import helmet, { HelmetOptions } from "helmet";
import express, { Express, Response } from "express";

import logging from "@/utils/logging";

import __404_err_page from "@/middlewares/__404_notfound";
import errorHandlerMiddleware from "@/middlewares/errHandler";
import { logging_middleware } from "@/middlewares/loggingmiddleware";
import authRouter from "@/routes/users.routes";

/// <reference path="./api/types/express/custom.d.ts" />

// Configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const helmetConfig: HelmetOptions = {
  frameguard: { action: "deny" },
  xssFilter: true,
  referrerPolicy: { policy: "same-origin" },
  hsts: { maxAge: 15552000, includeSubDomains: true, preload: true },
};

function initializeMiddleware(app: Express): void {
  logging.log("Configuring middleware...");

  app.set("trust proxy", 10);
  app.use(cors({ origin: "*", credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(helmet(helmetConfig));
  app.use(helmet.hidePoweredBy());
  app.use(helmet.noSniff());
  app.use(helmet.ieNoOpen());
  app.use(helmet.dnsPrefetchControl());
  app.use(helmet.permittedCrossDomainPolicies());
  app.use(cookieParser());
  app.use(limiter);

  if (process.env.NODE_ENV === "development") {
    app.use(logging_middleware);
  }
}

function initializeRoutes(app: Express): void {
  logging.log("Setting up routes...");

  app.get("/", (_, res: Response) => {
    res.send(
      '<h1>E-Wallet API Documentation</h1><a href="/api-docs">Documentation</a>'
    );
  });

  app.use("/auth", authRouter);
  app.all("*", __404_err_page);
  app.use(errorHandlerMiddleware);
}

export function createApp(): Express {
  const app = express();

  initializeMiddleware(app);
  initializeRoutes(app);

  return app;
}
