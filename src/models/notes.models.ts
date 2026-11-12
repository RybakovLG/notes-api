import z from 'zod'

const noteCommonSchema = z.object({
	text: z.string().refine((val) => val.trim().length > 0, {
		error: 'Текст заметки должен содержать символы',
	}),
	id: z.uuid(),
})

export const noteSchemaObj = {
	db: noteCommonSchema,
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
}

export type Note = z.infer<typeof noteSchemaObj.db>
export type NoteBodyCreate = z.infer<typeof noteSchemaObj.create.body>
// export type NoteParamsGetById = z.infer<typeof noteSchemaObj.getById.params>
