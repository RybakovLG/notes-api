import request from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'
import type { Note } from '#models/notes.models.ts'
import { app } from '../src/app.ts'
import { clearNotes } from './setup.ts'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const VALID_TEXT = /\S/

const req = () => request(app)
const getNotes = () => req().get('/notes')
const postNotes = async (body?: string | object) => req().post('/notes').send(body)
const patchNotes = () => req().patch('/notes').send({ text: 'valid' })

const expectValidText = expect.stringMatching(VALID_TEXT)
const expectValidId = expect.stringMatching(UUID)

async function expectEmptyNotes() {
	const { status, body } = await getNotes()
	expect({ status, body }).toEqual({ status: 200, body: [] })
}

const VALID_NOTES = ['Valid', '  valid  ', 'v', 'loooooong vaaaaliiiidddd ']
// undefined уйдёт как {} — проверка отсутствующего поля text
const INVALID_NOTES = ['', ' ', 123, '   ', undefined]

afterEach(async () => await clearNotes())

describe('POST /notes', () => {
	it('Создает валидные заметки', async () => {
		const resAll = await Promise.all(VALID_NOTES.map((text) => postNotes({ text })))

		resAll.forEach((res, idx) => {
			const { status, body } = res

			expect({ status, body }).toEqual({
				status: 201,
				body: { id: expectValidId, text: VALID_NOTES.at(idx) },
			})
		})
	})

	it('Не создает невалидные заметки - чек text', async () => {
		await Promise.all(
			INVALID_NOTES.map((text) =>
				postNotes({ text }).then((res) => {
					expect(res.status).toBe(400)
					expect(res.body).toMatchObject({
						errors: expect.arrayContaining([
							{ in: 'body', field: 'text', message: expect.stringMatching(/\S/) },
						]),
					})
				}),
			),
		)

		await expectEmptyNotes()
	})

	it('Не создает невалидные заметки - чек body', async () => {
		const invalidBody = ['', [], undefined]
		await Promise.all(
			invalidBody.map((body) =>
				postNotes(body).then((res) => {
					expect(res.status).toBe(400)

					expect(res.body).toMatchObject({
						errors: expect.arrayContaining([
							{ in: 'body', field: '', message: expect.stringMatching(/\S/) },
						]),
					})
				}),
			),
		)

		await expectEmptyNotes()
	})
})

describe('GET /notes', () => {
	it('Получает все созданные заметки', async () => {
		const byId = new Map<string, Note>()
		await Promise.all(
			VALID_NOTES.map((text) =>
				postNotes({ text }).then(({ body }) => {
					byId.set(body.id, body)
				}),
			),
		)

		const { status, body } = await getNotes()

		expect(status).toBe(200)
		expect(body.length).toBe(byId.size)

		body.forEach((note: Note) => {
			expect(note).toEqual({ id: expectValidId, text: expectValidText })
			expect(note).toEqual(byId.get(note.id))
		})
	})
})

describe('PATCH /notes', () => {
	it('отвечает 405 со списком разрешённых методов', async () => {
		const res = await patchNotes()

		expect(res.status).toBe(405)
		// Порядок методов в Allow не важен — сортируем перед сравнением
		expect(res.headers.allow.split(', ').toSorted()).toEqual(['GET', 'POST'])
	})
})
