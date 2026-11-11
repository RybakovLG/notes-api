import express from 'express';
import { errorHandler } from './middlewares/errors/errorHandler.ts';
import { notesRouter } from './routes/notes.routes.ts';

export const app = express();
app.use(express.json({ limit: '1mb' }))

app.use('/notes', notesRouter)

app.use(errorHandler);