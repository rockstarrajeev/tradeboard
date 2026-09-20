import {
  Activity,
  ArrowRight,
  Bot,
  Calendar,
  Clock,
  Gauge,
  Globe,
  Settings,
  Shield,
  Snowflake,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { adminApi } from '@/api/admin'
import { Badge } from '@/components/ui/badge'
import { Emblem3D, type EmblemVariant } from '@/components/ui/Emblem3D'
import { cn } from '@/lib/utils'
import type { AdminStats } from '@/types/admin'

interface AdminCardConfig {
  title: string
  description: string
  detail: string
  icon: typeof Snowflake
  href: string
  count?: number
  countLabel: string
  emblemVariant: EmblemVariant
}

export default function AdminIndex() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getStats()
        setStats(data)
      } catch (_error) {
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const adminCards: AdminCardConfig[] = [
    {
      title: 'Freeze Quantity',
      description: 'Manage F&O freeze quantity limits for automatic order splitting and execution',
      detail: 'Order Slicing Limits',
      icon: Snowflake,
      href: '/admin/freeze',
      count: stats?.freeze_count,
      countLabel: 'entries',
      emblemVariant: 'blue',
    },
    {
      title: 'Market Holidays',
      description: 'View and manage market holiday schedules across all supported stock exchanges',
      detail: 'Settlement Calendars',
      icon: Calendar,
      href: '/admin/holidays',
      count: stats?.holiday_count,
      countLabel: 'holidays',
      emblemVariant: 'emerald',
    },
    {
      title: 'Market Timings',
      description: 'Configure trading session timings and special schedules like Muhurat trading',
      detail: 'Trading Sessions',
      icon: Clock,
      href: '/admin/timings',
      count: 7,
      countLabel: 'exchanges',
      emblemVariant: 'violet',
    },
    {
      title: 'Security Dashboard',
      description: 'Monitor banned IPs, brute force attempts, token revocations, and rate limits',
      detail: 'WAF & Auth Monitor',
      icon: Shield,
      href: '/logs/security',
      countLabel: 'Security',
      emblemVariant: 'rose',
    },
    {
      title: 'Traffic Dashboard',
      description: 'Monitor HTTP endpoint traffic, response latencies, and request payloads',
      detail: 'Traffic & Queries',
      icon: Activity,
      href: '/logs/traffic',
      countLabel: 'HTTP Monitor',
      emblemVariant: 'cyan',
    },
    {
      title: 'Latency Dashboard',
      description: 'Sub-millisecond broker round-trip execution latency and probe timings',
      detail: 'Network Speeds',
      icon: Zap,
      href: '/logs/latency',
      countLabel: 'Telemetry',
      emblemVariant: 'orange',
    },
    {
      title: 'Diagnostics',
      description: 'System info, errors, latency probes, and downloadable support audit bundle',
      detail: 'System Health',
      icon: Gauge,
      href: '/admin/diagnostics',
      countLabel: 'Diagnostics',
      emblemVariant: 'indigo',
    },
    {
      title: 'Agent Config',
      description: 'LLM providers, model routing, API keys, trading switch, and search tools',
      detail: 'AI Orchestration',
      icon: Bot,
      href: '/agent/config',
      countLabel: 'AI Setup',
      emblemVariant: 'violet',
    },
    {
      title: 'Remote MCP',
      description: 'Authorize external OAuth clients, browse MCP audit logs, and kill switches',
      detail: 'Model Context Protocol',
      icon: Globe,
      href: '/admin/remote-mcp',
      countLabel: 'MCP Hub',
      emblemVariant: 'cyan',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 md:space-y-10">
      {/* Header matching Dashboard */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-contrast-heading flex items-center gap-3">
            <Settings className="h-7 w-7 md:h-8 md:w-8 text-primary shrink-0" />
            Admin Dashboard
          </h1>
          <p className="text-contrast-subtext mt-1 text-sm md:text-base font-medium">
            Manage system settings, market calendars, security policies, and AI configurations
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-3 glass-card px-4 py-2.5 w-fit lg:ml-auto lg:self-center shadow-xs">
          <span className="text-xs md:text-sm font-semibold text-contrast-label whitespace-nowrap">
            System Control:
          </span>
          <div className="flex items-center gap-2">
            <Emblem3D variant="slate" size="sm" className="h-6 w-6 min-w-[24px]">
              <div className="h-2 w-2 rounded-full bg-white shadow-xs" />
            </Emblem3D>
            <span className="text-xs md:text-sm font-bold text-contrast-heading">
              Admin Verified
            </span>
          </div>
        </div>
      </div>

      {/* Admin Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {adminCards.map((card) => {
          const glowClass = `glass-glow-${card.emblemVariant}`
          return (
            <Link key={card.href} to={card.href} className="block h-full group">
              <div
                className={cn(
                  'glass-card glass-card-interactive group p-5 md:p-6 h-full flex flex-col justify-between gap-5',
                  glowClass
                )}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Emblem3D
                      icon={card.icon}
                      variant={card.emblemVariant}
                      size="md"
                      floating
                      className="group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md"
                    />
                    <Badge variant="glass" className="text-[11px] font-bold">
                      {card.count !== undefined ? `${card.count} ${card.countLabel}` : card.countLabel}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg md:text-xl text-contrast-heading group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-contrast-subtext mt-1.5 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-xs font-medium text-contrast-label">
                    {card.detail}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary/90 group-hover:text-primary group-hover:translate-x-1 transition-all">
                    Manage
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Info Section */}
      <div className="glass-card p-6 md:p-8 rounded-2xl space-y-4 border border-white/10">
        <h2 className="text-lg md:text-xl font-bold text-contrast-heading">
          About System Settings & Configuration
        </h2>
        <p className="text-sm text-contrast-subtext leading-relaxed">
          The admin dashboard provides direct control over critical broker limits, exchange holidays, and trading session timings:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <li className="glass-card p-4 rounded-xl border border-white/5 space-y-1">
            <strong className="text-contrast-heading text-sm block">Freeze Quantity Limits</strong>
            <span className="text-xs text-contrast-subtext leading-relaxed block">
              Automated slicing for large F&O orders to respect exchange restrictions without rejections.
            </span>
          </li>
          <li className="glass-card p-4 rounded-xl border border-white/5 space-y-1">
            <strong className="text-contrast-heading text-sm block">Exchange Holidays</strong>
            <span className="text-xs text-contrast-subtext leading-relaxed block">
              Multi-exchange calendar across NSE, BSE, NFO, MCX, and CDS for schedule calculations.
            </span>
          </li>
          <li className="glass-card p-4 rounded-xl border border-white/5 space-y-1">
            <strong className="text-contrast-heading text-sm block">Session Timings</strong>
            <span className="text-xs text-contrast-subtext leading-relaxed block">
              Pre-open, regular market, post-close, and special sessions including Muhurat trading.
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
