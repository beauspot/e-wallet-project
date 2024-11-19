import { Request, Response, NextFunction } from "express";

import logging from "@/utils/logging";

export function logging_middleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  logging.info(
    `Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`
  );

  res.on("finish", () => {
    logging.info(
      `Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`
    );
  });

  next();
}
