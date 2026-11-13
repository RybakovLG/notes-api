import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterAll } from 'vitest'

// Свой файл заметок на каждый тестовый файл: параллельные файлы не мешают друг другу
const notesPath = path.join(os.tmpdir(), `notes-test-${randomUUID()}.json`)

process.env.PORT = '3000' // listen в тестах не вызывается, но config.ts требует PORT
process.env.NOTES_PATH = notesPath

export async function clearNotes() {
	return Promise.all([notesPath, `${notesPath}.tmp`].map((path) => fs.rm(path, { force: true })))
	// await fs.rm(notesPath, { force: true })
	// await fs.rm(`${notesPath}.tmp`, { force: true })
}

afterAll(async () => await clearNotes())
