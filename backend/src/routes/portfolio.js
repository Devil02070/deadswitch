const express = require('express')
const router = express.Router()
const onchainos = require('../onchainos')
const store = require('../store')

// Get portfolio — real data from onchainos wallet
router.get('/portfolio', async (req, res) => {
  try {
    const result = onchainos.getBalance()

    if (!result.ok) {
      // Fallback to stored portfolio if onchainos fails
      return res.json(store.getPortfolio())
    }

    const data = result.data
    const tokens = []
    let totalValueUsd = 0

    // Parse token assets from onchainos response
    if (data.details) {
      for (const detail of data.details) {
        if (detail.tokenAssets) {
          for (const token of detail.tokenAssets) {
            tokens.push({
              symbol: token.symbol || 'Unknown',
              name: token.tokenName || token.symbol || 'Unknown',
              balance: token.holdingAmount || '0',
              valueUSD: token.valueUsd || '0',
              priceUSD: token.tokenPrice || '0',
              chainName: token.chainName || '',
              chainIndex: token.chainIndex || '',
              tokenAddress: token.tokenContractAddress || '',
              isNative: !token.tokenContractAddress,
            })
            totalValueUsd += parseFloat(token.valueUsd || 0)
          }
        }
      }
    }

    const portfolio = {
      totalValueUSD: totalValueUsd || parseFloat(data.totalValueUsd || 0),
      tokens,
      evmAddress: data.evmAddress || '',
      solAddress: data.solAddress || '',
      defiPositions: [],
    }

    // Save to store for offline access
    store.savePortfolio(portfolio)

    res.json(portfolio)
  } catch (err) {
    console.error('Portfolio fetch error:', err)
    res.json(store.getPortfolio())
  }
})

// Get balance for specific chain
router.get('/portfolio/:chain', (req, res) => {
  try {
    const result = onchainos.getChainBalance(req.params.chain)
    res.json(result.ok ? result.data : { error: 'Failed to fetch chain balance' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
