import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, makeFormatCurrency } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

// ─── Types ──────────────────────────────────────────────────────────────────

interface TradeEntry {
  id: string
  symbol: string
  action: 'BUY' | 'SELL'
  qty: number
  price: number
  pnl: number
  time: string
}

interface DayData {
  date: string // 'YYYY-MM-DD'
  pnl: number
  tradeCount: number
  trades: TradeEntry[]
}

type ViewMode = 'monthly' | 'annual'

// ─── Mock data generator ─────────────────────────────────────────────────────

const SYMBOLS = [
  'NIFTY24DEC23000CE',
  'NIFTY24DEC23000PE',
  'BANKNIFTY24NOV50000CE',
  'RELIANCE',
  'INFY',
  'TCS',
  'HDFC',
  'NIFTY24DEC22900CE',
  'NIFTY24DEC23100PE',
]

const INDIAN_HOLIDAYS_2024_2025 = new Set([
  '2024-01-22',
  '2024-01-26',
  '2024-03-08',
  '2024-03-25',
  '2024-03-29',
  '2024-04-14',
  '2024-04-17',
  '2024-04-21',
  '2024-05-23',
  '2024-06-17',
  '2024-07-17',
  '2024-08-15',
  '2024-10-02',
  '2024-10-12',
  '2024-11-01',
  '2024-11-15',
  '2024-11-20',
  '2024-12-25',
  '2025-01-26',
  '2025-02-19',
  '2025-03-14',
  '2025-03-31',
  '2025-04-10',
  '2025-04-14',
  '2025-04-18',
  '2025-05-01',
])

/** Seeded pseudo-random for stable mock data across renders */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function generateTrades(dateStr: string, dayIndex: number): TradeEntry[] {
  const count = Math.floor(seededRandom(dayIndex * 7 + 1) * 5) + 1
  return Array.from({ length: count }, (_, i) => {
    const pnl = (seededRandom(dayIndex * 13 + i * 3) - 0.4) * 4000
    return {
      id: `${dateStr}-t${i}`,
      symbol: SYMBOLS[Math.floor(seededRandom(dayIndex * 5 + i) * SYMBOLS.length)],
      action: seededRandom(dayIndex + i * 2) > 0.5 ? 'BUY' : 'SELL',
      qty: (Math.floor(seededRandom(dayIndex * 11 + i) * 10) + 1) * 50,
      price: Math.floor(seededRandom(dayIndex * 9 + i) * 500 + 100),
      pnl: Math.round(pnl),
      time: `${String(9 + Math.floor(seededRandom(dayIndex * 3 + i) * 5)).padStart(2, '0')}:${String(Math.floor(seededRandom(dayIndex + i * 7) * 59)).padStart(2, '0')}`,
    }
  })
}

/**
 * Generate mock trading data from Jan 2024 → Jun 2025,
 * skipping weekends and known Indian market holidays.
 */
function generateMockData(): Map<string, DayData> {
  const map = new Map<string, DayData>()
  const start = new Date('2024-01-01')
  const end = new Date('2025-06-30')
  let dayIndex = 0

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay()
    if (dow === 0 || dow === 6) continue // weekend
    const dateStr = d.toISOString().slice(0, 10)
    if (INDIAN_HOLIDAYS_2024_2025.has(dateStr)) continue

    // ~85% of days have trades
    if (seededRandom(dayIndex * 17) < 0.15) {
      dayIndex++
      continue
    }

    const trades = generateTrades(dateStr, dayIndex)
    const pnl = trades.reduce((sum, t) => sum + t.pnl, 0)
    map.set(dateStr, {
      date: dateStr,
      pnl: Math.round(pnl),
      tradeCount: trades.length,
      trades,
    })
    dayIndex++
  }

  return map
}

// Singleton so data doesn't regenerate on each render
const MOCK_DATA = generateMockData()

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${pad2(m)}-${pad2(d)}`
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  // 0=Sun → we want Mon-first; shift so Mon=0
  return (new Date(year, month - 1, 1).getDay() + 6) % 7
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface MonthSummary {
  totalPnl: number
  tradingDays: number
  winDays: number
  bestDay: number
  worstDay: number
}

function computeMonthSummary(year: number, month: number): MonthSummary {
  let totalPnl = 0
  let tradingDays = 0
  let winDays = 0
  let bestDay = -Infinity
  let worstDay = Infinity
  const days = getDaysInMonth(year, month)

  for (let d = 1; d <= days; d++) {
    const ds = toDateStr(year, month, d)
    const day = MOCK_DATA.get(ds)
    if (!day) continue
    totalPnl += day.pnl
    tradingDays++
    if (day.pnl > 0) winDays++
    if (day.pnl > bestDay) bestDay = day.pnl
    if (day.pnl < worstDay) worstDay = day.pnl
  }

  return {
    totalPnl: Math.round(totalPnl),
    tradingDays,
    winDays,
    bestDay: bestDay === -Infinity ? 0 : Math.round(bestDay),
    worstDay: worstDay === Infinity ? 0 : Math.round(worstDay),
  }
}

interface AnnualSummary {
  totalPnl: number
  tradingDays: number
  winDays: number
  totalTrades: number
}

function computeAnnualSummary(year: number): AnnualSummary {
  let totalPnl = 0
  let tradingDays = 0
  let winDays = 0
  let totalTrades = 0

  for (const [dateStr, day] of MOCK_DATA.entries()) {
    if (!dateStr.startsWith(String(year))) continue
    totalPnl += day.pnl
    tradingDays++
    if (day.pnl > 0) winDays++
    totalTrades += day.tradeCount
  }

  return { totalPnl: Math.round(totalPnl), tradingDays, winDays, totalTrades }
}

// ─── Heatmap color ────────────────────────────────────────────────────────────

/**
 * Returns an inline style background for a calendar cell based on P&L magnitude.
 * Uses CSS custom properties so it adapts to dark/light themes.
 */
function cellBg(pnl: number | undefined): string {
  if (pnl === undefined) return ''
  if (pnl === 0) return 'bg-muted/30'
  const abs = Math.abs(pnl)
  if (pnl > 0) {
    if (abs > 5000) return 'bg-green-500/25 dark:bg-green-500/20'
    if (abs > 2000) return 'bg-green-400/20 dark:bg-green-400/15'
    return 'bg-green-300/15 dark:bg-green-300/10'
  }
  if (abs > 5000) return 'bg-red-500/25 dark:bg-red-500/20'
  if (abs > 2000) return 'bg-red-400/20 dark:bg-red-400/15'
  return 'bg-red-300/15 dark:bg-red-300/10'
}

/** Annual heatmap cell — inline style approach for 7 intensity levels */
function heatmapStyle(pnl: number | undefined): React.CSSProperties {
  if (pnl === undefined || pnl === 0) {
    return { background: 'hsl(var(--muted))' }
  }
  const abs = Math.abs(pnl)
  const isProfit = pnl > 0

  if (isProfit) {
    if (abs > 8000) return { background: 'oklch(0.52 0.2 145)' }
    if (abs > 4000) return { background: 'oklch(0.60 0.18 145)' }
    return { background: 'oklch(0.72 0.14 145)' }
  }
  if (abs > 8000) return { background: 'oklch(0.52 0.22 25)' }
  if (abs > 4000) return { background: 'oklch(0.60 0.20 25)' }
  return { background: 'oklch(0.72 0.16 25)' }
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

interface DayCellProps {
  dateStr: string
  dayNum: number
  isToday: boolean
  onClick: (dateStr: string) => void
  formatCurrency: (v: number) => string
}

/** A single day cell in the monthly grid */
function DayCell({ dateStr, dayNum, isToday, onClick, formatCurrency }: DayCellProps) {
  const day = MOCK_DATA.get(dateStr)

  return (
    <button
      id={`day-cell-${dateStr}`}
      aria-label={`${dateStr}${day ? `: ${formatCurrency(day.pnl)}` : ': no trades'}`}
      type="button"
      onClick={() => day && onClick(dateStr)}
      className={cn(
        'relative min-h-16 w-full rounded-md border text-left transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        day ? 'cursor-pointer hover:scale-[1.02] hover:shadow-md' : 'cursor-default',
        isToday && 'ring-2 ring-primary ring-offset-1',
        day ? cellBg(day.pnl) : 'border-border/40 bg-transparent'
      )}
    >
      <span
        className={cn(
          'absolute top-1 left-1.5 text-xs font-semibold',
          isToday ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {dayNum}
      </span>

      {day && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-1 pt-4">
          <span
            className={cn(
              'text-xs font-bold leading-tight',
              day.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}
          >
            {day.pnl >= 0 ? '+' : ''}
            {formatCurrency(day.pnl)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {day.tradeCount} trade{day.tradeCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </button>
  )
}

// ─── Trade Drawer ─────────────────────────────────────────────────────────────

interface TradeDrawerProps {
  dateStr: string | null
  onClose: () => void
  formatCurrency: (v: number) => string
}

/** Slide-in drawer showing individual trades for a selected day */
function TradeDrawer({ dateStr, onClose, formatCurrency }: TradeDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const day = dateStr ? MOCK_DATA.get(dateStr) : undefined
  const isOpen = !!dateStr && !!day

  // Focus trap
  useEffect(() => {
    if (!isOpen) return
    const el = drawerRef.current
    if (!el) return
    const focusables = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    first?.focus()

    const trap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [isOpen, onClose])

  if (!isOpen || !day) return null

  const totalPnl = day.trades.reduce((s, t) => s + t.pnl, 0)
  const winTrades = day.trades.filter((t) => t.pnl > 0).length
  const formattedDate = new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer panel — bottom sheet on mobile, right panel on desktop */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Trades on ${formattedDate}`}
        className={cn(
          'fixed z-50 bg-card shadow-2xl border-border',
          'transition-all duration-300 ease-out',
          // Mobile: bottom sheet
          'bottom-0 left-0 right-0 rounded-t-2xl border-t max-h-[85vh] overflow-y-auto',
          // Desktop: right panel
          'md:bottom-0 md:right-0 md:top-0 md:left-auto md:w-[420px] md:rounded-none md:rounded-l-2xl md:border-l md:border-t-0 md:max-h-screen',
          'scrollbar-thin'
        )}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm px-5 py-4 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Trade Log
              </p>
              <h2 className="text-base font-semibold mt-0.5 leading-tight">{formattedDate}</h2>
            </div>
            <button
              id="drawer-close-btn"
              type="button"
              aria-label="Close drawer"
              onClick={onClose}
              className="rounded-full p-1.5 hover:bg-muted transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Day summary chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                totalPnl >= 0
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              )}
            >
              {totalPnl >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {totalPnl >= 0 ? '+' : ''}
              {formatCurrency(totalPnl)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <BarChart3 className="h-3 w-3" />
              {day.tradeCount} trades
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                'bg-muted text-muted-foreground'
              )}
            >
              {winTrades}/{day.tradeCount} wins
            </span>
          </div>
        </div>

        {/* Trade list */}
        <div className="px-4 py-3 space-y-2">
          {day.trades.map((trade) => (
            <div
              key={trade.id}
              className={cn(
                'rounded-lg border p-3 transition-colors',
                trade.pnl >= 0
                  ? 'border-green-200/50 bg-green-50/50 dark:border-green-900/30 dark:bg-green-950/20'
                  : 'border-red-200/50 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{trade.symbol}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={trade.action === 'BUY' ? 'default' : 'destructive'}
                      className="text-[10px] h-4 px-1.5"
                    >
                      {trade.action}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {trade.qty} × {formatCurrency(trade.price)}
                    </span>
                    <span className="text-xs text-muted-foreground">{trade.time}</span>
                  </div>
                </div>
                <span
                  className={cn(
                    'text-sm font-bold tabular-nums shrink-0',
                    trade.pnl >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {trade.pnl >= 0 ? '+' : ''}
                  {formatCurrency(trade.pnl)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Monthly View ─────────────────────────────────────────────────────────────

interface MonthlyViewProps {
  year: number
  month: number
  onSelectDay: (dateStr: string) => void
  formatCurrency: (v: number) => string
}

function MonthlyView({ year, month, onSelectDay, formatCurrency }: MonthlyViewProps) {
  const todayStr = new Date().toISOString().slice(0, 10)
  const firstDow = getFirstDayOfWeek(year, month)
  const daysInMonth = getDaysInMonth(year, month)
  const summary = useMemo(() => computeMonthSummary(year, month), [year, month])

  // Build cell grid: empty prefix cells + day cells
  const cells: Array<{ dayNum: number; dateStr: string } | null> = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => ({
      dayNum: i + 1,
      dateStr: toDateStr(year, month, i + 1),
    })),
  ]

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          {
            label: 'Total P&L',
            value: `${summary.totalPnl >= 0 ? '+' : ''}${formatCurrency(summary.totalPnl)}`,
            color:
              summary.totalPnl >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400',
          },
          { label: 'Trading Days', value: String(summary.tradingDays), color: '' },
          {
            label: 'Win Rate',
            value: summary.tradingDays
              ? `${Math.round((summary.winDays / summary.tradingDays) * 100)}%`
              : 'N/A',
            color: '',
          },
          {
            label: 'Best Day',
            value: summary.bestDay !== 0 ? `+${formatCurrency(summary.bestDay)}` : '—',
            color: 'text-green-600 dark:text-green-400',
          },
          {
            label: 'Worst Day',
            value: summary.worstDay !== 0 ? formatCurrency(summary.worstDay) : '—',
            color: 'text-red-600 dark:text-red-400',
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/60">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={cn('text-sm font-bold mt-0.5', stat.color)}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) =>
          cell ? (
            <DayCell
              key={cell.dateStr}
              dateStr={cell.dateStr}
              dayNum={cell.dayNum}
              isToday={cell.dateStr === todayStr}
              onClick={onSelectDay}
              formatCurrency={formatCurrency}
            />
          ) : (
            <div key={`empty-${idx}`} className="min-h-16" />
          )
        )}
      </div>
    </div>
  )
}

// ─── Annual Heatmap ───────────────────────────────────────────────────────────

interface AnnualViewProps {
  year: number
  onSelectDay: (dateStr: string) => void
  formatCurrency: (v: number) => string
}

function AnnualView({ year, onSelectDay, formatCurrency }: AnnualViewProps) {
  const [tooltip, setTooltip] = useState<{
    dateStr: string
    x: number
    y: number
  } | null>(null)
  const summary = useMemo(() => computeAnnualSummary(year), [year])

  // Build 52-week grid: columns = weeks (Sun→Sat), rows = day-of-week Mon=0…Sun=6
  // We'll build columns of 7 cells, starting from Jan 1 of the year
  const jan1 = new Date(year, 0, 1)
  // Adjust so Mon=0
  const startDow = (jan1.getDay() + 6) % 7
  // Total cells: pad + 365/366 days
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  const totalDays = isLeap ? 366 : 365
  const totalCells = startDow + totalDays
  const totalWeeks = Math.ceil(totalCells / 7)

  // Pre-compute dates per column
  const weeks: Array<Array<{ dateStr: string; pnl: number | undefined }>> = []
  for (let w = 0; w < totalWeeks; w++) {
    const week: Array<{ dateStr: string; pnl: number | undefined }> = []
    for (let dow = 0; dow < 7; dow++) {
      const cellIdx = w * 7 + dow
      const dayOffset = cellIdx - startDow
      if (dayOffset < 0 || dayOffset >= totalDays) {
        week.push({ dateStr: '', pnl: undefined })
        continue
      }
      const d = new Date(year, 0, 1 + dayOffset)
      const ds = d.toISOString().slice(0, 10)
      week.push({ dateStr: ds, pnl: MOCK_DATA.get(ds)?.pnl })
    }
    weeks.push(week)
  }

  // Month label positions
  const monthStarts: Array<{ month: string; col: number }> = []
  let prevMonth = -1
  for (let w = 0; w < totalWeeks; w++) {
    for (let dow = 0; dow < 7; dow++) {
      const cellIdx = w * 7 + dow
      const dayOffset = cellIdx - startDow
      if (dayOffset < 0 || dayOffset >= totalDays) continue
      const d = new Date(year, 0, 1 + dayOffset)
      if (d.getMonth() !== prevMonth) {
        monthStarts.push({ month: MONTH_NAMES[d.getMonth()].slice(0, 3), col: w })
        prevMonth = d.getMonth()
      }
      break
    }
  }

  return (
    <div className="space-y-4">
      {/* Annual summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Annual P&L',
            value: `${summary.totalPnl >= 0 ? '+' : ''}${formatCurrency(summary.totalPnl)}`,
            color:
              summary.totalPnl >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400',
          },
          { label: 'Trading Days', value: String(summary.tradingDays), color: '' },
          {
            label: 'Win Rate',
            value: summary.tradingDays
              ? `${Math.round((summary.winDays / summary.tradingDays) * 100)}%`
              : 'N/A',
            color: '',
          },
          { label: 'Total Trades', value: String(summary.totalTrades), color: '' },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/60">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={cn('text-sm font-bold mt-0.5', stat.color)}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        <span>Less</span>
        {[
          { bg: 'bg-muted', title: 'No trades' },
          { style: { background: 'oklch(0.72 0.14 145)' }, title: 'Small profit' },
          { style: { background: 'oklch(0.60 0.18 145)' }, title: 'Medium profit' },
          { style: { background: 'oklch(0.52 0.2 145)' }, title: 'Large profit' },
        ].map((item, i) => (
          <div
            key={i}
            title={item.title}
            className={cn('h-3.5 w-3.5 rounded-sm border border-border/30', item.bg)}
            style={item.style}
          />
        ))}
        <span>Profit |</span>
        {[
          { style: { background: 'oklch(0.72 0.16 25)' }, title: 'Small loss' },
          { style: { background: 'oklch(0.60 0.20 25)' }, title: 'Medium loss' },
          { style: { background: 'oklch(0.52 0.22 25)' }, title: 'Large loss' },
        ].map((item, i) => (
          <div
            key={i}
            title={item.title}
            className="h-3.5 w-3.5 rounded-sm border border-border/30"
            style={item.style}
          />
        ))}
        <span>Loss · More</span>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto scrollbar-thin pb-2">
        <div style={{ minWidth: `${totalWeeks * 16}px` }}>
          {/* Month labels */}
          <div className="relative h-5 mb-1">
            {monthStarts.map(({ month, col }) => (
              <span
                key={`${month}-${col}`}
                className="absolute text-[10px] text-muted-foreground font-medium"
                style={{ left: `${col * 16}px` }}
              >
                {month}
              </span>
            ))}
          </div>

          <div className="flex gap-0.5">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-0.5 mr-1 shrink-0">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div
                  key={i}
                  className="h-3 w-3 flex items-center justify-center text-[9px] text-muted-foreground"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map(({ dateStr, pnl }, di) => {
                  const hasData = dateStr && MOCK_DATA.has(dateStr)
                  return (
                    <button
                      key={di}
                      id={dateStr ? `heatmap-${dateStr}` : undefined}
                      type="button"
                      aria-label={
                        dateStr
                          ? `${dateStr}: ${pnl !== undefined ? formatCurrency(pnl) : 'no data'}`
                          : undefined
                      }
                      disabled={!hasData}
                      onClick={() => hasData && onSelectDay(dateStr)}
                      onMouseEnter={(e) => {
                        if (!dateStr) return
                        const rect = (e.target as HTMLElement).getBoundingClientRect()
                        setTooltip({ dateStr, x: rect.left, y: rect.top })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      style={heatmapStyle(dateStr ? pnl : undefined)}
                      className={cn(
                        'h-3 w-3 rounded-[2px] border-0 transition-transform duration-100',
                        hasData && 'cursor-pointer hover:scale-150 hover:z-10',
                        !dateStr && 'invisible'
                      )}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip &&
        (() => {
          const day = MOCK_DATA.get(tooltip.dateStr)
          if (!day) return null
          const fmtDate = new Date(`${tooltip.dateStr}T00:00:00`).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
          return (
            <div
              className="fixed z-50 pointer-events-none bg-popover text-popover-foreground text-xs rounded-lg shadow-xl px-3 py-2 border border-border"
              style={{ top: tooltip.y - 70, left: tooltip.x - 60 }}
            >
              <p className="font-semibold">{fmtDate}</p>
              <p className={day.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                {day.pnl >= 0 ? '+' : ''}
                {formatCurrency(day.pnl)}
              </p>
              <p className="text-muted-foreground">{day.tradeCount} trades</p>
            </div>
          )
        })()}
    </div>
  )
}

// ─── Main Page Component ──────────────────────────────────────────────────────

/**
 * CalendarLedger — P&L Calendar view for sandbox mode.
 * Pure in-memory mock data, Jan 2024 → Jun 2025.
 * Supports monthly grid and annual heatmap views with a trade detail drawer.
 */
export default function CalendarLedger() {
  const { user } = useAuthStore()
  const formatCurrency = useMemo(() => makeFormatCurrency(user?.broker), [user?.broker])

  const today = new Date()
  const [view, setView] = useState<ViewMode>('monthly')
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  // Constrain nav to data range: Jan 2024 → Jun 2025
  const canGoPrev = view === 'monthly' ? !(year === 2024 && month === 1) : year > 2024
  const canGoNext = view === 'monthly' ? !(year === 2025 && month === 6) : year < 2025

  const handlePrev = () => {
    if (view === 'monthly') {
      if (month === 1) {
        setYear((y) => y - 1)
        setMonth(12)
      } else setMonth((m) => m - 1)
    } else {
      setYear((y) => y - 1)
    }
  }

  const handleNext = () => {
    if (view === 'monthly') {
      if (month === 12) {
        setYear((y) => y + 1)
        setMonth(1)
      } else setMonth((m) => m + 1)
    } else {
      setYear((y) => y + 1)
    }
  }

  const handleSelectDay = (dateStr: string) => setSelectedDay(dateStr)
  const handleCloseDrawer = () => setSelectedDay(null)

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Calendar Ledger
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visualise your sandbox P&amp;L · Jan 2024 – Jun 2025
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/sandbox">
            <FlaskConical className="h-4 w-4 mr-1.5" />
            Sandbox Config
          </Link>
        </Button>
      </div>

      {/* Controls: view toggle + month/year navigation */}
      <Card className="mb-5 border-border/60">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* View toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden text-sm">
              <button
                id="view-toggle-monthly"
                type="button"
                onClick={() => setView('monthly')}
                className={cn(
                  'px-4 py-1.5 font-medium transition-colors',
                  view === 'monthly'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground'
                )}
              >
                Monthly
              </button>
              <button
                id="view-toggle-annual"
                type="button"
                onClick={() => setView('annual')}
                className={cn(
                  'px-4 py-1.5 font-medium transition-colors',
                  view === 'annual'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground'
                )}
              >
                Annual
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                id="cal-prev-btn"
                type="button"
                disabled={!canGoPrev}
                onClick={handlePrev}
                className="rounded-md p-1.5 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="text-sm font-semibold min-w-[120px] text-center select-none">
                {view === 'monthly' ? `${MONTH_NAMES[month - 1]} ${year}` : String(year)}
              </span>

              <button
                id="cal-next-btn"
                type="button"
                disabled={!canGoNext}
                onClick={handleNext}
                className="rounded-md p-1.5 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main calendar content */}
      <Card className="border-border/60">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base">
            {view === 'monthly' ? `${MONTH_NAMES[month - 1]} ${year}` : `${year} — Full Year`}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-5">
          {view === 'monthly' ? (
            <MonthlyView
              year={year}
              month={month}
              onSelectDay={handleSelectDay}
              formatCurrency={formatCurrency}
            />
          ) : (
            <AnnualView year={year} onSelectDay={handleSelectDay} formatCurrency={formatCurrency} />
          )}
        </CardContent>
      </Card>

      {/* Trade detail drawer */}
      <TradeDrawer
        dateStr={selectedDay}
        onClose={handleCloseDrawer}
        formatCurrency={formatCurrency}
      />
    </div>
  )
}
