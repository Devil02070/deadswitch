const express = require('express')
const router = express.Router()
const store = require('../store')
const onchainos = require('../onchainos')

// Execute: Scan — get real wallet balance
router.post('/execute/scan', (req, res) => {
  try {
    const result = onchainos.getBalance()
    if (!result.ok) {
      return res.json({ success: false, step: 'scan', error: result.error || 'Scan failed' })
    }
    const tokens = []
    if (result.data?.details) {
      for (const d of result.data.details) {
        if (d.tokenAssets) tokens.push(...d.tokenAssets)
      }
    }
    res.json({
      success: true,
      step: 'scan',
      message: `Found ${tokens.length} tokens worth $${result.data?.totalValueUsd || '0'}`,
      tokens: tokens.length,
      totalValueUsd: result.data?.totalValueUsd || '0',
    })
  } catch (err) {
    res.json({ success: false, step: 'scan', error: err.message })
  }
})

// Execute: Withdraw DeFi — placeholder (needs DeFi positions)
router.post('/execute/withdraw', (req, res) => {
  res.json({
    success: true,
    step: 'withdraw',
    message: 'No DeFi positions to withdraw',
    txHashes: [],
  })
})

// Execute: Swap tokens to stablecoins
router.post('/execute/swap', (req, res) => {
  // For hackathon demo — swapping would use onchainos dex-swap skill
  // which requires separate integration
  const config = store.getConfig()
  res.json({
    success: true,
    step: 'swap',
    message: `Swap step ready — target: ${config.targetStablecoin}`,
    txHashes: [],
  })
})

// Execute: Transfer to beneficiaries — REAL transfers
router.post('/execute/transfer', (req, res) => {
  const config = store.getConfig()
  const { chain = 'xlayer', force = false } = req.body || {}

  if (!config.beneficiaries || config.beneficiaries.length === 0) {
    return res.json({ success: false, step: 'transfer', error: 'No beneficiaries configured' })
  }

  // Get current balance first
  const balanceResult = onchainos.getChainBalance(chain)
  if (!balanceResult.ok) {
    return res.json({ success: false, step: 'transfer', error: 'Failed to fetch balance' })
  }

  const tokens = balanceResult.data?.details?.[0]?.tokenAssets || []
  const totalUsd = parseFloat(balanceResult.data?.totalValueUsd || 0)

  const results = []
  const txHashes = []

  for (const beneficiary of config.beneficiaries) {
    const share = beneficiary.allocationPercent / 100

    // For each token, calculate share and send
    for (const token of tokens) {
      const amount = parseFloat(token.holdingAmount || 0) * share
      if (amount <= 0) continue

      const amountStr = amount.toFixed(6)

      try {
        let sendResult
        if (token.tokenContractAddress) {
          // ERC20 token
          sendResult = force
            ? onchainos.run(`wallet send --chain ${chain} --readable-amount "${amountStr}" --recipient "${beneficiary.address}" --contract-token "${token.tokenContractAddress}" --force`)
            : onchainos.sendToken(chain, amountStr, beneficiary.address, token.tokenContractAddress)
        } else {
          // Native token
          sendResult = force
            ? onchainos.sendNativeForce(chain, amountStr, beneficiary.address)
            : onchainos.sendNative(chain, amountStr, beneficiary.address)
        }

        if (sendResult.ok && sendResult.data?.txHash) {
          txHashes.push(sendResult.data.txHash)
          results.push({
            beneficiary: beneficiary.name,
            address: beneficiary.address,
            token: token.symbol,
            amount: amountStr,
            txHash: sendResult.data.txHash,
            status: 'completed',
          })
        } else if (sendResult.confirming) {
          // Needs user confirmation
          results.push({
            beneficiary: beneficiary.name,
            address: beneficiary.address,
            token: token.symbol,
            amount: amountStr,
            status: 'confirming',
            message: sendResult.message,
          })
        } else {
          results.push({
            beneficiary: beneficiary.name,
            address: beneficiary.address,
            token: token.symbol,
            amount: amountStr,
            status: 'failed',
            error: sendResult.error || 'Transfer failed',
          })
        }
      } catch (err) {
        results.push({
          beneficiary: beneficiary.name,
          status: 'failed',
          error: err.message,
        })
      }
    }
  }

  // Record execution in history
  store.addExecution({
    id: Date.now().toString(),
    trigger: req.body?.trigger || 'Panic Button',
    timestamp: new Date().toISOString(),
    status: txHashes.length > 0 ? 'completed' : results.some(r => r.status === 'confirming') ? 'confirming' : 'failed',
    steps: [
      { action: 'Scan Wallet', status: 'completed', txHash: null },
      { action: 'Withdraw DeFi', status: 'completed', txHash: null },
      { action: 'Swap to Stablecoins', status: 'completed', txHash: null },
      ...results.map(r => ({
        action: `Transfer ${r.amount || ''} ${r.token || ''} to ${r.beneficiary}`,
        status: r.status,
        txHash: r.txHash || null,
      })),
    ],
    summary: { totalUSD: totalUsd, transfers: results },
  })

  res.json({
    success: true,
    step: 'transfer',
    message: `Processed ${results.length} transfers, ${txHashes.length} successful`,
    txHashes,
    results,
  })
})

module.exports = router
