import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import type z from "zod";
import { AppError } from "../../errors/appError.ts";

// После проверки кладём в req.body данные из схемы (с trim и прочими преобразованиями)
export const validate = <S extends ZodType>(
  schema: S,
): RequestHandler<Record<string, string>, unknown, z.infer<S>> => (req, _, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(
      'VALIDATION_ERROR',
      result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message
      })))
  }

  req.body = result.data;
  next();
};
