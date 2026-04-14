import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './context/ThemeContext'
import { WalletProvider, useWallet } from './context/WalletContext'
import Landing from './pages/Landing'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Configure from './pages/Configure'
import History from './pages/History'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
})

function LandingRoute() {
  const navigate = useNavigate()
  const { isConnected, connectWallet } = useWallet()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <Landing
        onLaunchApp={() => isConnected ? navigate('/dashboard') : connectWallet()}
        onConnectWallet={connectWallet}
      />
    </motion.div>
  )
}

function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { connectWallet, disconnect } = useWallet()

  // Active sidebar item derived from URL — e.g. /dashboard → 'dashboard'
  const activePage = location.pathname.replace(/^\//, '').split('/')[0] || 'dashboard'

  const handleDisconnect = async () => {
    await disconnect()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--surface)' }}>
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => navigate(`/${page}`)}
        onGoHome={() => navigate('/')}
        onConnectWallet={connectWallet}
        onDisconnect={handleDisconnect}
      />
      <main className="flex-1 overflow-y-auto" style={{ background: 'var(--surface)' }}>
        <div className="max-w-6xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <WalletProvider>
            <Routes>
              <Route path="/" element={<LandingRoute />} />
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/configure" element={<Configure />} />
                <Route path="/history" element={<History />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </WalletProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
