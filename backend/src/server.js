const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const configRoutes = require('./routes/config')
const statusRoutes = require('./routes/status')
const portfolioRoutes = require('./routes/portfolio')
const executeRoutes = require('./routes/execute')
const historyRoutes = require('./routes/history')
const walletRoutes = require('./routes/wallet')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Data directory
const dataDir = path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

// API Routes
app.use('/api', configRoutes)
app.use('/api', statusRoutes)
app.use('/api', portfolioRoutes)
app.use('/api', executeRoutes)
app.use('/api', historyRoutes)
app.use('/api', walletRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', agent: 'DeadSwitch', version: '1.0.0' })
})

// Serve frontend build in production
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist')
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist))
  // SPA fallback — serve index.html for all non-API routes
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api') && req.method === 'GET') {
      res.sendFile(path.join(frontendDist, 'index.html'))
    } else {
      next()
    }
  })
}

app.listen(PORT, () => {
  console.log(`DeadSwitch running on port ${PORT}`)
})
