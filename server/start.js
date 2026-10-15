import app from './index.js'
import { logger } from './utils/logger.js'

const PORT = Number(process.env.PORT) || 3000
// Local only: the API has no authentication, so it is not offered to the network.
const HOST = process.env.ZSR_SERVER_HOST || '127.0.0.1'

app.listen(PORT, HOST, () => {
  logger.info(`ZSR server listening on http://${HOST}:${PORT}`)
})
