import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { Note, NoteBodyCreate } from '../models/notes.models.ts'

const writeNote = async (note: NoteBodyCreate) => safeTask(() => addNote(note.text))

let writeQueue: Promise<unknown> = Promise.resolve()

async function safeTask<T>(task: () => Promise<T>): Promise<T> {
	const result = writeQueue.then(task)
	writeQueue = result.catch(() => {})
	return result
}

const PATH_NOTES = path.join(import.meta.dirname, '../notes.json')
const NOTES_ENCODING = 'utf-8'

async function addNote(text: NoteBodyCreate['text']) {
	const notes = await readNotes()
	const newNote: Note = { text, id: randomUUID() }
	notes.push(newNote)

	await fs.writeFile(PATH_NOTES, JSON.stringify(notes), NOTES_ENCODING)
	return newNote
}

async function readNotes(): Promise<Note[]> {
	try {
		const notesJson = await fs.readFile(PATH_NOTES, NOTES_ENCODING)

		return JSON.parse(notesJson)
	} catch (e) {
		if (isFileNotFound(e)) return []
		throw e
	}
}

function isFileNotFound(e: unknown) {
	return e instanceof Error && 'code' in e && e.code === 'ENOENT'
}

async function findNoteById(id: Note['id']) {
	const notes = await noteRepo.read()
	const fundedNote = notes.find((note) => note.id === id)

	return fundedNote
}

export const noteRepo = {
	write: writeNote,
	read: readNotes,
	findById: findNoteById,
}
