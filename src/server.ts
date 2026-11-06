import http from "node:http"
import { addNote, isFileNotFound, isValidNote, type Note, readNotesAsStream } from "./notes.ts"
import { pipeline } from "node:stream/promises"
import { once } from "node:events"

class CustomError extends Error {
  public custom: { code: number; msg: string, onSent?: () => void };
  constructor(
    code: number,
    msg: string,
    onSent?: () => void
  ) {
    super(msg);

    this.name = "CustomError";
    this.custom = {
      code, msg, onSent
    };
  }
}

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

let writeQueue: Promise<unknown> = Promise.resolve();

async function safeTask(task: () => Promise<unknown>) {
  const result = writeQueue.then(task);
  writeQueue = result.catch(() => { });
  return result
}

const server = http.createServer(async (req, res) => {

  function writeHeadJson(code: number) {
    res.writeHead(code, CONTENT_TYPE_JSON)
  }

  function sendJson(code: number, data: unknown, onSent?: () => void) {
    writeHeadJson(code)
    res.end(JSON.stringify(data), onSent);
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
  ): Promise<string> {

    const buffers: Buffer[] = [];
    let bodySize = 0

    for await (const chunk of req) {
      bodySize += (chunk as Buffer).length

      if (bodySize > maxBodySize) {
        throw new CustomError(413, "Превышен размер запроса")
      }

      buffers.push(chunk);
    }

    return Buffer.concat(buffers).toString()
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

        const rawData = await collectChunks()

        let body = null

        try {
          body = JSON.parse(rawData);
        } catch {
          throw new CustomError(400, "Неверный формат заметки")
        }
        const isValidBody = isObject(body) && isValidNote(body)

        if (!isValidBody) throw new CustomError(400, "Неверный формат заметки")

        const newNote = await safeTask(() => addNote(body.text))
        sendJson(201, newNote);

        return;
      }

      res.setHeader('Allow', "GET, POST")
      throw new CustomError(405, 'Не разрешен метод запроса')
    }

  } catch (e) {
    if (e instanceof CustomError) {
      sendJson(e.custom.code, setError(e.custom.msg), e.custom.onSent)
    } else {
      sendServerError(e)
    }

    return;
  }

  sendJson(404, setError('Страница не найдена'))
})

server.listen(3000, () => {
  console.log('server on http://localhost:3000')
})