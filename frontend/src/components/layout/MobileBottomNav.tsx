import { Link, useLocation } from 'react-router'
import { bottomNavItems, isActiveRoute } from '@/config/navigation'
import { cn } from '@/lib/utils'
import { Emblem3D, type EmblemVariant } from '@/components/ui/Emblem3D'

const bottomNavEmblems: Record<string, EmblemVariant> = {
  '/dashboard': 'indigo',
  '/orderbook': 'blue',
  '/tradebook': 'violet',
  '/positions': 'emerald',
}

export function MobileBottomNav() {
  const location = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-xl border-white/10 dark:border-white/10 shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {bottomNavItems.map((item) => {
          const active = isActiveRoute(location.pathname, item.href)
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] px-3 py-1.5 rounded-xl transition-all duration-200 touch-manipulation active:scale-95 group',
                active
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground active:bg-white/10'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Emblem3D
                icon={item.icon}
                variant={bottomNavEmblems[item.href] || 'indigo'}
                size="xs"
                pulse={active}
                className={cn(
                  'transition-transform duration-200 shrink-0 shadow-xs',
                  active ? 'scale-110 ring-1 ring-primary/40' : 'opacity-75 group-hover:opacity-100'
                )}
              />
              <span className="text-[10px] tracking-tight font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
