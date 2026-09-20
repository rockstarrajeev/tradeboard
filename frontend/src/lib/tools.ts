import type { EmblemVariant } from '@/components/ui/Emblem3D'

/**
 * The tool registry, shared by the /tools page and the home page.
 *
 * Lives here rather than inside the page so the home page can state how many
 * tools exist without importing the page component -- and so the number is
 * derived rather than typed. A hardcoded count goes stale the moment a tool is
 * added, which is exactly how the previous "15+" survived three new tools.
 */
export type ToolCategory =
  | 'Options'
  | 'Greeks & Vol'
  | 'Backtesting'
  | 'Analysis'
  | 'Arbitrage'

export interface Tool {
  title: string
  description: string
  href: string
  color: string
  emblemVariant: EmblemVariant
  category: ToolCategory
  badge: string
}

export const tools: Tool[] = [
  {
    title: 'Strategy Builder',
    description:
      'Build multi-leg option strategies with live Greeks, payoff diagram and what-if simulators',
    href: '/strategybuilder',
    color: 'bg-fuchsia-500',
    emblemVariant: 'violet',
    category: 'Options',
    badge: 'Multi-Leg & Greeks',
  },
  {
    title: 'Strategy Portfolio',
    description: 'Saved strategies across MyTrades and Simulation watchlists with risk tracking',
    href: '/strategybuilder/portfolio',
    color: 'bg-violet-500',
    emblemVariant: 'indigo',
    category: 'Options',
    badge: 'Strategy Books',
  },
  {
    title: 'Portfolio Backtester',
    description:
      'Backtest a weighted portfolio against an index with real delivery costs, rebalancing rules, and full tearsheet',
    href: '/portfolio-backtester',
    color: 'bg-emerald-500',
    emblemVariant: 'emerald',
    category: 'Backtesting',
    badge: 'Tearsheet & Risk',
  },
  {
    title: 'SIP Backtester',
    description:
      'Evaluate historical monthly, weekly or quarterly SIP returns: XIRR, rupee-cost averaging, and lumpsum comparison',
    href: '/sip-backtester',
    color: 'bg-emerald-500',
    emblemVariant: 'emerald',
    category: 'Backtesting',
    badge: 'XIRR & Lumpsum',
  },
  {
    title: 'Portfolio Analyzer',
    description:
      'Grade the holdings you actually own: concentration, co-movement, drawdown resilience and crisis behaviour',
    href: '/portfolio-analyzer',
    color: 'bg-sky-500',
    emblemVariant: 'cyan',
    category: 'Analysis',
    badge: 'Stress Testing',
  },
  {
    title: 'Option Chain',
    description: 'Real-time option chain with live Greeks, OI analysis, and quick direct order placement',
    href: '/optionchain',
    color: 'bg-emerald-500',
    emblemVariant: 'emerald',
    category: 'Options',
    badge: 'Live Greeks & OI',
  },
  {
    title: 'Option Greeks',
    description: 'Historical IV, Delta, Theta, Vega, and Gamma intraday curves for ATM options',
    href: '/ivchart',
    color: 'bg-violet-500',
    emblemVariant: 'violet',
    category: 'Greeks & Vol',
    badge: 'Greeks & Curves',
  },
  {
    title: 'OI Tracker',
    description: 'Open Interest analysis with CE/PE OI bars, PCR overlay, and ATM strike marker',
    href: '/oitracker',
    color: 'bg-blue-500',
    emblemVariant: 'blue',
    category: 'Analysis',
    badge: 'PCR & OI Bars',
  },
  {
    title: 'OI Range',
    description:
      'Open Interest by strike for a custom range with ATM-relative quick selectors and 1-minute auto-refresh',
    href: '/oirange',
    color: 'bg-sky-500',
    emblemVariant: 'cyan',
    category: 'Analysis',
    badge: 'Strike Range',
  },
  {
    title: 'Max Pain',
    description: 'Max Pain strike calculation with visual pain distribution and expiry settlement analysis',
    href: '/maxpain',
    color: 'bg-amber-500',
    emblemVariant: 'amber',
    category: 'Options',
    badge: 'Settlement Strike',
  },
  {
    title: 'Straddle Chart',
    description:
      'Dynamic ATM Straddle chart with rolling strike, Spot, and Synthetic Futures premium overlay',
    href: '/straddle',
    color: 'bg-teal-500',
    emblemVariant: 'cyan',
    category: 'Options',
    badge: 'ATM Premiums',
  },
  {
    title: 'Straddle PnL',
    description:
      'Simulated intraday ATM straddle P&L with automated N-point adjustments and full trade audit log',
    href: '/straddlepnl',
    color: 'bg-orange-500',
    emblemVariant: 'orange',
    category: 'Options',
    badge: 'N-Point Adjustments',
  },
  {
    title: 'Vol Surface',
    description:
      '3D Implied Volatility surface across strikes and expiries using live option chain data',
    href: '/volsurface',
    color: 'bg-rose-500',
    emblemVariant: 'rose',
    category: 'Greeks & Vol',
    badge: '3D Vol Surface',
  },
  {
    title: 'GEX Dashboard',
    description: 'Gamma Exposure analysis with OI Walls, Net GEX per strike, and top gamma strikes',
    href: '/gex',
    color: 'bg-indigo-500',
    emblemVariant: 'indigo',
    category: 'Greeks & Vol',
    badge: 'Gamma Exposure',
  },
  {
    title: 'Gamma Density',
    description:
      'Γ×OI density and convexity zones with intraday views, ATM IV, and ±1σ/±2σ expected-move bands',
    href: '/gammadensity',
    color: 'bg-lime-500',
    emblemVariant: 'emerald',
    category: 'Greeks & Vol',
    badge: 'Convexity Zones',
  },
  {
    title: 'IV Smile',
    description: 'Implied Volatility smile with Call/Put IV curves, ATM IV, and market skew analysis',
    href: '/ivsmile',
    color: 'bg-cyan-500',
    emblemVariant: 'cyan',
    category: 'Greeks & Vol',
    badge: 'Volatility Skew',
  },
  {
    title: 'OI Profile',
    description: 'Futures candlestick with OI butterfly and daily open interest shifts across strikes',
    href: '/oiprofile',
    color: 'bg-orange-500',
    emblemVariant: 'orange',
    category: 'Analysis',
    badge: 'OI Butterfly',
  },
  {
    title: 'Arbitrage',
    description:
      'Realtime futures calendar-spread scanner across NFO & MCX, ranked by executable spread % with two-leg orders',
    href: '/arbitrage',
    color: 'bg-green-600',
    emblemVariant: 'emerald',
    category: 'Arbitrage',
    badge: 'Calendar Spread',
  },
]
