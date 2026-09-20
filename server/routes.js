import { Router } from 'express'
import { accessibilityRouter } from './routes/accessibility.js'
import { settingsRouter } from './routes/settings.js'

const router = Router()

router.use('/accessibility', accessibilityRouter)
router.use('/settings', settingsRouter)

export const routes = router
