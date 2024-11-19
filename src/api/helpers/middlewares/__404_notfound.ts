import { Request, Response, NextFunction } from "express";
import logging from "@/utils/logging";

const routeNotFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error("Not found");
  logging.warn(error);

  return res.status(404).json({
    error: {
      message: error.message,
    },
  });
};

export default routeNotFound;
