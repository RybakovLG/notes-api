import { type RequestHandler, Router } from 'express'
import { notesController } from '#controllers/notes.controller.ts'
import type { Controller } from '#http/controller.ts'
import type { Schemas } from '#http/request.ts'
import { validate } from '#middlewares/validation/validate.ts'
import { noteSchemaObj } from '#models/notes.models.ts'

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete'
type RouteTable = Record<string, Partial<Record<Method, RequestHandler[]>>>

// Схема и контроллер связаны общим S: контроллер получает типы req из своей схемы.
// Express не знает про наши ValidatedRequest, поэтому одно приведение здесь, снаружи всё строго.
const route = <S extends Schemas>(schemas: S, controller: Controller<S>) =>
	[validate(schemas), controller] as unknown as RequestHandler[]

const routes: RouteTable = {
	'/': {
		get: route({}, notesController.getAll),
		post: route(noteSchemaObj.create, notesController.create),
	},
	'/:id': {
		get: route(noteSchemaObj.getById, notesController.getById),
		put: route(noteSchemaObj.put, notesController.update),
		delete: route(noteSchemaObj.delete, notesController.delete),
	},
}

// Регистрируем методы каждого пути, остальные методы этого пути — 405 с Allow из ключей таблицы
const notesRouter = Router()

for (const [path, methods] of Object.entries(routes)) {
	for (const [method, handlers] of Object.entries(methods)) {
		notesRouter[method as Method](path, ...handlers)
	}

	notesRouter.all(path, notesController.notAllowed(Object.keys(methods)))
}

export { notesRouter }
