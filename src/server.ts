import http from "node:http"
import { addNote, isValidNote, type Note, readNotes } from "./notes.ts"

const CONTENT_TYPE_JSON = { "Content-Type": "application/json" }
const METHODS = {
    GET: 'GET',
    POST: 'POST'
}
const PATHS = {
    NOTES: '/notes'
}

function setError(text: string) {
    return { error: text }
}

function isObject(value: unknown): value is Record<string, any> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const server = http.createServer(async (req, res) => {

    function sendJson(code: number, data: unknown) {
        res.writeHead(code, CONTENT_TYPE_JSON)
        res.end(JSON.stringify(data));
    }

    function sendServerError(e: unknown) {
        console.error(e)
        sendJson(500, setError("Внутренняя ошибка сервера"));
    }

    try {
        if (req.url === PATHS.NOTES) {

            if (req.method === METHODS.GET) {

                const data = await readNotes()
                sendJson(200, data)
                return;
            }

            if (req.method === METHODS.POST) {
                const buffers: Buffer[] = [];

                for await (const chunk of req) {
                    buffers.push(chunk);
                }

                const rawData = Buffer.concat(buffers).toString();

                try {
                    const body = JSON.parse(rawData);
                    const isValidBody = isObject(body) && isValidNote(body as Pick<Note, 'text'>)

                    if (!isValidBody) throw new Error

                    const newNote = await addNote(body.text).catch(sendServerError)
                    sendJson(201, newNote);

                } catch {
                    sendJson(400, setError("Неверный формат заметки"));
                    return;
                }

                return;
            }
        }

    } catch (e) {
        sendServerError(e)
        return;
    }

    sendJson(404, setError('Страница не найдена'))
})

server.listen(3000, () => {
    console.log('server on http://localhost:3000')
})