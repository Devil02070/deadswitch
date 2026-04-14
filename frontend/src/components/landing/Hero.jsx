import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '../../context/WalletContext'
import PixelBlast from '../PixelBlast'
import gsap from 'gsap'

export default function Hero({ onLaunchApp, onConnectWallet }) {
  const { isConnected } = useWallet()
  const headingRef = useRef(null)

  useEffect(() => {
    const chars = headingRef.current?.querySelectorAll('.char')
    if (chars?.length) {
      gsap.fromTo(chars,
        { opacity: 0, y: 100, rotateX: -90 },
        {
          opacity: 1, y: 0, rotateX: 0,
          stagger: 0.025,
          duration: 1,
          ease: 'power4.out',
          delay: 0.4,
        }
      )
    }
  }, [])

  const splitText = (text) =>
    text.split('').map((char, i) => (
      <span key={i} className="char inline-block" style={{ perspective: '500px' }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* PixelBlast WebGL Background */}
      <div className="absolute inset-0 z-0">
        <PixelBlast
          variant="square"
          pixelSize={6}
          color="#FF2D20"
          speed={0.3}
          patternScale={2}
          patternDensity={0.8}
          edgeFade={0.4}
          enableRipples={true}
          rippleSpeed={0.3}
          rippleThickness={0.12}
          rippleIntensityScale={1.2}
          transparent={true}
          antialias={true}
        />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 z-1 grid-bg opacity-40 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-28 pb-20">
        {/* Top label row */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-12"
          style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}
        >
          <span className="text-xs font-mono uppercase tracking-[0.2em]" style={{ color: 'var(--text-m)' }}>
            DeFi Inheritance Protocol
          </span>
          <span className="text-xs font-mono uppercase tracking-[0.2em]" style={{ color: 'var(--text-m)' }}>
            X Layer / OKX OnchainOS
          </span>
        </motion.div> */}

        {/* Massive heading — brand split across two lines */}
        <div ref={headingRef}>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[8rem] xl:text-[10rem] font-black uppercase leading-[0.85] tracking-[-0.04em] mb-0 overflow-hidden">
            <span className="block" style={{ color: 'var(--text-h)' }}>
              {splitText("HEIR")}
            </span>
            <span className="block" style={{ color: '#FF2D20' }}>
              {splitText("LOOM")}
            </span>
          </h1>
          <p
            className="mt-4 text-sm sm:text-base md:text-lg font-mono uppercase tracking-[0.3em]"
            style={{ color: 'var(--text-m)' }}
          >
            The on-chain will your wallet never had
          </p>
        </div>

        {/* Bottom section — two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
          {/* Left — description */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <p className="text-lg md:text-xl leading-relaxed mb-2" style={{ color: 'var(--text-p)' }}>
              <span style={{ color: '#FF2D20' }} className="font-bold">$140B+</span> in crypto is permanently lost.
            </p>
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-m)' }}>
              Your DeFi positions, LP tokens, and wallet assets — frozen forever when you can't access them.
              Heirloom monitors your wallet and executes your emergency plan automatically.
            </p>

            {/* Stats row */}
            <div className="flex gap-8 mt-8">
              {[
                { num: '$140B+', label: 'LOST FOREVER' },
                { num: '4M+', label: 'ABANDONED' },
                { num: '0', label: 'ON-CHAIN WILLS' },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 + i * 0.15 }}
                >
                  <p className="text-2xl md:text-3xl font-black" style={{ color: 'var(--text-h)' }}>{s.num}</p>
                  <p className="text-[10px] font-mono uppercase tracking-[0.15em] mt-1" style={{ color: 'var(--text-m)' }}>{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="flex flex-col justify-end"
          >
            <div className="flex flex-col gap-4">
              <motion.button
                onClick={isConnected ? onLaunchApp : onConnectWallet}
                className="group px-8 py-5 text-base font-bold uppercase tracking-wider cursor-pointer transition-all"
                style={{
                  background: '#FF2D20',
                  color: '#fff',
                  border: '1px solid #FF2D20',
                  boxShadow: '6px 6px 0px #000',
                  transform: 'translate(-3px, -3px)',
                }}
                whileHover={{ x: 0, y: 0, boxShadow: '6px 6px 0px #FF2D20', scale: 1.02 }}
                whileTap={{ scale: 0.98, x: 2, y: 2, boxShadow: '2px 2px 0px #FF2D20' }}
              >
                <span className="flex items-center justify-center gap-3">
                  {isConnected ? 'Open Dashboard' : 'Connect Wallet'}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </motion.button>

              <motion.a
                href="#how-it-works"
                className="group px-8 py-5 text-base font-bold uppercase tracking-wider cursor-pointer no-underline text-center transition-all"
                style={{
                  background: 'transparent',
                  color: 'var(--text-h)',
                  border: '1px solid var(--border-strong)',
                  boxShadow: '6px 6px 0px var(--border)',
                  transform: 'translate(-3px, -3px)',
                }}
                whileHover={{ x: 0, y: 0, boxShadow: '6px 6px 0px #FF2D20', borderColor: '#FF2D20' }}
                whileTap={{ x: 2, y: 2, boxShadow: '2px 2px 0px #FF2D20' }}
              >
                How It Works
              </motion.a>
            </div>

            <div className="flex items-center gap-6 mt-8">
              {['NON-CUSTODIAL', 'OPEN SOURCE', 'X LAYER'].map((label, i) => (
                <span key={i} className="text-[10px] font-mono uppercase tracking-[0.15em]" style={{ color: 'var(--text-m)' }}>
                  [{label}]
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: 'var(--text-m)' }}>Scroll</span>
          <svg className="w-4 h-4" style={{ color: 'var(--text-m)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}
