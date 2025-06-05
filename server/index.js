import express from 'express'
import cors from 'cors'
import { logger } from '../lib/utils/logger'
import { errorHandler } from './middleware/error'
import { routes } from './routes'

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`)
  next()
})

app.use('/api', routes)
app.use(errorHandler)

export default app
