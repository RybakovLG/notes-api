import type { ErrorRequestHandler } from 'express'
import { AppError } from '../../errors/appError.ts'
import { type AppErrorCode, appErrorsByCode, problemType } from '../../errors/errorCodes.ts'

const bodyParserCodes: Record<string, AppErrorCode> = {
	'entity.parse.failed': 'ENTITY_PARSE_FAILED',
	'entity.too.large': 'ENTITY_TOO_LARGE',
}

function toAppError(err: unknown): AppError {
	if (err instanceof AppError) return err

	const type = (err as { type?: unknown } | null)?.type
	if (typeof type === 'string' && type in bodyParserCodes) {
		return new AppError(bodyParserCodes[type])
	}

	return new AppError('INTERNAL_SERVER_ERROR')
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	if (res.headersSent) return next(err)

	const appError = toAppError(err)
	const { title, status, detail } = appErrorsByCode[appError.code]

	if (status >= 500) console.error(err)

	res
		.status(status)
		.type('application/problem+json')
		.json({
			type: problemType(appError.code),
			title,
			status,
			detail,
			instance: req.originalUrl,
			code: appError.code,
			errors: appError.errors,
		})
}
