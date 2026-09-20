import { ArrowRight, BarChart3, Layers, Lightbulb, LineChart } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Emblem3D, type EmblemVariant } from '@/components/ui/Emblem3D'
import { cn } from '@/lib/utils'

interface PlatformConfig {
  title: string
  description: string
  detail: string
  icon: typeof BarChart3
  href: string
  emblemVariant: EmblemVariant
  badge: string
}

export default function Platforms() {
  const platforms: PlatformConfig[] = [
    {
      title: 'TradingView',
      description: 'Advanced charting with Pine Script alerts and instant webhook order execution',
      detail: 'Webhook & Pine Alerts',
      icon: BarChart3,
      href: '/tradingview',
      emblemVariant: 'blue',
      badge: 'TradingView Alerts',
    },
    {
      title: 'GoCharting',
      description: 'Professional HTML5 charting, order flow, and foot-print bars for Indian markets',
      detail: 'HTML5 Webhook Engine',
      icon: LineChart,
      href: '/gocharting',
      emblemVariant: 'cyan',
      badge: 'Order Flow & DOM',
    },
    {
      title: 'Chartink',
      description: 'Custom multi-timeframe stock screeners with technical scan automation triggers',
      detail: 'Scanner Automation',
      icon: Lightbulb,
      href: '/chartink',
      emblemVariant: 'orange',
      badge: 'Scan Webhooks',
    },
  ]

  return (
    <div className="space-y-8 md:space-y-10">
      {/* Header matching Dashboard */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-contrast-heading flex items-center gap-3">
            <Layers className="h-7 w-7 md:h-8 md:w-8 text-primary shrink-0" />
            Trading Platforms
          </h1>
          <p className="text-contrast-subtext mt-1 text-sm md:text-base font-medium">
            Connect your favorite charting and screening platforms with Tradeboard for automated trading
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-3 glass-card px-4 py-2.5 w-fit lg:ml-auto lg:self-center shadow-xs">
          <span className="text-xs md:text-sm font-semibold text-contrast-label whitespace-nowrap">
            Gateway Status:
          </span>
          <div className="flex items-center gap-2">
            <Emblem3D variant="violet" size="sm" pulse className="h-6 w-6 min-w-[24px]">
              <div className="h-2 w-2 rounded-full bg-white shadow-xs" />
            </Emblem3D>
            <span className="text-xs md:text-sm font-bold text-violet-600 dark:text-violet-400">
              Webhooks Active
            </span>
          </div>
        </div>
      </div>

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {platforms.map((platform) => {
          const glowClass = `glass-glow-${platform.emblemVariant}`
          return (
            <Link key={platform.href} to={platform.href} className="block h-full group">
              <div
                className={cn(
                  'glass-card glass-card-interactive group p-5 md:p-6 h-full flex flex-col justify-between gap-5',
                  glowClass
                )}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Emblem3D
                      icon={platform.icon}
                      variant={platform.emblemVariant}
                      size="md"
                      floating
                      className="group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md"
                    />
                    <Badge variant="glass" className="text-[11px] font-bold">
                      {platform.badge}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg md:text-xl text-contrast-heading group-hover:text-primary transition-colors">
                      {platform.title}
                    </h3>
                    <p className="text-sm text-contrast-subtext mt-1.5 leading-relaxed">
                      {platform.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-xs font-medium text-contrast-label">
                    {platform.detail}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary/90 group-hover:text-primary group-hover:translate-x-1 transition-all">
                    Configure {platform.title}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Getting Started Glass Panel */}
      <div className="glass-card glass-glow-amber p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5">
        <div className="flex items-start gap-4">
          <Emblem3D variant="amber" icon={Lightbulb} size="md" floating />
          <div>
            <h3 className="text-base font-bold text-contrast-heading">
              Webhook Architecture & Getting Started
            </h3>
            <p className="text-sm text-contrast-subtext mt-1 max-w-2xl leading-relaxed">
              Each charting platform dispatches webhook alerts directly into Tradeboard's execution gateway.
              Click any platform above to generate unique webhook endpoints, JSON payloads, and automated order rules.
            </p>
          </div>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="gap-1.5 shrink-0 font-bold border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400"
        >
          <a href="https://docs.algo.wesoftcorp.com" target="_blank" rel="noopener noreferrer">
            View Documentation
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
    </div>
  )
}
