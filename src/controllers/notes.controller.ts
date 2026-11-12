import { AppError } from '../errors/appError.ts'
import type { Controller } from '../http/controller.ts'
import { created, ok } from '../http/response.ts'
import type { noteSchemaObj } from '../models/notes.models.ts'
import { noteRepo } from '../repositories/notes.repository.ts'

const createNote: Controller<typeof noteSchemaObj.create> = async ({ body }, res) => {
	const newNote = await noteRepo.write(body)
	created(res, newNote)
}

const getAllNotes: Controller = async (_, res) => {
	const notes = await noteRepo.read()
	ok(res, notes)
}
const getNotesById: Controller<typeof noteSchemaObj.getById> = async (req, res) => {
	const foundNote = await noteRepo.findById(req.params.id)

	if (!foundNote) {
		throw new AppError('ENTITY_NOT_FOUND')
	}

	ok(res, foundNote)
}

const notesNotAllowed: Controller = (_, res) => {
	res.set('Allow', 'GET, POST')
	throw new AppError('METHOD_NOT_ALLOWED')
}

export const notesController = {
	create: createNote,
	getAll: getAllNotes,
	getById: getNotesById,
	notAllowed: notesNotAllowed,
}
