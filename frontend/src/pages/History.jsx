import { motion } from 'framer-motion'
import { useApi } from '../hooks/useApi'

export default function History() {
  const { data, loading } = useApi('/history')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} />
      </div>
    )
  }

  const history = data?.executions || []

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: 'var(--text-h)' }}>History</h2>
        <p className="text-[10px] font-mono uppercase tracking-[0.15em] mt-1" style={{ color: 'var(--text-m)' }}>Emergency protocol execution log</p>
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
          <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--text-p)' }}>No executions yet</h3>
          <p className="text-sm" style={{ color: 'var(--text-m)' }}>
            When the emergency protocol triggers, execution details and TX hashes will appear here.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {history.map((exec, i) => (
            <motion.div
              key={i}
              className="p-6"
              style={{ border: '1px solid var(--border)', background: 'var(--card-bg)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 ${exec.status === 'completed' ? 'bg-success' : exec.status === 'failed' ? 'bg-danger' : 'bg-warning animate-pulse'}`} />
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-h)' }}>{exec.trigger}</h3>
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
                      <a
                        href={`https://www.okx.com/web3/explorer/xlayer-test/tx/${step.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono no-underline hover:underline"
                        style={{ color: '#FF2D20' }}
                      >
                        {step.txHash.slice(0, 10)}...{step.txHash.slice(-6)}
                      </a>
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
          ))}
        </div>
      )}
    </motion.div>
  )
}
