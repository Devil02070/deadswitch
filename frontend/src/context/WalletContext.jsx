import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { BrowserProvider, formatEther, formatUnits, Contract } from 'ethers'

const WalletContext = createContext()

// ERC20 minimal ABI
const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function decimals() view returns (uint8)',
  'function transfer(address to, uint256 amount) returns (bool)',
]

// Known tokens per chain — scan these for balances
const KNOWN_TOKENS = {
  1: [ // Ethereum mainnet
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', decimals: 6 },
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', decimals: 6 },
    { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', decimals: 8 },
    { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', decimals: 18 },
    { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', symbol: 'LINK', decimals: 18 },
    { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', decimals: 18 },
  ],
  195: [ // X Layer testnet — native OKB only, no known ERC20 contracts on testnet
  ],
  196: [ // X Layer mainnet
    { address: '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035', symbol: 'USDC', decimals: 6 },
    { address: '0x1E4a5963aBFD975d8c9021ce480b42188849D41d', symbol: 'USDT', decimals: 6 },
    { address: '0xe538905cf8410324e03A5A23C1c177a474D59b2b', symbol: 'OKB', decimals: 18 },
    { address: '0x5A77f1443D16ee5761d310e38b62f77f726bC71c', symbol: 'WETH', decimals: 18 },
  ],
  11155111: [ // Sepolia testnet
    { address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', symbol: 'USDC', decimals: 6 },
    { address: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06', symbol: 'USDT', decimals: 6 },
  ],
  137: [ // Polygon
    { address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', symbol: 'USDC', decimals: 6 },
    { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT', decimals: 6 },
    { address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', symbol: 'WETH', decimals: 18 },
  ],
  56: [ // BSC
    { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC', decimals: 18 },
    { address: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT', decimals: 18 },
  ],
}

// Chain native currency info
const CHAIN_INFO = {
  1:        { name: 'Ethereum', nativeSymbol: 'ETH', nativeName: 'Ethereum' },
  5:        { name: 'Goerli', nativeSymbol: 'ETH', nativeName: 'Ethereum' },
  11155111: { name: 'Sepolia', nativeSymbol: 'ETH', nativeName: 'Ethereum' },
  137:      { name: 'Polygon', nativeSymbol: 'MATIC', nativeName: 'Polygon' },
  56:       { name: 'BSC', nativeSymbol: 'BNB', nativeName: 'BNB' },
  195:      { name: 'X Layer Testnet', nativeSymbol: 'OKB', nativeName: 'OKB' },
  196:      { name: 'X Layer', nativeSymbol: 'OKB', nativeName: 'OKB' },
  42161:    { name: 'Arbitrum', nativeSymbol: 'ETH', nativeName: 'Ethereum' },
  10:       { name: 'Optimism', nativeSymbol: 'ETH', nativeName: 'Ethereum' },
  8453:     { name: 'Base', nativeSymbol: 'ETH', nativeName: 'Ethereum' },
}

// Fetch real USD prices from CoinGecko (free, no API key)
async function fetchPrices() {
  try {
    const ids = 'ethereum,bitcoin,matic-network,binancecoin,okb,chainlink,uniswap,dai'
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
    )
    if (!res.ok) throw new Error('Price fetch failed')
    const data = await res.json()
    return {
      ETH:   data.ethereum?.usd || 0,
      WETH:  data.ethereum?.usd || 0,
      WBTC:  data.bitcoin?.usd || 0,
      MATIC: data['matic-network']?.usd || 0,
      BNB:   data.binancecoin?.usd || 0,
      OKB:   data.okb?.usd || 0,
      LINK:  data.chainlink?.usd || 0,
      UNI:   data.uniswap?.usd || 0,
      DAI:   data.dai?.usd || 1,
      USDC:  1,
      USDT:  1,
    }
  } catch {
    // Fallback prices if API is down
    return { ETH: 3500, WETH: 3500, WBTC: 100000, MATIC: 0.5, BNB: 600, OKB: 50, LINK: 15, UNI: 10, DAI: 1, USDC: 1, USDT: 1 }
  }
}

const WALLET_PROVIDERS = {
  okx: {
    name: 'OKX Wallet',
    getProvider: () => window.okxwallet,
    downloadUrl: 'https://www.okx.com/web3',
  },
  metamask: {
    name: 'MetaMask',
    getProvider: () => {
      if (window.ethereum?.isMetaMask) return window.ethereum
      if (window.ethereum?.providers) return window.ethereum.providers.find(p => p.isMetaMask)
      return null
    },
    downloadUrl: 'https://metamask.io/download/',
  },
}

// X Layer Testnet network config for wallet_addEthereumChain
const XLAYER_TESTNET = {
  chainId: '0xC3', // 195
  chainName: 'X Layer Testnet',
  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
  rpcUrls: ['https://testrpc.xlayer.tech'],
  blockExplorerUrls: ['https://www.okx.com/web3/explorer/xlayer-test'],
}

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [balance, setBalance] = useState(null) // raw native balance string
  const [tokens, setTokens] = useState([]) // { symbol, name, balance, decimals, address, priceUSD, valueUSD }
  const [nativePrice, setNativePrice] = useState(0)
  const [prices, setPrices] = useState({})
  const [providerName, setProviderName] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [txCount, setTxCount] = useState(null)
  const providerRef = useRef(null) // avoid stale closure in refreshBalances

  // Keep providerRef in sync
  useEffect(() => { providerRef.current = provider }, [provider])

  // Reconnect on page load
  useEffect(() => {
    const saved = localStorage.getItem('deadswitch-wallet-provider')
    if (saved && WALLET_PROVIDERS[saved]) {
      const raw = WALLET_PROVIDERS[saved].getProvider()
      if (raw) connectWallet(saved, true)
    }
  }, [])

  // Listen for account/chain changes
  useEffect(() => {
    const raw = providerName ? WALLET_PROVIDERS[providerName]?.getProvider() : null
    if (!raw) return

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        setAddress(accounts[0])
        refreshBalances(accounts[0])
      }
    }

    const handleChainChanged = () => {
      // Full refresh on chain change — provider might change too
      window.location.reload()
    }

    raw.on('accountsChanged', handleAccountsChanged)
    raw.on('chainChanged', handleChainChanged)

    return () => {
      raw.removeListener('accountsChanged', handleAccountsChanged)
      raw.removeListener('chainChanged', handleChainChanged)
    }
  }, [providerName, address])

  const refreshBalances = useCallback(async (addr) => {
    const prov = providerRef.current
    if (!prov || !addr) return

    setLoading(true)
    try {
      // Fetch in parallel — use allSettled so one failure doesn't kill everything
      const [priceRes, balRes, networkRes, nonceRes] = await Promise.allSettled([
        fetchPrices(),
        prov.getBalance(addr),
        prov.getNetwork(),
        prov.getTransactionCount(addr),
      ])

      const priceMap = priceRes.status === 'fulfilled' ? priceRes.value : { OKB: 50, USDC: 1, USDT: 1 }
      const bal = balRes.status === 'fulfilled' ? balRes.value : 0n
      const network = networkRes.status === 'fulfilled' ? networkRes.value : null
      const nonce = nonceRes.status === 'fulfilled' ? nonceRes.value : null

      setPrices(priceMap)
      setTxCount(nonce)

      const chain = network ? Number(network.chainId) : null
      if (chain) setChainId(chain)

      const nativeBal = formatEther(bal)
      setBalance(nativeBal)

      // Native currency price
      const chainInfo = CHAIN_INFO[chain] || { nativeSymbol: 'OKB' }
      const natPrice = priceMap[chainInfo.nativeSymbol] || 0
      setNativePrice(natPrice)

      // Scan known ERC20 tokens on this chain
      const knownTokens = KNOWN_TOKENS[chain] || []
      const tokenResults = await Promise.allSettled(
        knownTokens.map(async (token) => {
          const contract = new Contract(token.address, ERC20_ABI, prov)
          const rawBal = await contract.balanceOf(addr)
          const formatted = formatUnits(rawBal, token.decimals)
          if (parseFloat(formatted) <= 0) return null

          // Try to read name from contract, fallback to symbol
          let tokenName = token.symbol
          try { tokenName = await contract.name() } catch {}

          const price = priceMap[token.symbol] || 0
          const valueUSD = parseFloat(formatted) * price

          return {
            address: token.address,
            symbol: token.symbol,
            name: tokenName,
            decimals: token.decimals,
            balance: formatted,
            priceUSD: price,
            valueUSD,
          }
        })
      )

      const validTokens = tokenResults
        .filter(r => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value)

      setTokens(validTokens)
    } catch (err) {
      console.error('Failed to fetch balances:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const connectWallet = useCallback(async (walletType, silent = false) => {
    setError(null)
    setConnecting(true)

    try {
      const walletInfo = WALLET_PROVIDERS[walletType]
      if (!walletInfo) throw new Error('Unknown wallet type')

      const rawProvider = walletInfo.getProvider()
      if (!rawProvider) {
        if (!silent) window.open(walletInfo.downloadUrl, '_blank')
        throw new Error(`${walletInfo.name} not detected. Please install it.`)
      }

      const accounts = await rawProvider.request({ method: 'eth_requestAccounts' })
      if (!accounts?.length) throw new Error('No accounts found')

      // Switch to X Layer Testnet if not already on it
      try {
        await rawProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: XLAYER_TESTNET.chainId }],
        })
      } catch (switchErr) {
        // Chain not added yet — add it
        if (switchErr.code === 4902) {
          await rawProvider.request({
            method: 'wallet_addEthereumChain',
            params: [XLAYER_TESTNET],
          })
        }
      }

      const ethersProvider = new BrowserProvider(rawProvider)
      const ethersSigner = await ethersProvider.getSigner()

      setProvider(ethersProvider)
      providerRef.current = ethersProvider
      setSigner(ethersSigner)
      setAddress(accounts[0])
      setProviderName(walletType)
      localStorage.setItem('deadswitch-wallet-provider', walletType)

      // Fetch all data
      await refreshBalances(accounts[0])
    } catch (err) {
      if (!silent) setError(err.message)
      console.error('Wallet connection failed:', err)
    } finally {
      setConnecting(false)
    }
  }, [refreshBalances])

  const disconnect = useCallback(() => {
    setAddress(null)
    setBalance(null)
    setTokens([])
    setChainId(null)
    setProvider(null)
    providerRef.current = null
    setSigner(null)
    setProviderName(null)
    setNativePrice(0)
    setPrices({})
    setTxCount(null)
    setError(null)
    localStorage.removeItem('deadswitch-wallet-provider')
  }, [])

  // Send native token
  const sendNative = useCallback(async (to, amountEther) => {
    if (!signer) throw new Error('Wallet not connected')
    const tx = await signer.sendTransaction({
      to,
      value: BigInt(Math.floor(parseFloat(amountEther) * 1e18)),
    })
    return tx
  }, [signer])

  // Send ERC20 token
  const sendToken = useCallback(async (tokenAddress, to, amount, decimals = 18) => {
    if (!signer) throw new Error('Wallet not connected')
    const contract = new Contract(tokenAddress, ERC20_ABI, signer)
    const parsedAmount = BigInt(Math.floor(parseFloat(amount) * (10 ** decimals)))
    const tx = await contract.transfer(to, parsedAmount)
    return tx
  }, [signer])

  // Switch to X Layer Testnet
  const switchToXLayerTestnet = useCallback(async () => {
    const raw = providerName ? WALLET_PROVIDERS[providerName]?.getProvider() : null
    if (!raw) return
    try {
      await raw.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: XLAYER_TESTNET.chainId }],
      })
    } catch (switchErr) {
      if (switchErr.code === 4902) {
        await raw.request({
          method: 'wallet_addEthereumChain',
          params: [XLAYER_TESTNET],
        })
      }
    }
  }, [providerName])

  // Derived values
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null
  const isConnected = !!address
  const chainInfo = CHAIN_INFO[chainId] || { name: `Chain ${chainId}`, nativeSymbol: 'ETH', nativeName: 'Native' }
  const nativeBalanceUSD = parseFloat(balance || 0) * nativePrice
  const tokensTotalUSD = tokens.reduce((sum, t) => sum + (t.valueUSD || 0), 0)
  const totalValueUSD = nativeBalanceUSD + tokensTotalUSD

  return (
    <WalletContext.Provider value={{
      // State
      address,
      shortAddress,
      chainId,
      chainInfo,
      balance,
      nativePrice,
      nativeBalanceUSD,
      tokens,
      tokensTotalUSD,
      totalValueUSD,
      prices,
      txCount,
      provider,
      signer,
      providerName,
      connecting,
      loading,
      error,
      isConnected,
      // Actions
      connectWallet,
      disconnect,
      refreshBalances: () => refreshBalances(address),
      sendNative,
      sendToken,
      switchToXLayerTestnet,
      WALLET_PROVIDERS,
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
