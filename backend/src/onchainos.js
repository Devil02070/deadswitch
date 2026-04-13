const { execSync } = require('child_process')
const path = require('path')

// onchainos binary path
const BIN = process.env.ONCHAINOS_BIN || path.join(process.env.USERPROFILE || process.env.HOME, '.local', 'bin', 'onchainos')

function run(command) {
  try {
    const result = execSync(`"${BIN}" ${command}`, {
      encoding: 'utf-8',
      timeout: 30000,
      env: { ...process.env, PATH: `${path.dirname(BIN)}${path.delimiter}${process.env.PATH}` },
    })
    const parsed = JSON.parse(result)
    return parsed
  } catch (err) {
    const stderr = err.stderr?.toString() || ''
    const stdout = err.stdout?.toString() || ''
    // Try to parse stdout even on error (exit code 2 = confirming)
    try {
      return JSON.parse(stdout)
    } catch {
      return { ok: false, error: stderr || stdout || err.message }
    }
  }
}

// Get wallet status
function getStatus() {
  return run('wallet status')
}

// Get balance for all chains
function getBalance() {
  return run('wallet balance')
}

// Get balance for specific chain
function getChainBalance(chain) {
  return run(`wallet balance --chain ${chain}`)
}

// Get wallet addresses
function getAddresses() {
  return run('wallet addresses')
}

// Send native token
function sendNative(chain, amount, recipient) {
  return run(`wallet send --chain ${chain} --readable-amount "${amount}" --recipient "${recipient}"`)
}

// Send native token with force (after confirmation)
function sendNativeForce(chain, amount, recipient) {
  return run(`wallet send --chain ${chain} --readable-amount "${amount}" --recipient "${recipient}" --force`)
}

// Send ERC20 token
function sendToken(chain, amount, recipient, contractToken) {
  return run(`wallet send --chain ${chain} --readable-amount "${amount}" --recipient "${recipient}" --contract-token "${contractToken}"`)
}

// Get transaction history
function getHistory(chain) {
  if (chain) {
    return run(`wallet history --chain ${chain}`)
  }
  return run('wallet history')
}

// Get specific TX details
function getTxDetail(txHash, chain, address) {
  return run(`wallet history --tx-hash "${txHash}" --chain ${chain} --address "${address}"`)
}

module.exports = {
  run,
  getStatus,
  getBalance,
  getChainBalance,
  getAddresses,
  sendNative,
  sendNativeForce,
  sendToken,
  getHistory,
  getTxDetail,
}
