import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '../context/WalletContext'

export default function WalletButton({ onConnectClick }) {
  const { isConnected, shortAddress, balance, chainInfo, providerName, disconnect } = useWallet()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  if (!isConnected) {
    return (
      <motion.button
        onClick={onConnectClick}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer border-none"
        style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </svg>
        Connect Wallet
      </motion.button>
    )
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer border-none"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-h)' }}
        whileHover={{ borderColor: 'rgba(99,102,241,0.4)' }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="w-2 h-2 rounded-full bg-success" />
        <span className="font-mono text-xs">{shortAddress}</span>
        <span className="text-xs" style={{ color: 'var(--text-m)' }}>
          {parseFloat(balance || 0).toFixed(4)} {chainInfo.nativeSymbol}
        </span>
        <motion.svg
          className="w-3.5 h-3.5"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          style={{ color: 'var(--text-m)' }}
          animate={{ rotate: dropdownOpen ? 180 : 0 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {dropdownOpen && (
          <>
            {/* Click outside to close */}
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="absolute right-0 top-full mt-2 w-56 rounded-xl p-2 z-50"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}
            >
              <div className="px-3 py-2 mb-1">
                <p className="text-xs font-medium" style={{ color: 'var(--text-m)' }}>Connected with</p>
                <p className="text-sm font-semibold capitalize" style={{ color: 'var(--text-h)' }}>
                  {providerName === 'okx' ? 'OKX Wallet' : 'MetaMask'}
                </p>
              </div>
              <div style={{ borderTop: '1px solid var(--border)' }} className="pt-1">
                <motion.button
                  onClick={() => {
                    navigator.clipboard.writeText(shortAddress?.replace('...', '') || '')
                    setDropdownOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer border-none text-left"
                  style={{ background: 'transparent', color: 'var(--text-p)' }}
                  whileHover={{ background: 'var(--surface-2)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  Copy Address
                </motion.button>
                <motion.button
                  onClick={() => { disconnect(); setDropdownOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer border-none text-left"
                  style={{ background: 'transparent', color: '#ef4444' }}
                  whileHover={{ background: 'rgba(239,68,68,0.1)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  Disconnect
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
