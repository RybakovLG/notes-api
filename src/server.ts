import { app } from './app.ts'
import { env } from './config.ts'

const server = app.listen(env.PORT, () => {
	console.log(`server started on http://localhost:${env.PORT}`)
})

let isShuttingDown = false

;['SIGTERM', 'SIGINT'].forEach((signal) => {
	process.on(signal, () => handler(signal))
})

function handler(signal: string) {
	if (isShuttingDown) {
		console.log(`сигнал ${signal} срочно завершил процесс`)
		process.exit(1)
	}

	isShuttingDown = true
	console.log(`сигнал ${signal} начал завершение процесса`)

	console.log(
		'ожидание завершения активных запросов, процесс автоматически завершится через 10 секунд',
	)
	server.close(() => {
		console.log('активные запросы завершены')

		console.log('завершение процесса')
		process.exit(0)
	})

	setTimeout(() => {
		console.log('процесс завершился автоматически')
		process.exit(1)
	}, 10_000)
}
