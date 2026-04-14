import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '../../context/WalletContext'
import ThemeToggle from './ThemeToggle'
import Logo from '../Logo'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Security', href: '#security' },
]

export default function Navbar({ onLaunchApp, onConnectWallet }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isConnected } = useWallet()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <motion.div
        className="mx-auto px-6 py-4"
        animate={{
          maxWidth: scrolled ? '100%' : '80rem',
          backgroundColor: scrolled ? 'var(--glass)' : 'rgba(0,0,0,0)',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'blur(0px)',
        }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="flex items-center justify-between">
          <motion.a
            href="#"
            className="flex items-center gap-2.5 no-underline"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Logo size={42} />
            <span className="text-sm font-black uppercase tracking-wide" style={{ color: 'var(--text-h)' }}>
              Heir<span style={{ color: '#FF2D20' }}>loom</span>
            </span>
          </motion.a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="text-[11px] font-mono font-bold uppercase tracking-[0.15em] no-underline px-4 py-2 cursor-pointer"
                style={{ color: 'var(--text-h)', border: '1px solid var(--border)', boxShadow: '3px 3px 0px var(--border)', transform: 'translate(-1px, -1px)' }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ x: 0, y: 0, boxShadow: '3px 3px 0px #FF2D20', borderColor: '#FF2D20', color: '#FF2D20', transition: { duration: 0.1 } }}
                whileTap={{ x: 1, y: 1, boxShadow: '1px 1px 0px #FF2D20', transition: { duration: 0.05 } }}
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {isConnected ? (
              <motion.button
                onClick={onLaunchApp}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 text-[11px] font-mono font-bold uppercase tracking-wider text-white cursor-pointer"
                style={{ background: '#FF2D20', border: '1px solid #FF2D20', boxShadow: '3px 3px 0px #000', transform: 'translate(-2px, -2px)' }}
                whileHover={{ x: 0, y: 0, boxShadow: '3px 3px 0px #FF2D20' }}
                whileTap={{ x: 1, y: 1, boxShadow: '1px 1px 0px #FF2D20' }}
              >
                <span className="w-2 h-2 bg-success" />
                Dashboard
              </motion.button>
            ) : (
              <motion.button
                onClick={onConnectWallet}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 text-[11px] font-mono font-bold uppercase tracking-wider text-white cursor-pointer"
                style={{ background: '#FF2D20', border: '1px solid #FF2D20', boxShadow: '3px 3px 0px #000', transform: 'translate(-2px, -2px)' }}
                whileHover={{ x: 0, y: 0, boxShadow: '3px 3px 0px #FF2D20' }}
                whileTap={{ x: 1, y: 1, boxShadow: '1px 1px 0px #FF2D20' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Connect
              </motion.button>
            )}

            <button
              className="md:hidden flex flex-col gap-1.5 cursor-pointer p-1 bg-transparent border-none"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <motion.span className="w-6 h-0.5 block" style={{ background: 'var(--text-h)' }} animate={mobileOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }} />
              <motion.span className="w-6 h-0.5 block" style={{ background: 'var(--text-h)' }} animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }} />
              <motion.span className="w-6 h-0.5 block" style={{ background: 'var(--text-h)' }} animate={mobileOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden mt-4"
            >
              <div className="flex flex-col gap-3 pb-4" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                {navLinks.map(link => (
                  <a key={link.href} href={link.href} className="text-xs font-mono font-bold uppercase tracking-wider py-2 no-underline" style={{ color: 'var(--text-p)' }} onClick={() => setMobileOpen(false)}>
                    {link.label}
                  </a>
                ))}
                <button
                  onClick={() => { setMobileOpen(false); isConnected ? onLaunchApp() : onConnectWallet() }}
                  className="mt-2 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white cursor-pointer border-none"
                  style={{ background: '#FF2D20' }}
                >
                  {isConnected ? 'Open Dashboard' : 'Connect Wallet'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.nav>
  )
}
