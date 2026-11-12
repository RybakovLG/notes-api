import type { Request } from 'express'
import type { ZodType, z } from 'zod'

export type Schemas = Partial<Record<'params' | 'query' | 'body', ZodType>>

// Есть схема -> тип из неё, нет схемы -> дефолт Express
type InferOr<T, Default> = T extends ZodType ? z.infer<T> : Default

// Типы req из группы схем эндпоинта: одна группа и для validate, и для контроллера
export type ValidatedRequest<S extends Schemas> = Request<
	InferOr<S['params'], Request['params']>,
	unknown,
	InferOr<S['body'], unknown>,
	InferOr<S['query'], Request['query']>
>
