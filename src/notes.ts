import { randomUUID } from "node:crypto"
import { createReadStream, ReadStream } from "node:fs";
import fs from "node:fs/promises"
import path from "node:path";

export type Note = { id: string, text: string }

const PATH_NOTES = path.join(import.meta.dirname, 'notes.json');
const NOTES_ENCODING = "utf-8"

export function isFileNotFound(e: unknown) {
    return e instanceof Error && 'code' in e && e.code === 'ENOENT'
}

export async function readNotes(): Promise<Note[]> {
    try {
        const notesJson = await fs.readFile(PATH_NOTES, NOTES_ENCODING)
        return JSON.parse(notesJson)

    } catch (e) {
        if (isFileNotFound(e)) return []
        throw e
    }
}

export function readNotesAsStream() {
    return createReadStream(PATH_NOTES)
}

export async function addNote(text: Note["text"]) {
    const notes = await readNotes();
    const newNote = { text, id: randomUUID() }
    notes.push(newNote);

    await fs.writeFile(PATH_NOTES, JSON.stringify(notes), NOTES_ENCODING)
    return newNote
}

export function isValidNote(note: Pick<Note, 'text'>) {
    return 'text' in note
        && typeof note.text === 'string'
        && note.text.trim().length > 0
}