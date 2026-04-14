import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useApi } from '../hooks/useApi'

// An execution is a demo if the trigger mentions "Demo" or the chain string has "(Demo)"
function isDemo(exec) {
  return /demo/i.test(exec.trigger || '') || /demo/i.test(exec.chain || '')
}

export default function History() {
  const { data, loading } = useApi('/history')
  const [filter, setFilter] = useState('all') // 'all' | 'live' | 'demo'

  const allHistory = data?.executions || []
  const counts = useMemo(() => {
    const demo = allHistory.filter(isDemo).length
    return { all: allHistory.length, demo, live: allHistory.length - demo }
  }, [allHistory])

  const history = useMemo(() => {
    if (filter === 'live') return allHistory.filter(e => !isDemo(e))
    if (filter === 'demo') return allHistory.filter(isDemo)
    return allHistory
  }, [allHistory, filter])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} />
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: 'var(--text-h)' }}>History</h2>
          <p className="text-[10px] font-mono uppercase tracking-[0.15em] mt-1" style={{ color: 'var(--text-m)' }}>Emergency protocol execution log</p>
        </div>
        {/* All / Live / Demo filter tabs */}
        <div className="flex p-0.5" style={{ border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          {[
            { id: 'all',  label: 'ALL',     color: '#FF2D20', count: counts.all },
            { id: 'live', label: '● LIVE',  color: '#FF2D20', count: counts.live },
            { id: 'demo', label: '▶ DEMO',  color: '#6366f1', count: counts.demo },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.12em] cursor-pointer border-none flex items-center gap-2"
              style={{
                background: filter === tab.id ? tab.color : 'transparent',
                color: filter === tab.id ? '#fff' : 'var(--text-m)',
              }}
            >
              {tab.label}
              <span
                className="text-[9px] px-1.5 py-0.5"
                style={{
                  background: filter === tab.id ? 'rgba(0,0,0,0.2)' : 'var(--surface-3)',
                  color: filter === tab.id ? '#fff' : 'var(--text-m)',
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {history.length === 0 ? (
        <motion.div
          className="p-12 text-center"
          style={{ border: '1px solid var(--border)', background: 'var(--card-bg)' }}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--surface-3)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--text-m)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--text-p)' }}>
            {filter === 'all' ? 'No executions yet' : `No ${filter} executions yet`}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-m)' }}>
            {filter === 'demo'
              ? 'Run the panic button in Demo mode to see simulated executions here.'
              : filter === 'live'
              ? 'Real panic liquidations with on-chain TX hashes will appear here.'
              : 'When the emergency protocol triggers, execution details and TX hashes will appear here.'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {history.map((exec, i) => {
            const demo = isDemo(exec)
            const accent = demo ? '#6366f1' : '#FF2D20'
            return (
              <motion.div
                key={exec.id || i}
                className="p-6"
                style={{ border: `1px solid ${demo ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`, background: 'var(--card-bg)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.4) }}
              >
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 ${exec.status === 'completed' ? 'bg-success' : exec.status === 'failed' ? 'bg-danger' : 'bg-warning animate-pulse'}`} />
                    <h3 className="text-base font-bold" style={{ color: 'var(--text-h)' }}>{exec.trigger}</h3>
                    <span
                      className="text-[9px] font-mono font-bold uppercase px-2 py-0.5"
                      style={{
                        border: `1px solid ${accent}`,
                        color: accent,
                        background: demo ? 'rgba(99,102,241,0.1)' : 'rgba(255,45,32,0.1)',
                      }}
                    >
                      {demo ? '▶ DEMO' : '● LIVE'}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-m)' }}>
                    {new Date(exec.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2">
                  {exec.steps.map((step, j) => (
                    <motion.div
                      key={j}
                      className="flex items-center justify-between p-3"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 flex items-center justify-center text-xs font-bold font-mono ${
                          step.status === 'completed' ? 'text-success' : step.status === 'failed' ? 'text-danger' : ''
                        }`} style={{ background: step.status === 'completed' ? 'rgba(0,255,136,0.1)' : step.status === 'failed' ? 'rgba(255,45,32,0.1)' : 'var(--surface-3)', color: step.status === 'completed' ? '#22C55E' : step.status === 'failed' ? '#FF2D20' : 'var(--text-m)' }}>
                          {step.status === 'completed' ? '\u2713' : step.status === 'failed' ? '\u2715' : j + 1}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--text-p)' }}>{step.action}</span>
                      </div>
                      {step.txHash && (
                        demo ? (
                          <span className="text-xs font-mono" style={{ color: '#6366f1' }} title="Demo hash — not a real on-chain TX">
                            {step.txHash.slice(0, 10)}...{step.txHash.slice(-6)}
                          </span>
                        ) : (
                          <a
                            href={`https://www.okx.com/web3/explorer/xlayer-test/tx/${step.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono no-underline hover:underline"
                            style={{ color: '#FF2D20' }}
                          >
                            {step.txHash.slice(0, 10)}...{step.txHash.slice(-6)}
                          </a>
                        )
                      )}
                    </motion.div>
                  ))}
                </div>

                {exec.summary && (
                  <div className="mt-4 pt-4 flex justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                    <span className="text-sm" style={{ color: 'var(--text-m)' }}>Total transferred</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-h)' }}>${exec.summary.totalUSD?.toLocaleString()}</span>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
