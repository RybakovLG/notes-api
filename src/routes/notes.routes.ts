import { type IRoute, Router } from 'express'
import { notesController } from '#controllers/notes.controller.ts'
import { validate } from '#middlewares/validation/validate.ts'
import { noteSchemaObj } from '#models/notes.models.ts'

const notesRouter = Router()

notesRouter
	.route('/')
	.get(notesController.getAll)
	.post(validate(noteSchemaObj.create), notesController.create)

notesRouter
	.route('/:id')
	.get(validate(noteSchemaObj.getById), notesController.getById)
	.put(validate(noteSchemaObj.put), notesController.update)
	.delete(validate(noteSchemaObj.delete), notesController.delete)

// route.methods — внутреннее поле Express (в типах его нет): методы, уже зарегистрированные на путь.
type RouteWithMethods = IRoute & { methods: Record<string, true> }

// Дописываем в конец каждого пути 405 с Allow из этих методов
for (const layer of notesRouter.stack) {
	const route = layer.route as RouteWithMethods | undefined
	route?.all(notesController.notAllowed(Object.keys(route.methods)))
}

export { notesRouter }
