import z from "zod";

const noteCommonSchema = z.object({
    text: z.string().trim().min(1, 'Текст заметки обязателен'),
    id: z.uuid()
})

export const noteSchemaObj = {
    db: noteCommonSchema,
    create: {
        body: noteCommonSchema.pick({
            text: true
        })
    },
    getById: {
        params: noteCommonSchema.pick({
            id: true
        })
    }
}

export type Note = z.infer<typeof noteSchemaObj.db>
export type NoteBodyCreate = z.infer<typeof noteSchemaObj.create.body>
// export type NoteParamsGetById = z.infer<typeof noteSchemaObj.getById.params>
