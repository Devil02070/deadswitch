const express = require('express')
const router = express.Router()
const onchainos = require('../onchainos')

// Get agentic wallet info
router.get('/wallet', (req, res) => {
  try {
    const status = onchainos.getStatus()
    const addresses = onchainos.getAddresses()

    if (!status.ok || !addresses.ok) {
      return res.json({ ok: false, error: 'Wallet not connected', loggedIn: false })
    }

    const data = addresses.data
    const xlayerAddr = data.xlayer?.[0]?.address || data.evm?.[0]?.address || ''
    const evmAddr = data.evm?.[0]?.address || ''
    const solAddr = data.solana?.[0]?.address || ''

    res.json({
      ok: true,
      loggedIn: status.data.loggedIn,
      accountName: status.data.currentAccountName,
      email: status.data.email,
      xlayerAddress: xlayerAddr,
      evmAddress: evmAddr,
      solanaAddress: solAddr,
      policy: status.data.policy,
    })
  } catch (err) {
    res.json({ ok: false, error: err.message, loggedIn: false })
  }
})

// Get balance for a specific chain
router.get('/wallet/balance/:chain', (req, res) => {
  try {
    const result = onchainos.getChainBalance(req.params.chain)
    res.json(result)
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

module.exports = router
