const express = require('express')
const router = express.Router()
const store = require('../store')
const onchainos = require('../onchainos')

// Get monitoring status — checks real wallet activity
router.get('/status', (req, res) => {
  try {
    // Try to get last TX from on-chain history
    const historyResult = onchainos.getHistory('xlayer')

    let lastActivityTimestamp = null
    if (historyResult.ok && historyResult.data?.transactionList?.length > 0) {
      // Most recent TX timestamp (in ms)
      const latestTx = historyResult.data.transactionList[0]
      lastActivityTimestamp = new Date(parseInt(latestTx.transactionTime)).toISOString()
    }

    // Fall back to stored status if no on-chain activity found
    if (!lastActivityTimestamp) {
      const stored = store.getStatus()
      lastActivityTimestamp = stored.lastActivityTimestamp
    }

    const lastActivity = new Date(lastActivityTimestamp)
    const now = new Date()
    const daysSince = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24))
    const config = store.getConfig()
    const threshold = config.inactivityThresholdDays || 30

    let state = 'ACTIVE'
    if (daysSince >= threshold) state = 'TRIGGERED'
    else if (daysSince >= threshold * 0.7) state = 'WARNING'

    res.json({
      lastActivityTimestamp,
      daysSinceActivity: daysSince,
      state,
      threshold,
    })
  } catch (err) {
    // Fallback to stored status
    res.json(store.getStatus())
  }
})

// Manually update activity timestamp
router.post('/status/activity', (req, res) => {
  store.saveStatus({ lastActivityTimestamp: new Date().toISOString() })
  res.json({ success: true, message: 'Activity timestamp updated' })
})

module.exports = router
