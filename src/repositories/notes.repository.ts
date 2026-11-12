import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { Note, NoteBodyCreate } from '#models/notes.models.ts'

let writeQueue: Promise<unknown> = Promise.resolve()

async function safeTask<T>(task: () => Promise<T>): Promise<T> {
	const result = writeQueue.then(task)
	writeQueue = result.catch(() => {})
	return result
}

const PATH_NOTES = path.join(import.meta.dirname, '../notes.json')
const NOTES_ENCODING = 'utf-8'
async function writeNotes(notes: Note[]) {
	return await fs.writeFile(PATH_NOTES, JSON.stringify(notes), NOTES_ENCODING)
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

async function addNote(text: NoteBodyCreate['text']) {
	const notes = await readNotes()
	const newNote: Note = { text, id: randomUUID() }
	notes.push(newNote)

	await writeNotes(notes)
	return newNote
}

async function findNoteById(id: Note['id']) {
	const notes = await readNotes()
	return notes.find((note) => note.id === id) ?? null
}

async function updateNote(note: Note): Promise<Note | null> {
	const notes = await readNotes()
	const foundNote = notes.find((_note) => _note.id === note.id)

	if (!foundNote) {
		return null
	}

	foundNote.text = note.text
	await writeNotes(notes)

	return foundNote
}

export const noteRepo = {
	write: async (note: NoteBodyCreate) => safeTask(() => addNote(note.text)),
	read: async () => safeTask(() => readNotes()),
	findById: async (id: Note['id']) => safeTask(() => findNoteById(id)),
	update: async (note: Note) => safeTask(() => updateNote(note)),
}
