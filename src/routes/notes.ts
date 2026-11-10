import { once } from "node:events";
import { addNote, isFileNotFound, isValidNote, readNotesAsStream } from "../notes.ts";
import { pipeline } from "node:stream/promises";
import type { RequestHandler } from "express";
import { CustomError } from "../errors.ts";

const getNotes: RequestHandler = async (_, res) => {
    try {
        const stream = readNotesAsStream()

        await once(stream, 'open');
        res.type('application/json')

        await pipeline(stream, res)
    } catch (e) {
        if (isFileNotFound(e)) {
            res.json([])
            return
        }
        throw e
    }
}

let writeQueue: Promise<unknown> = Promise.resolve();

async function safeTask(task: () => Promise<unknown>) {
    const result = writeQueue.then(task);
    writeQueue = result.catch(() => { });
    return result
}

const createNote: RequestHandler = async ({ body }, res) => {
    const isValidBody = isValidNote(body)
    if (!isValidBody) throw new CustomError(400, "Неверный формат заметки")

    const newNote = await safeTask(() => addNote(body.text))
    res.status(201).json(newNote)
}

export { getNotes, createNote }