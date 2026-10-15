import express from 'express'
import cors from 'cors'
import { logger } from './utils/logger.js'
import { errorHandler } from './middleware/error.js'
import { routes } from './routes.js'

const app = express()

app.use(
  cors({
    origin: process.env.ZSR_SERVER_ORIGIN || 'http://localhost',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: true, limit: '100kb' }))

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`)
  next()
})

app.use('/api', routes)
app.use(errorHandler)

export default app
