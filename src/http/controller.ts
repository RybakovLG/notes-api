import type { NextFunction } from "express";
import type { Schemas, ValidatedRequest } from "./request.ts";
import type { SafeResponse } from "./response.ts";

export type Controller<S extends Schemas = {}> = (
    req: ValidatedRequest<S>,
    res: SafeResponse,
    next: NextFunction,
) => void | Promise<void>
