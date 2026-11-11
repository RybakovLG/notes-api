import z from "zod";

export const noteSchema = z.object({
    text: z.string().trim().min(1, 'Текст заметки обязателен'),
    id: z.uuid()
})

export type Note = z.infer<typeof noteSchema>

export const createNoteSchema = noteSchema.pick({
    text: true
})

export type CreateNote = z.infer<typeof createNoteSchema>