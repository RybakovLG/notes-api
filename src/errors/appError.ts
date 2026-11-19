import type { AppErrorCode } from './errorCodes.ts'

export type AppErrorDetails = {
	in: 'query' | 'params' | 'body'
	field: string
	message: string
}[]

export type AppErrorWhere = AppErrorDetails[number]['in']

export class AppError extends Error {
	public readonly code: AppErrorCode
	public readonly errors: AppErrorDetails | null

	constructor(code: AppErrorCode, errors: AppErrorDetails | null = null) {
		super(code)

		this.name = 'AppError'
		this.code = code
		this.errors = errors
	}
}
