import { Request, Response, NextFunction } from "express";
import AppError from "@/api/helpers/utils/appErrors";
import logging from "@/utils/logging";

const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logging.error(err);
  if (err instanceof AppError)
    return res.status(err.statusCode!).json({ msg: err.message });

  next();
};

export default errorHandlerMiddleware;
