import express from 'express';
import { errorHandler, setError } from './errors.ts';
import { createNote, getNotes } from './routes/notes.ts';

const app = express();
app.use(express.json({ limit: '1mb' }))

app.route('/notes')
    .get(getNotes)
    .post(createNote)
    .all((_, res) => {
        res.set('Allow', 'GET, POST');
        res.status(405).json(setError('Не разрешен метод запроса'));
    });

app.use(errorHandler);

app.listen(3000, () => {
    console.log('server on http://localhost:3000')
});