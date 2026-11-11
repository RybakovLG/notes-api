import { Router } from "express";
import { validate } from "../middlewares/validation/validate.ts";
import { notesController } from "../controllers/notes.controller.ts";
import { createNoteSchema } from "../models/notes.models.ts";

const notesRouter = Router();

notesRouter.get(
    '/',
    notesController.get
);

notesRouter.post(
    '/',
    validate(createNoteSchema),
    notesController.create
);

notesRouter.all('/', notesController.notAllowed);

export { notesRouter }