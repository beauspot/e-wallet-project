import { AnyZodObject } from "zod";
import expressAsyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";

export const validateResource = (schema: AnyZodObject) =>
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    }
  );
