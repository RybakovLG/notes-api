import type { RequestHandler } from 'express'
import type { ZodError } from 'zod'
import { AppError, type AppErrorDetails, type AppErrorWhere } from '#errors/appError.ts'
import type { Controller } from '#http/controller.ts'
import type { Schemas, ValidatedParts } from '#http/request.ts'

const requestParts = ['query', 'params', 'body'] as const satisfies readonly (keyof Schemas)[]

export const validate =
	<S extends Schemas>(schemas: S, controller: Controller<NoInfer<S>>): RequestHandler =>
	(req, res, next) => {
		const issues: AppErrorDetails = []
		const validated: Partial<Record<keyof Schemas, unknown>> = {}

		function collectIssues(errors: ZodError['issues'], where: AppErrorWhere) {
			errors.forEach((issue) => {
				issues.push({
					in: where,
					field: issue.path.join('.'),
					message: issue.message,
				})
			})
		}

		for (const where of requestParts) {
			const schema = schemas[where]
			if (!schema) continue

			const result = schema.safeParse(req[where])
			if (result.success) {
				validated[where] = result.data
			} else {
				collectIssues(result.error.issues, where)
			}
		}

		if (issues.length) {
			throw new AppError('VALIDATION_ERROR', issues)
		}

		// К этому моменту для каждой переданной схемы есть результат safeParse.
		return controller(Object.assign(req, { validated: validated as ValidatedParts<S> }), res, next)
	}
