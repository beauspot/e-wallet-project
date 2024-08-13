import { Request, Response, NextFunction } from "express";
import CustomAPIError from "@/utils/custom_errors";
import logging from "@/utils/logging";

const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logging.error(err);
  if (err instanceof CustomAPIError)
    return res.status(err.statusCode).json({ msg: err.message });

  next();
};

export default errorHandlerMiddleware;
