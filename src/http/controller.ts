import type { NextFunction, Request } from "express";
import type { SafeResponse } from "./response.ts";

// Контроллер получает тело уже проверенным: тип ReqBody задаёт validate
export type Controller<ReqBody = unknown> = (
    req: Request<Record<string, string>, unknown, ReqBody>,
    res: SafeResponse,
    next: NextFunction,
) => void | Promise<void>
