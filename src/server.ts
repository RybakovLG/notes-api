import http, { type OutgoingHttpHeaders } from "node:http"
import { addNote, isFileNotFound, isValidNote, type Note, readNotesAsStream } from "./notes.ts"
import { pipeline } from "node:stream/promises"
import { once } from "node:events"
import type { ReadStream, ReadStreamEventMap } from "node:fs"

const CONTENT_TYPE_JSON = { "Content-Type": "application/json" }
const METHODS = {
  GET: 'GET',
  POST: 'POST'
}
const PATHS = {
  NOTES: '/notes'
}
const MAX_BODY_SIZE = 1024 * 1024;

function setError(text: string) {
  return { error: text }
}

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const server = http.createServer(async (req, res) => {

  function writeHeadJson(code: number) {
    res.writeHead(code, CONTENT_TYPE_JSON)
  }

  function sendJson(code: number, data: unknown) {
    writeHeadJson(code)
    res.end(JSON.stringify(data));
  }

  function sendServerError(e: unknown) {
    console.error(e)

    if (res.headersSent) {
      res.destroy()
    } else {
      sendJson(500, setError("Внутренняя ошибка сервера"));
    }
  }

  async function collectChunks(
    maxBodySize: number = MAX_BODY_SIZE
  ): Promise<{ rawData: string, error: null } | { rawData: null, error: string }> {

    const buffers: Buffer[] = [];
    let bodySize = 0
    let error = null

    for await (const chunk of req) {
      bodySize += (chunk as Buffer).length

      if (bodySize > maxBodySize) {
        error = "Превышен размер запроса"
        sendJson(413, setError(error))
        req.destroy();

        return { error, rawData: null }
      }

      buffers.push(chunk);
    }

    return {
      rawData: Buffer.concat(buffers).toString(),
      error
    }
  }

  try {
    if (req.url === PATHS.NOTES) {
      if (req.method === "OPTIONS") {
        res.setHeader(
          "Access-Control-Allow-Methods",
          `${METHODS.GET}, ${METHODS.POST}, OPTIONS`
        );
        res.writeHead(204);
        res.end();
        return;
      }

      if (req.method === METHODS.GET) {

        // const data = await readNotes()
        // sendJson(200, data)

        try {
          const stream = readNotesAsStream()

          await once(stream, 'open');
          writeHeadJson(200)

          await pipeline(stream, res)

        } catch (e) {
          if (isFileNotFound(e)) {
            sendJson(200, [])
            return
          }
          throw e
        }
        return;
      }

      if (req.method === METHODS.POST) {

        const { rawData, error } = await collectChunks()
        if (error) return

        try {
          const body = JSON.parse(rawData as string);
          const isValidBody = isObject(body) && isValidNote(body as Pick<Note, 'text'>)

          if (!isValidBody) throw new Error

          try {
            const newNote = await addNote(body.text)
            sendJson(201, newNote);
          } catch (e) {
            sendServerError(e)
            return
          }
        } catch {
          sendJson(400, setError("Неверный формат заметки"));
          return;
        }

        return;
      }

      res.setHeader('Allow', "GET, POST")
      sendJson(405, setError('Не разрешен метод запроса'))
      return
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