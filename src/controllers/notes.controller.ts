import type { RequestHandler } from 'express'
import { AppError } from '#errors/appError.ts'
import type { Controller } from '#http/controller.ts'
import { created, noContent, ok } from '#http/response.ts'
import type { noteSchemaObj } from '#models/notes.models.ts'
import { noteRepo } from '#repositories/notes.repository.ts'
import { notesService } from '#services/note.service.ts'

const createNote: Controller<typeof noteSchemaObj.create> = async (
	{ validated: { body } },
	res,
) => {
	const newNote = await noteRepo.write(body)
	created(res, newNote)
}

const getAllNotes: Controller<typeof noteSchemaObj.getAll> = async (req, res) => {
	const notes = await notesService.getAll(req.validated.query)
	// console.log('getAllNotes', { notes })

	ok(res, notes)
}

const getNotesById: Controller<typeof noteSchemaObj.getById> = async (req, res) => {
	const foundNote = await noteRepo.findById(req.validated.params.id)

	if (!foundNote) {
		throw new AppError('ENTITY_NOT_FOUND')
	}

	ok(res, foundNote)
}

const updateNote: Controller<typeof noteSchemaObj.put> = async (req, res) => {
	const newNote = await noteRepo.update({
		id: req.validated.params.id,
		text: req.validated.body.text,
	})

	if (!newNote) {
		throw new AppError('ENTITY_NOT_FOUND')
	}

	ok(res, newNote)
}

const deleteNote: Controller<typeof noteSchemaObj.delete> = async (req, res) => {
	const isDeleted = await noteRepo.delete(req.validated.params.id)

	if (isDeleted) {
		noContent(res)
	} else {
		throw new AppError('ENTITY_NOT_FOUND')
	}
}

// Фабрика: для каждого пути свой список разрешённых методов в заголовке Allow
const notesNotAllowed =
	(methods: string[]): RequestHandler =>
	(_, res) => {
		res.set('Allow', methods.toSorted().join(', ').toUpperCase())
		throw new AppError('METHOD_NOT_ALLOWED')
	}

export const notesController = {
	create: createNote,
	getAll: getAllNotes,
	getById: getNotesById,
	update: updateNote,
	notAllowed: notesNotAllowed,
	delete: deleteNote,
}
