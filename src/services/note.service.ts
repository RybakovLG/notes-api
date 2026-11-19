import { AppError } from '#errors/appError.ts'
import type { Note, NoteGetAllQuery } from '#models/notes.models.ts'
import { noteRepo } from '#repositories/notes.repository.ts'

export const QUERY_DEFAULTS = {
	notes: {
		limit: 10,
		offset: 0,
	},
}

export type Paginated<T> = {
	total: number
	items: T
}

const getAll = async ({
	limit = QUERY_DEFAULTS.notes.limit,
	offset = QUERY_DEFAULTS.notes.offset,
}: NoteGetAllQuery): Promise<Paginated<Note[]>> => {
	// console.log('getAll', { limit, offset })

	const { notes, total } = await noteRepo.getPaginatedNotes({ limit, offset })
	if (offset > 0 && offset >= total) {
		throw new AppError('ENTITY_NOT_FOUND')
	}

	return {
		total,
		items: notes,
	}
}

export const notesService = {
	getAll,
}
