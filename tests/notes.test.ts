import { randomUUID } from 'node:crypto'
import request, { type Response } from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'
import type { ResAppError } from '#middlewares/errors/errorHandler.ts'
import type { Note } from '#models/notes.models.ts'
import { app } from '../src/app.ts'
import { clearNotes } from './setup.ts'

// ── запросы ──────────────────────────────────────────────
type Body = string | object | undefined

const req = () => request(app)
const getNotes = () => req().get('/notes')
const postNote = (body?: Body) => req().post('/notes').send(body)
const getNote = (id: string) => req().get(`/notes/${id}`)
const putNote = (id: string, body?: Body) => req().put(`/notes/${id}`).send(body)
const deleteNote = (id: string) => req().delete(`/notes/${id}`)

// Фикстура: создаёт заметку и возвращает её тело
async function seedNote(text = 'note'): Promise<Note> {
	const { body } = await postNote({ text })
	return body
}

// ── проверки ─────────────────────────────────────────────
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const anyText = expect.stringMatching(/\S/)
const anyId = expect.stringMatching(UUID)

type ErrorIn = 'body' | 'params'

function expectError(res: Response, status: number, error: Partial<ResAppError>) {
	expect(res.status).toBe(status)
	expect(res.body).toMatchObject<Partial<ResAppError>>(error)
}

const expectNotFound = (res: Response) => expectError(res, 404, { code: 'ENTITY_NOT_FOUND' })

// Ровно одна ошибка валидации в указанном поле
const expectValidationError = (res: Response, where: ErrorIn, field: string) =>
	expectError(res, 400, {
		code: 'VALIDATION_ERROR',
		errors: [{ in: where, field, message: anyText }],
	})

// Порядок методов в Allow не важен — сортируем перед сравнением
function expectNotAllowed(res: Response, allowed: string[]) {
	expect(res.status).toBe(405)
	expect(res.headers.allow.split(', ').toSorted()).toEqual(allowed.toSorted())
}

// Состояние хранилища: ровно эти заметки, порядок не важен
async function expectStoredNotes(expected: Note[]) {
	const { status, body } = await getNotes()
	expect(status).toBe(200)
	expect(body).toHaveLength(expected.length)
	expect(body).toEqual(expect.arrayContaining(expected))
}

// ── данные ───────────────────────────────────────────────
const VALID_TEXTS = ['Valid', '  valid  ', 'v', 'loooooong vaaaaliiiidddd ']
// undefined уйдёт как {} — проверка отсутствующего поля text
const INVALID_TEXTS = ['', ' ', '   ', 123, undefined]
const INVALID_BODIES = ['', [], undefined]
const INVALID_ID = 'invalid-id'

afterEach(clearNotes)

// ── тесты ────────────────────────────────────────────────
describe('POST /notes', () => {
	it.for(VALID_TEXTS)('создаёт заметку с текстом %j', async (text) => {
		const res = await postNote({ text })

		expect(res.status).toBe(201)
		expect(res.body).toEqual({ id: anyId, text })
		await expectStoredNotes([res.body])
	})

	it.for(INVALID_TEXTS)('400 на невалидный текст %j', async (text) => {
		const res = await postNote({ text })

		expectValidationError(res, 'body', 'text')
		await expectStoredNotes([])
	})

	it.for(INVALID_BODIES)('400 на невалидный body %j', async (body) => {
		const res = await postNote(body)

		expectValidationError(res, 'body', '')
		await expectStoredNotes([])
	})
})

describe('GET /notes', () => {
	it('возвращает все созданные заметки', async () => {
		const created = await Promise.all(VALID_TEXTS.map(seedNote))

		await expectStoredNotes(created)
	})
})

describe('GET /notes/:id', () => {
	it('возвращает созданную заметку', async () => {
		const note = await seedNote()
		const res = await getNote(note.id)

		expect(res.status).toBe(200)
		expect(res.body).toEqual(note)
	})

	it('404 на несуществующий id', async () => {
		expectNotFound(await getNote(randomUUID()))
	})

	it('400 на невалидный id', async () => {
		expectValidationError(await getNote(INVALID_ID), 'params', 'id')
	})
})

describe('PUT /notes/:id', () => {
	it('меняет текст заметки', async () => {
		const note = await seedNote('before put')
		const updated = { id: note.id, text: 'after put' }

		const res = await putNote(note.id, { text: updated.text })

		expect(res.status).toBe(200)
		expect(res.body).toEqual(updated)
		await expectStoredNotes([updated])
	})

	it('404 на несуществующий id и ничего не создаёт', async () => {
		const note = await seedNote()

		expectNotFound(await putNote(randomUUID(), { text: 'not found' }))
		await expectStoredNotes([note])
	})

	it('400 на невалидный id', async () => {
		const note = await seedNote()

		expectValidationError(await putNote(INVALID_ID, { text: 'valid' }), 'params', 'id')
		await expectStoredNotes([note])
	})

	it.for(INVALID_TEXTS)('400 на невалидный текст %j и заметка не меняется', async (text) => {
		const note = await seedNote()

		expectValidationError(await putNote(note.id, { text }), 'body', 'text')
		await expectStoredNotes([note])
	})

	it.for(INVALID_BODIES)('400 на невалидный body %j и заметка не меняется', async (body) => {
		const note = await seedNote()

		expectValidationError(await putNote(note.id, body), 'body', '')
		await expectStoredNotes([note])
	})
})

describe('DELETE /notes/:id', () => {
	it('удаляет заметку', async () => {
		const note = await seedNote()

		const res = await deleteNote(note.id)

		expect(res.status).toBe(204)
		expect(res.body).toStrictEqual({})
		expectNotFound(await getNote(note.id))
	})

	it('404 на несуществующий id', async () => {
		expectNotFound(await deleteNote(randomUUID()))
	})

	it('404 на повторное удаление', async () => {
		const note = await seedNote()
		await deleteNote(note.id)

		expectNotFound(await deleteNote(note.id))
	})

	it('400 на невалидный id', async () => {
		expectValidationError(await deleteNote(INVALID_ID), 'params', 'id')
	})
})

describe('405 на неразрешённый метод', () => {
	it('PATCH /notes', async () => {
		expectNotAllowed(await req().patch('/notes'), ['GET', 'POST'])
	})

	it('PATCH /notes/:id', async () => {
		const note = await seedNote()

		expectNotAllowed(await req().patch(`/notes/${note.id}`), ['GET', 'PUT', 'DELETE'])
	})
})

describe('конкурентность запросов', () => {
	const COUNT = 50

	it(`${COUNT} параллельных POST дают ${COUNT} заметок без потерь`, async () => {
		const texts = Array.from({ length: COUNT }, (_, i) => `note-${i}`)

		const responses = await Promise.all(texts.map((text) => postNote({ text })))

		for (const res of responses) expect(res.status).toBe(201)

		// Ожидание — то, что отправили, а не то, что вернул сервер
		const { body: notes } = await getNotes()
		expect(notes.map((n: Note) => n.text).toSorted()).toEqual(texts.toSorted())
	})
})
