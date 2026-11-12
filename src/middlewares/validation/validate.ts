import type { NextFunction, Response } from 'express'
import type { ZodError } from 'zod'
import { AppError, type ErrorDetails } from '#errors/appError.ts'
import type { Schemas, ValidatedRequest } from '#http/request.ts'

// Собираем ошибки из всех частей запроса и отдаём одним 400.
// В req.body кладём данные после схемы (с trim и прочими преобразованиями)
export const validate =
	<S extends Schemas>(schemas: S) =>
	(req: ValidatedRequest<S>, _: Response, next: NextFunction) => {
		const issues: ErrorDetails = []

		function collectIssues(errors: ZodError['issues'], where: ErrorDetails[number]['in']) {
			errors.forEach((issue) => {
				issues.push({
					in: where,
					field: issue.path.join('.'),
					message: issue.message,
				})
			})
		}

		if (schemas.query) {
			const result = schemas.query.safeParse(req.query)
			if (!result.success) collectIssues(result.error.issues, 'query')
		}

		if (schemas.params) {
			const result = schemas.params.safeParse(req.params)
			if (!result.success) collectIssues(result.error.issues, 'params')
		}

		if (schemas.body) {
			const result = schemas.body.safeParse(req.body)
			if (result.success) req.body = result.data as typeof req.body
			else collectIssues(result.error.issues, 'body')
		}

		if (issues.length) {
			throw new AppError('VALIDATION_ERROR', issues)
		}

		next()
	}
