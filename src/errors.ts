import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err);

    if (err instanceof CustomError) {
        res.status(err.custom.code).json(setError(err.custom.msg))

    } else {

        if (err.type === "entity.parse.failed") {
            res.status(400).json(setError("Неверный формат JSON"))
            return
        }

        if (err.type === 'entity.too.large') {
            res.status(413).json(setError("Превышен размер запроса"))
            return
        }

        if (res.headersSent) {
            res.destroy()
        } else {
            res.status(500).json(setError("Внутренняя ошибка сервера"));
        }
    }
};

export class CustomError extends Error {
    public custom: { code: number; msg: string, onSent?: () => void };
    constructor(
        code: number,
        msg: string,
        onSent?: () => void
    ) {
        super(msg);

        this.name = "CustomError";
        this.custom = {
            code, msg, onSent
        };
    }
}

export function setError(text: string) {
    return { error: text }
}