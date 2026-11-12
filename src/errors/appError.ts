import type { AppErrorCode } from './errorCodes.ts'

export type ErrorDetails = {
	in: 'query' | 'params' | 'body'
	field: string
	message: string
}[]

export class AppError extends Error {
	public readonly code: AppErrorCode
	public readonly errors: ErrorDetails | null

	constructor(code: AppErrorCode, errors: ErrorDetails | null = null) {
		super(code)

		this.name = 'AppError'
		this.code = code
		this.errors = errors
	}
}
