import { Router } from 'express'
import { logger } from '../../lib/utils/logger'
import AccessibilityManager from '../../lib/accessibility'

const router = Router()

router.post('/speak', async (req, res) => {
  try {
    const { text, options } = req.body
    await AccessibilityManager.speak(text, options)
    res.json({ success: true })
  } catch (error) {
    logger.error('Speak request failed:', error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/feedback', async (req, res) => {
  try {
    const { type } = req.body
    await AccessibilityManager.provideFeedback(type)
    res.json({ success: true })
  } catch (error) {
    logger.error('Feedback request failed:', error)
    res.status(500).json({ error: error.message })
  }
})

export const accessibilityRouter = router
