import { motion } from 'framer-motion'
import { useApi } from '../hooks/useApi'
import { useWallet } from '../context/WalletContext'
import StatusCard from '../components/StatusCard'
import PanicButton from '../components/PanicButton'
import BeneficiaryList from '../components/BeneficiaryList'
import InactivityTimer from '../components/InactivityTimer'
import { PixelMoneyIcon, PixelChartIcon, PixelUsersIcon, PixelSwapIcon } from '../components/PixelIcons'

export default function Dashboard() {
  const {
    address, shortAddress, chainId, chainInfo,
    balance, nativePrice, nativeBalanceUSD,
    tokens, totalValueUSD,
    loading: walletLoading, txCount,
    switchToXLayerTestnet,
  } = useWallet()

  const { data: config, loading: configLoading } = useApi('/config')
  const { data: status, loading: statusLoading, refetch: refetchStatus } = useApi('/status')

  if (configLoading || statusLoading || walletLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
          <p className="text-sm" style={{ color: 'var(--text-m)' }}>Loading wallet data...</p>
        </div>
      </div>
    )
  }

  const statusData = status || { daysSinceActivity: 0, state: 'ACTIVE' }
  const configData = config || { beneficiaries: [], inactivityThresholdDays: 30 }

  // Build token list: native + ERC20s from real wallet
  const allTokens = []

  // Native currency
  if (parseFloat(balance || 0) > 0) {
    allTokens.push({
      symbol: chainInfo.nativeSymbol,
      name: chainInfo.nativeName,
      balance: parseFloat(balance).toFixed(6),
      priceUSD: nativePrice,
      valueUSD: nativeBalanceUSD,
      isNative: true,
    })
  }

  // ERC20 tokens from wallet scan
  tokens.forEach(t => {
    allTokens.push({
      symbol: t.symbol,
      name: t.name,
      balance: parseFloat(t.balance).toFixed(6),
      priceUSD: t.priceUSD,
      valueUSD: t.valueUSD,
      address: t.address,
    })
  })

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: 'var(--text-h)' }}>Dashboard</h2>
          <p className="text-[10px] font-mono uppercase tracking-[0.15em] mt-1" style={{ color: 'var(--text-m)' }}>Real-time data from your connected wallet</p>
        </div>
        {address && (
          <div className="flex items-center gap-2 px-4 py-2" style={{ border: '1px solid var(--border)' }}>
            <span className="w-2 h-2 bg-success" />
            <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--text-p)' }}>{shortAddress}</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5" style={{ border: '1px solid var(--border)', color: 'var(--text-m)' }}>
              {chainInfo.name}
            </span>
          </div>
        )}
      </div>

      {/* Wrong network warning */}
      {address && chainId && chainId !== 195 && (
        <motion.div
          className="flex items-center justify-between p-4"
          style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          <p className="text-sm font-medium" style={{ color: '#eab308' }}>
            Wrong network — you're on {chainInfo.name}. Switch to X Layer Testnet to see your assets.
          </p>
          <button
            onClick={switchToXLayerTestnet}
            className="px-3 py-1.5 text-xs font-bold uppercase cursor-pointer border-none"
            style={{ background: '#eab308', color: '#000' }}
          >
            Switch Network
          </button>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Total Value"
          value={`$${totalValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${allTokens.length} asset${allTokens.length !== 1 ? 's' : ''} in wallet`}
          variant="default"
          icon={<PixelMoneyIcon size={20} color="var(--text-p)" />}
        />
        <StatusCard
          title={chainInfo.nativeSymbol}
          value={`${parseFloat(balance || 0).toFixed(4)}`}
          subtitle={`$${nativeBalanceUSD.toFixed(2)} @ $${nativePrice.toLocaleString()}`}
          variant="default"
          icon={<PixelChartIcon size={20} color="var(--text-p)" />}
        />
        <StatusCard
          title="Beneficiaries"
          value={configData.beneficiaries.length}
          subtitle={configData.beneficiaries.length > 0 ? 'Configured' : 'Not configured yet'}
          variant={configData.beneficiaries.length > 0 ? 'success' : 'warning'}
          icon={<PixelUsersIcon size={20} color="var(--text-p)" />}
        />
        <StatusCard
          title="Transactions"
          value={txCount !== null ? txCount : '--'}
          subtitle={txCount !== null ? 'Total TX count (nonce)' : 'Loading...'}
          variant="default"
          icon={<PixelSwapIcon size={20} color="var(--text-p)" />}
        />
      </div>

      {/* Inactivity Timer */}
      <InactivityTimer
        daysSince={statusData.daysSinceActivity}
        threshold={configData.inactivityThresholdDays}
        status={statusData.state}
      />

      {/* Panic + Beneficiaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PanicButton onTriggered={refetchStatus} />
        <BeneficiaryList beneficiaries={configData.beneficiaries} />
      </div>

      {/* Wallet Holdings — real data only */}
      <div className="p-6" style={{ border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-h)' }}>Wallet Holdings</h3>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.1em] px-2 py-1 flex items-center gap-1.5" style={{ border: '1px solid #22C55E', color: '#22C55E' }}>
            <span className="w-1.5 h-1.5 bg-success" />
            LIVE
          </span>
        </div>

        {allTokens.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--surface-3)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--text-m)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-p)' }}>No assets found</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-m)' }}>
              Your wallet on {chainInfo.name} appears to be empty.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left text-xs font-medium pb-3 pr-4" style={{ color: 'var(--text-m)' }}>Asset</th>
                  <th className="text-right text-xs font-medium pb-3 pr-4" style={{ color: 'var(--text-m)' }}>Price</th>
                  <th className="text-right text-xs font-medium pb-3 pr-4" style={{ color: 'var(--text-m)' }}>Balance</th>
                  <th className="text-right text-xs font-medium pb-3" style={{ color: 'var(--text-m)' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {allTokens.map((token, i) => (
                  <motion.tr
                    key={token.symbol + i}
                    style={{ borderBottom: '1px solid var(--surface-3)' }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ backgroundColor: 'var(--surface-2)' }}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 flex items-center justify-center text-xs font-black font-mono"
                          style={{
                            background: token.isNative ? '#FF2D20' : 'var(--surface-3)',
                            color: token.isNative ? '#fff' : 'var(--text-h)',
                          }}
                        >
                          {token.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase" style={{ color: 'var(--text-h)' }}>
                            {token.symbol}
                            {token.isNative && (
                              <span className="ml-1.5 text-[9px] font-mono px-1.5 py-0.5" style={{ border: '1px solid #FF2D20', color: '#FF2D20' }}>
                                NATIVE
                              </span>
                            )}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-m)' }}>{token.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right text-sm py-3 pr-4 font-mono" style={{ color: 'var(--text-m)' }}>
                      ${token.priceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="text-right text-sm py-3 pr-4 font-mono" style={{ color: 'var(--text-p)' }}>
                      {parseFloat(token.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </td>
                    <td className="text-right text-sm py-3 font-semibold" style={{ color: 'var(--text-h)' }}>
                      ${token.valueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1px solid var(--border)' }}>
                  <td colSpan={3} className="text-right text-sm font-semibold py-3 pr-4" style={{ color: 'var(--text-p)' }}>
                    Total
                  </td>
                  <td className="text-right text-base font-bold py-3" style={{ color: 'var(--text-h)' }}>
                    ${totalValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  )
}
