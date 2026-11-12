import { app } from './app.ts'
import { env } from './config.ts'

app.listen(env.PORT, () => {
	console.log(`server started on http://localhost:${env.PORT}`)
})
