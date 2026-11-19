import z from 'zod'
import type { Schemas } from '#http/request.ts'
import { QUERY_DEFAULTS } from '#services/note.service.ts'

const noteCommonSchema = z.object({
	text: z.string().refine((val) => val.trim().length > 0, {
		error: 'Текст заметки должен содержать символы',
	}),
	id: z.uuid(),
})

export const noteSchemaObj = {
	db: noteCommonSchema,
	getAll: {
		query: z.object({
			limit: z.coerce.number().int().min(1).max(100).default(QUERY_DEFAULTS.notes.limit),
			offset: z.coerce.number().int().min(0).default(QUERY_DEFAULTS.notes.offset),
		}),
	},
	create: {
		body: noteCommonSchema.pick({
			text: true,
		}),
	},
	getById: {
		params: noteCommonSchema.pick({
			id: true,
		}),
	},
	put: {
		params: noteCommonSchema.pick({
			id: true,
		}),
		body: noteCommonSchema.pick({
			text: true,
		}),
	},
	delete: {
		params: noteCommonSchema.pick({
			id: true,
		}),
	},
} satisfies Record<string, Schemas | z.ZodObject>

export type Note = z.infer<typeof noteSchemaObj.db>
export type NoteBodyCreate = z.infer<typeof noteSchemaObj.create.body>
export type NoteGetAllQuery = z.infer<typeof noteSchemaObj.getAll.query>

// export type NoteParamsGetById = z.infer<typeof noteSchemaObj.getById.params>
