const express = require('express')
const router = express.Router()
const store = require('../store')
const onchainos = require('../onchainos')

// Get execution history — combines local + on-chain history
router.get('/history', (req, res) => {
  const localHistory = store.getHistory()

  // Also try to fetch on-chain TX history
  try {
    const chainHistory = onchainos.getHistory('xlayer')
    if (chainHistory.ok && chainHistory.data?.transactionList) {
      localHistory.onChainTxs = chainHistory.data.transactionList.map(tx => ({
        txHash: tx.txHash,
        from: tx.from,
        to: tx.to,
        value: tx.amount,
        symbol: tx.symbol,
        status: tx.txStatus === '1' ? 'completed' : 'pending',
        timestamp: tx.transactionTime,
        chain: 'X Layer Testnet',
      }))
    }
  } catch {
    // On-chain history fetch failed — still return local history
  }

  res.json(localHistory)
})

module.exports = router
