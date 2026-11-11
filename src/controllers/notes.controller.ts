import { noteRepo } from "../repositories/notes.repository.ts"
import { AppError } from "../errors/appError.ts"
import { created, ok } from "../http/response.ts"
import type { Controller } from "../http/controller.ts"
import type { CreateNote } from "../models/notes.models.ts"

const createNote: Controller<CreateNote> = async ({ body }, res) => {
    const newNote = await noteRepo.write(body)
    created(res, newNote)
}

const getNotes: Controller = async (_, res) => {
    const notes = await noteRepo.read()
    ok(res, notes)
}

const notesNotAllowed: Controller = (_, res) => {
    res.set('Allow', 'GET, POST');
    throw new AppError('METHOD_NOT_ALLOWED');
}

export const notesController = {
    create: createNote,
    get: getNotes,
    notAllowed: notesNotAllowed
}
