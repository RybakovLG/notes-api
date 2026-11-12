import path from 'node:path'
import z from 'zod'

const projectRoot = path.resolve(import.meta.dirname, '..')

const envSchema = z.object({
	PORT: z.preprocess(
		(val) => (val === undefined || val === '' ? undefined : Number(val)),
		z
			.number({
				error: (err) =>
					err.input === undefined ? 'PORT обязателен' : 'ошибка преобразования PORT в число',
			})
			.int()
			.min(1)
			.max(65535),
	),
	NOTES_PATH: z
		.string()
		.endsWith('.json')
		.min(6)
		.transform((arg) => path.resolve(projectRoot, arg)),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
	console.error('Неверная конфигурация ENV', z.prettifyError(parsed.error))
	process.exit(1)
}

export const env = parsed.data
