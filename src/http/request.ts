import type { Request } from 'express'
import type { ZodType, z } from 'zod'

export type Schemas = Partial<Record<'params' | 'query' | 'body', ZodType>>

export type ValidatedParts<S extends Schemas> = {
	[K in keyof S as K extends keyof Schemas ? K : never]: z.output<NonNullable<S[K]>>
}

export type ValidatedRequest<S extends Schemas> = Request & {
	validated: ValidatedParts<S>
}
