import {
  Activity,
  ArrowRight,
  ClipboardList,
  FileText,
  FlaskConical,
  HeartPulse,
  Shield,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Emblem3D, type EmblemVariant } from '@/components/ui/Emblem3D'
import { cn } from '@/lib/utils'

interface LogCardConfig {
  title: string
  description: string
  detail: string
  icon: typeof ClipboardList
  href: string
  emblemVariant: EmblemVariant
  countLabel: string
  actionLabel: string
}

export default function LogsIndex() {
  const logCards: LogCardConfig[] = [
    {
      title: 'Live Logs',
      description: 'Stream real-time API order logs with comprehensive request headers and broker payloads',
      detail: 'Live WebSockets & HTTP',
      icon: ClipboardList,
      href: '/logs/live',
      emblemVariant: 'blue',
      countLabel: 'Orders Stream',
      actionLabel: 'Open live logs',
    },
    {
      title: 'Sandbox Logs',
      description: 'Track and simulate paper trading strategies in an isolated risk-free sandbox environment',
      detail: 'Simulated Execution',
      icon: FlaskConical,
      href: '/logs/sandbox',
      emblemVariant: 'violet',
      countLabel: 'Simulation',
      actionLabel: 'Open sandbox',
    },
    {
      title: 'Latency Monitor',
      description: 'Monitor sub-millisecond order execution latency and broker round-trip timings',
      detail: 'Round-Trip Telemetry',
      icon: Zap,
      href: '/logs/latency',
      emblemVariant: 'orange',
      countLabel: 'Telemetry',
      actionLabel: 'View latency',
    },
    {
      title: 'Traffic Monitor',
      description: 'Inspect HTTP endpoint throughput, response times, and active client connections',
      detail: 'Network Performance',
      icon: Activity,
      href: '/logs/traffic',
      emblemVariant: 'cyan',
      countLabel: 'HTTP Traffic',
      actionLabel: 'Inspect traffic',
    },
    {
      title: 'Security Logs',
      description: 'Monitor authentication events, banned IP addresses, and rate-limit guardrails',
      detail: 'WAF & Audit Trail',
      icon: Shield,
      href: '/logs/security',
      emblemVariant: 'rose',
      countLabel: 'Security Audit',
      actionLabel: 'View security',
    },
    {
      title: 'Health Monitor',
      description: 'Inspect system memory, CPU load, open sockets, and database connection pools',
      detail: 'System Diagnostics',
      icon: HeartPulse,
      href: '/health',
      emblemVariant: 'emerald',
      countLabel: 'Diagnostics',
      actionLabel: 'Check health',
    },
  ]

  return (
    <div className="space-y-8 md:space-y-10">
      {/* Header matching Dashboard */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-contrast-heading flex items-center gap-3">
            <FileText className="h-7 w-7 md:h-8 md:w-8 text-primary shrink-0" />
            Logs & Monitoring
          </h1>
          <p className="text-contrast-subtext mt-1 text-sm md:text-base font-medium">
            Access trading logs, monitor system latency, and track infrastructure telemetry
          </p>
        </div>

        {/* Telemetry Status Indicator */}
        <div className="flex items-center gap-3 glass-card px-4 py-2.5 w-fit lg:ml-auto lg:self-center shadow-xs">
          <span className="text-xs md:text-sm font-semibold text-contrast-label whitespace-nowrap">
            System Telemetry:
          </span>
          <div className="flex items-center gap-2">
            <Emblem3D variant="emerald" size="sm" pulse className="h-6 w-6 min-w-[24px]">
              <div className="h-2 w-2 rounded-full bg-white shadow-xs" />
            </Emblem3D>
            <span className="text-xs md:text-sm font-bold text-emerald-600 dark:text-emerald-400">
              Engines Operational
            </span>
          </div>
        </div>
      </div>

      {/* Log Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {logCards.map((card) => {
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
                      {card.countLabel}
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
                    {card.actionLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
