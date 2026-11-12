import type { Response } from 'express'

type SuccessStatus = 200 | 201 | 204

export type SafeResponse = Omit<Response, 'status' | 'sendStatus'> & {
	status(code: SuccessStatus): SafeResponse
}

export const ok = (res: SafeResponse, data: unknown) => {
	res.status(200).json(data)
}

export const created = (res: SafeResponse, data: unknown) => {
	res.status(201).json(data)
}

export const noContent = (res: SafeResponse) => {
	res.status(204).end()
}
