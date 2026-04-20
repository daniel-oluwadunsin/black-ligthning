import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod/v3";

export const validateSchema = <T>(schema: ZodSchema<T>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req);

      next();
    } catch (error: any) {
      const firstMessage =
        error?.errors?.[0]?.message ||
        error?.issues?.[0]?.message ||
        "Invalid request data";

      res.status(400).json({
        statusCode: 400,
        message: firstMessage,
        name: error?.name || "ValidationError",
      });
    }
  };
};
