import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  FileText,
  GraduationCap,
  Search,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Emblem3D, type EmblemVariant } from '@/components/ui/Emblem3D'
import { useOrderEventRefresh } from '@/hooks/useOrderEventRefresh'
import { cn } from '@/lib/utils'
import { onModeChange } from '@/stores/themeStore'

interface MarginData {
  availablecash: string
  collateral: string
  m2munrealized: string
  m2mrealized: string
  utiliseddebits: string
}

interface MasterContractStatus {
  status: 'pending' | 'downloading' | 'success' | 'error'
  message?: string
  total_symbols?: number
}

// Format number in Indian format with Cr/L suffixes
function formatIndianNumber(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (Number.isNaN(num)) return '0.00'

  const isNegative = num < 0
  const absNum = Math.abs(num)

  let formatted: string
  if (absNum >= 10000000) {
    // 1 Crore or more
    formatted = `${(absNum / 10000000).toFixed(2)}Cr`
  } else if (absNum >= 100000) {
    // 1 Lakh or more
    formatted = `${(absNum / 100000).toFixed(2)}L`
  } else {
    // Less than 1 Lakh - just decimal format
    formatted = absNum.toFixed(2)
  }

  return isNegative ? `-${formatted}` : formatted
}

// Get color class based on P&L value with high contrast
function getPnLColor(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (num > 0) return 'text-emerald-600 dark:text-emerald-400 font-extrabold'
  if (num < 0) return 'text-rose-600 dark:text-rose-400 font-extrabold'
  return 'text-contrast-heading font-extrabold'
}

function getPnLBadgeVariant(value: string | number): 'profit' | 'loss' | 'secondary' {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (num > 0) return 'profit'
  if (num < 0) return 'loss'
  return 'secondary'
}

export default function Dashboard() {
  const [marginData, setMarginData] = useState<MarginData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [masterContract, setMasterContract] = useState<MasterContractStatus>({
    status: 'pending',
  })
  const [isAuthenticated, setIsAuthenticated] = useState(true) // Assume authenticated initially
  // Broker token revoked/expired while the app session is still valid
  // (daily token rollover). Routes the user to /broker, not /login (#1400).
  const [brokerExpired, setBrokerExpired] = useState(false)

  // Fetch dashboard funds data
  const fetchFundsData = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/auth/dashboard-data', {
        credentials: 'include',
      })

      if (response.status === 401) {
        const body = await response.json().catch(() => null)
        if (body?.code === 'BROKER_SESSION_EXPIRED') {
          setBrokerExpired(true)
        } else {
          setIsAuthenticated(false)
        }
        setIsLoading(false)
        return
      }

      const data = await response.json()

      if (data.status === 'success' && data.data) {
        setMarginData(data.data)
        setError(null)
      } else {
        setError(data.message || 'Failed to fetch margin data')
      }
    } catch (_err) {
      setError('Failed to fetch margin data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFundsData()
  }, [fetchFundsData])

  // Refresh funds when an order is placed (via SocketIO event)
  useOrderEventRefresh(fetchFundsData, {
    events: ['order_event', 'analyzer_update', 'close_position_event'],
  })

  // Listen for mode changes and refresh data
  useEffect(() => {
    const unsubscribe = onModeChange(() => {
      // Refresh funds data when mode changes
      fetchFundsData()
    })
    return () => unsubscribe()
  }, [fetchFundsData])

  // Check master contract status
  const checkMasterContractStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/master-contract/status', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })

      if (response.status === 401) {
        return
      }

      const data = await response.json()
      setMasterContract(data)
    } catch (_err) {
      setMasterContract({ status: 'error', message: 'Failed to check status' })
    }
  }, [])

  useEffect(() => {
    checkMasterContractStatus()

    // Poll every 5 seconds until successful
    const interval = setInterval(() => {
      setMasterContract((prev) => {
        if (prev.status === 'success') {
          return prev // Don't check again if already successful
        }
        checkMasterContractStatus()
        return prev
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [checkMasterContractStatus])


  const getMasterContractStatusText = () => {
    switch (masterContract.status) {
      case 'success':
        return masterContract.total_symbols
          ? `Ready (${masterContract.total_symbols} symbols)`
          : 'Ready'
      case 'downloading':
        return 'Downloading...'
      case 'error':
        return 'Error'
      default:
        return 'Checking...'
    }
  }

  const getMasterContractTextColor = () => {
    switch (masterContract.status) {
      case 'success':
        return 'text-green-600 dark:text-green-400'
      case 'downloading':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'error':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-muted-foreground'
    }
  }

  const quickAccessCards: Array<{
    href: string
    label: string
    description: string
    icon: typeof Search
    emblemVariant: EmblemVariant
    external?: boolean
  }> = [
    {
      href: '/search',
      label: 'Tradeboard Symbols',
      description: 'Universal symbology across brokers with instant contract search',
      icon: Search,
      emblemVariant: 'indigo',
    },
    {
      href: '/logs',
      label: 'Live Logs',
      description: 'Real-time order execution and trading telemetry feed',
      icon: FileText,
      emblemVariant: 'violet',
    },
    {
      href: 'https://docs.algo.wesoftcorp.com',
      label: 'Documentation',
      description: 'Tutorials, REST & WebSocket API developer guides',
      icon: BookOpen,
      emblemVariant: 'cyan',
      external: true,
    },
    {
      href: '/pnl-tracker',
      label: 'P&L Tracker',
      description: 'Real-time intraday mark-to-market performance analytics',
      icon: BarChart3,
      emblemVariant: 'emerald',
    },
    {
      href: 'https://docs.algo.wesoftcorp.com/getting-started/',
      label: 'OpenVarsity',
      description: 'Comprehensive quantitative and algorithmic trading curriculum',
      icon: GraduationCap,
      emblemVariant: 'blue',
      external: true,
    },
    {
      href: '/logs/latency',
      label: 'Latency Monitor',
      description: 'Sub-millisecond broker round-trip execution telemetry',
      icon: Zap,
      emblemVariant: 'orange',
    },
  ]

  // Broker token expired but the app session is fine: send the user to the
  // broker reconnect flow, not /login (which would bounce back) — #1400.
  if (brokerExpired) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h1 className="text-2xl font-bold text-contrast-heading">Broker Session Expired</h1>
        <p className="text-contrast-subtext text-center max-w-md">
          Your broker token has expired (brokers roll tokens daily). Reconnect to continue trading.
        </p>
        <Link
          to="/broker"
          className="inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:scale-105 active:scale-95 transition-all"
        >
          Reconnect Broker
        </Link>
      </div>
    )
  }

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h1 className="text-2xl font-bold text-contrast-heading">Session Expired</h1>
        <p className="text-contrast-subtext">Please log in to access the dashboard.</p>
        <Link to="/login" className="text-primary hover:underline font-semibold">
          Go to Login
        </Link>
      </div>
    )
  }

  const unrealizedNum = marginData ? parseFloat(marginData.m2munrealized || '0') : 0
  const realizedNum = marginData ? parseFloat(marginData.m2mrealized || '0') : 0

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Dashboard Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-contrast-heading">
            Trading Dashboard
          </h1>
          <p className="text-contrast-subtext mt-1 text-sm md:text-base font-medium">
            Live overview of your trading account, margins, and market positions
          </p>
        </div>

        {/* Master Contract Status Indicator with 3D Aura */}
        <div className="flex items-center gap-3 glass-card px-4 py-2.5 w-fit lg:ml-auto lg:self-center shadow-xs">
          <span className="text-xs md:text-sm font-semibold text-contrast-label whitespace-nowrap">
            Master Contract:
          </span>
          <div className="flex items-center gap-2.5">
            <Emblem3D
              size="sm"
              variant={
                masterContract.status === 'success'
                  ? 'emerald'
                  : masterContract.status === 'downloading'
                    ? 'amber'
                    : masterContract.status === 'error'
                      ? 'rose'
                      : 'slate'
              }
              pulse={masterContract.status !== 'success'}
              className="h-6 w-6 min-w-[24px]"
            >
              <div className="h-2 w-2 rounded-full bg-white shadow-xs" />
            </Emblem3D>
            <span
              className={cn('text-xs md:text-sm font-bold', getMasterContractTextColor())}
              title={masterContract.message}
            >
              {getMasterContractStatusText()}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid with 3D Emblems & Glassmorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
        {/* Available Balance */}
        <div className="glass-card glass-card-interactive glass-glow-emerald p-5 flex flex-col justify-between gap-4 group">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm font-semibold text-contrast-label uppercase tracking-wider">
              Available Balance
            </span>
            <Emblem3D
              variant="emerald"
              icon={Wallet}
              size="md"
              floating
              className="group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-extrabold text-contrast-heading tracking-tight">
              {isLoading
                ? '...'
                : marginData
                  ? formatIndianNumber(marginData.availablecash)
                  : '0.00'}
            </div>
            <Badge variant="profit" className="mt-3 text-[11px]">
              Cash Balance
            </Badge>
          </div>
        </div>

        {/* Collateral */}
        <div className="glass-card glass-card-interactive glass-glow-violet p-5 flex flex-col justify-between gap-4 group">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm font-semibold text-contrast-label uppercase tracking-wider">
              Collateral
            </span>
            <Emblem3D
              variant="violet"
              icon={ShieldCheck}
              size="md"
              floating
              className="group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">
              {isLoading
                ? '...'
                : marginData
                  ? formatIndianNumber(marginData.collateral)
                  : '0.00'}
            </div>
            <Badge
              variant="glass"
              className="mt-3 text-[11px] text-purple-700 dark:text-purple-300 border-purple-500/30"
            >
              Total Collateral
            </Badge>
          </div>
        </div>

        {/* Unrealized P&L */}
        <div
          className={cn(
            'glass-card glass-card-interactive p-5 flex flex-col justify-between gap-4 group',
            unrealizedNum >= 0 ? 'glass-glow-emerald' : 'glass-glow-rose'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm font-semibold text-contrast-label uppercase tracking-wider">
              Unrealized P&L
            </span>
            <Emblem3D
              variant={unrealizedNum >= 0 ? 'emerald' : 'rose'}
              icon={unrealizedNum >= 0 ? TrendingUp : TrendingDown}
              size="md"
              floating
              className="group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div>
            <div
              className={cn(
                'text-2xl lg:text-3xl font-extrabold tracking-tight',
                marginData ? getPnLColor(marginData.m2munrealized) : 'text-contrast-heading'
              )}
            >
              {isLoading
                ? '...'
                : marginData
                  ? formatIndianNumber(marginData.m2munrealized)
                  : '0.00'}
            </div>
            <Badge
              variant={marginData ? getPnLBadgeVariant(marginData.m2munrealized) : 'secondary'}
              className="mt-3 text-[11px]"
            >
              Mark to Market
            </Badge>
          </div>
        </div>

        {/* Realized P&L */}
        <div
          className={cn(
            'glass-card glass-card-interactive p-5 flex flex-col justify-between gap-4 group',
            realizedNum >= 0 ? 'glass-glow-emerald' : 'glass-glow-rose'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm font-semibold text-contrast-label uppercase tracking-wider">
              Realized P&L
            </span>
            <Emblem3D
              variant={realizedNum >= 0 ? 'emerald' : 'rose'}
              icon={realizedNum >= 0 ? Award : TrendingDown}
              size="md"
              floating
              className="group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div>
            <div
              className={cn(
                'text-2xl lg:text-3xl font-extrabold tracking-tight',
                marginData ? getPnLColor(marginData.m2mrealized) : 'text-contrast-heading'
              )}
            >
              {isLoading
                ? '...'
                : marginData
                  ? formatIndianNumber(marginData.m2mrealized)
                  : '0.00'}
            </div>
            <Badge
              variant={marginData ? getPnLBadgeVariant(marginData.m2mrealized) : 'secondary'}
              className="mt-3 text-[11px]"
            >
              Booked P&L
            </Badge>
          </div>
        </div>

        {/* Utilised Margin */}
        <div className="glass-card glass-card-interactive glass-glow-cyan p-5 flex flex-col justify-between gap-4 group">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm font-semibold text-contrast-label uppercase tracking-wider">
              Utilised Margin
            </span>
            <Emblem3D
              variant="cyan"
              icon={Activity}
              size="md"
              floating
              className="group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight">
              {isLoading
                ? '...'
                : marginData
                  ? formatIndianNumber(marginData.utiliseddebits)
                  : '0.00'}
            </div>
            <Badge
              variant="glass"
              className="mt-3 text-[11px] text-cyan-700 dark:text-cyan-300 border-cyan-500/30"
            >
              Used Margin
            </Badge>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="glass-card border-destructive/30 bg-destructive/10 p-5 rounded-xl">
          <p className="text-destructive font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Quick Access Tools */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-contrast-heading tracking-tight">
            Quick Access Tools
          </h2>
          <span className="text-xs font-semibold text-contrast-label">
            Universal Symbology & Platform Telemetry
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {quickAccessCards.map((card) => {
            const glowClass = `glass-glow-${card.emblemVariant}`
            const cardContent = (
              <div
                className={cn(
                  'glass-card glass-card-interactive group p-5 h-full flex flex-col justify-between gap-4',
                  glowClass
                )}
              >
                <div className="flex items-start gap-4">
                  <Emblem3D
                    icon={card.icon}
                    variant={card.emblemVariant}
                    size="md"
                    className="group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base md:text-lg text-contrast-heading group-hover:text-primary transition-colors">
                      {card.label}
                    </h3>
                    <p className="text-sm text-contrast-subtext mt-1 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end text-xs font-bold text-primary/80 group-hover:text-primary group-hover:translate-x-1 transition-all">
                  Open tool →
                </div>
              </div>
            )

            if (card.external) {
              return (
                <a
                  key={card.href}
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full"
                >
                  {cardContent}
                </a>
              )
            }

            return (
              <Link key={card.href} to={card.href} className="block h-full">
                {cardContent}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
