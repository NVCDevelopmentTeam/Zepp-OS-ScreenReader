import { Router } from 'express'
import { logger } from '../../lib/utils/logger'
import { settingsManager } from '../../setting/utils'

const router = Router()

router.get('/capabilities', async (req, res) => {
  try {
    const device = await settingsManager.validateDevice()
    res.json(device)
  } catch (error) {
    logger.error('Capabilities request failed:', error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/update', async (req, res) => {
  try {
    const { setting, value } = req.body
    const [success] = await settingsManager.handleSettingChange(
      () => settingsManager[setting](value),
      value,
      setting
    )
    res.json({ success })
  } catch (error) {
    logger.error('Settings update failed:', error)
    res.status(500).json({ error: error.message })
  }
})

export const settingsRouter = router
