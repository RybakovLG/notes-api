import { Router } from 'express'
import { notesController } from '#controllers/notes.controller.ts'
import { validate } from '#middlewares/validation/validate.ts'
import { noteSchemaObj } from '#models/notes.models.ts'

const notesRouter = Router()

notesRouter.get('/', notesController.getAll)

notesRouter.get('/:id/', validate(noteSchemaObj.getById), notesController.getById)

notesRouter.post('/', validate(noteSchemaObj.create), notesController.create)

notesRouter.all('/', notesController.notAllowed)

export { notesRouter }
