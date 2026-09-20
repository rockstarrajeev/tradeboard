import {
  Activity,
  ArrowRight,
  BarChart2,
  BarChart3,
  Box,
  Briefcase,
  Calendar,
  Cpu,
  GitCommit,
  History,
  Layers,
  LineChart,
  PieChart,
  Scale,
  Search,
  Sliders,
  Smile,
  Target,
  TrendingUp,
  Waves,
  Wrench,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Emblem3D } from '@/components/ui/Emblem3D'
import { tools, type ToolCategory } from '@/lib/tools'
import { cn } from '@/lib/utils'

// Icon mapping per tool route
const toolIconMap: Record<string, typeof Cpu> = {
  '/strategybuilder': Cpu,
  '/strategybuilder/portfolio': Briefcase,
  '/portfolio-backtester': History,
  '/sip-backtester': Calendar,
  '/portfolio-analyzer': PieChart,
  '/optionchain': Layers,
  '/ivchart': Activity,
  '/oitracker': BarChart2,
  '/oirange': Sliders,
  '/maxpain': Target,
  '/straddle': GitCommit,
  '/straddlepnl': TrendingUp,
  '/volsurface': Box,
  '/gex': Zap,
  '/gammadensity': Waves,
  '/ivsmile': Smile,
  '/oiprofile': BarChart3,
  '/arbitrage': Scale,
}

const categories: Array<'All' | ToolCategory> = [
  'All',
  'Options',
  'Greeks & Vol',
  'Analysis',
  'Backtesting',
  'Arbitrage',
]

export default function Tools() {
  const [selectedCategory, setSelectedCategory] = useState<'All' | ToolCategory>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'All' || tool.category === selectedCategory
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.badge.toLowerCase().includes(query)

      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  return (
    <div className="space-y-8 md:space-y-10">
      {/* Header matching Dashboard */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-contrast-heading flex items-center gap-3">
            <Wrench className="h-7 w-7 md:h-8 md:w-8 text-primary shrink-0" />
            Analytical Tools
          </h1>
          <p className="text-contrast-subtext mt-1 text-sm md:text-base font-medium">
            Advanced options simulators, Greeks telemetry, volatility surfaces, and quantitative scanners
          </p>
        </div>

        {/* Counter Chip */}
        <div className="flex items-center gap-3 glass-card px-4 py-2.5 w-fit lg:ml-auto lg:self-center shadow-xs">
          <span className="text-xs md:text-sm font-semibold text-contrast-label whitespace-nowrap">
            Tool Engines:
          </span>
          <div className="flex items-center gap-2">
            <Emblem3D variant="slate" size="sm" className="h-6 w-6 min-w-[24px]">
              <div className="h-2 w-2 rounded-full bg-white shadow-xs" />
            </Emblem3D>
            <span className="text-xs md:text-sm font-bold text-contrast-heading">
              {tools.length} Available
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const count =
              cat === 'All'
                ? tools.length
                : tools.filter((t) => t.category === cat).length
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-md scale-105'
                    : 'glass-card text-contrast-subtext hover:text-contrast-heading hover:bg-white/10 dark:hover:bg-white/5'
                )}
              >
                <span>{cat}</span>
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full',
                    isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-white/10'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl glass-card text-contrast-heading placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary border border-white/10"
          />
        </div>
      </div>

      {/* Tool Cards Grid */}
      {filteredTools.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <p className="text-contrast-subtext text-base">
            No analytical tools match &quot;{searchQuery}&quot;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredTools.map((tool) => {
            const glowClass = `glass-glow-${tool.emblemVariant}`
            const IconComponent = toolIconMap[tool.href] || LineChart

            return (
              <Link key={tool.href} to={tool.href} className="block h-full group">
                <div
                  className={cn(
                    'glass-card glass-card-interactive group p-5 md:p-6 h-full flex flex-col justify-between gap-5',
                    glowClass
                  )}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Emblem3D
                        icon={IconComponent}
                        variant={tool.emblemVariant}
                        size="md"
                        floating
                        className="group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md"
                      />
                      <Badge variant="glass" className="text-[11px] font-bold">
                        {tool.badge}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg md:text-xl text-contrast-heading group-hover:text-primary transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-contrast-subtext mt-1.5 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-xs font-semibold text-contrast-label uppercase tracking-wider">
                      {tool.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary/90 group-hover:text-primary group-hover:translate-x-1 transition-all">
                      Open tool
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
