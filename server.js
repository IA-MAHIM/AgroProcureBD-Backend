import app from './src/app.js'
import { env } from './src/config/env.js'
import { pool } from './src/config/db.js'

async function startServer() {
  try {
    await pool.query('SELECT NOW()')
    console.log('Database connected successfully')

    app.listen(env.PORT, () => {
      console.log(`AgroProcureBD backend running on port ${env.PORT}`)
    })
  } catch (error) {
    console.error('Server failed to start:', error.message)
    process.exit(1)
  }
}

startServer()
