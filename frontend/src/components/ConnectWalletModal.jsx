import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '../context/WalletContext'

const walletOptions = [
  { id: 'okx', name: 'OKX WALLET', desc: 'Recommended — use X Layer Testnet' },
  { id: 'metamask', name: 'METAMASK', desc: 'Popular browser wallet' },
]

export default function ConnectWalletModal({ isOpen, onClose }) {
  const { connectWallet, connecting, error } = useWallet()

  const handleConnect = async (walletId) => {
    await connectWallet(walletId)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md p-8"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            {/* Close */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer"
              style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-m)' }}
              whileHover={{ borderColor: '#FF2D20', color: '#FF2D20' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Header */}
            <div className="mb-8">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] block mb-2" style={{ color: '#FF2D20' }}>[CONNECT]</span>
              <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: 'var(--text-h)' }}>
                Choose Wallet
              </h2>
              <p className="text-xs font-mono mt-2" style={{ color: 'var(--text-m)' }}>
                Select a wallet to get started with DeadSwitch
              </p>
            </div>

            {/* Wallet options */}
            <div className="space-y-3">
              {walletOptions.map((wallet, i) => (
                <motion.button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet.id)}
                  disabled={connecting}
                  className="w-full flex items-center justify-between p-4 cursor-pointer text-left disabled:opacity-50"
                  style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-h)' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0px var(--border-strong)', borderColor: 'var(--border-strong)' }}
                  whileTap={{ x: 0, y: 0 }}
                >
                  <div>
                    <p className="text-sm font-black uppercase tracking-wider">{wallet.name}</p>
                    <p className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-m)' }}>{wallet.desc}</p>
                  </div>
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-m)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </motion.button>
              ))}
            </div>

            {/* Loading */}
            <AnimatePresence>
              {connecting && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 flex items-center gap-2 py-3">
                  <motion.div className="w-3 h-3" style={{ background: '#FF2D20' }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
                  <span className="text-xs font-mono uppercase" style={{ color: 'var(--text-p)' }}>Connecting...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-3 text-xs font-mono" style={{ border: '1px solid #FF2D20', color: '#FF2D20' }}>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-[10px] font-mono text-center mt-6 uppercase tracking-wider" style={{ color: 'var(--text-m)' }}>
              No transactions without your approval
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
