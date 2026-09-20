import type React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type EmblemVariant =
  | 'emerald'
  | 'rose'
  | 'violet'
  | 'cyan'
  | 'amber'
  | 'indigo'
  | 'blue'
  | 'orange'
  | 'slate'

export type EmblemSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface Emblem3DProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  variant?: EmblemVariant
  size?: EmblemSize
  floating?: boolean
  pulse?: boolean
  iconClassName?: string
  children?: React.ReactNode
}

const sizeClasses: Record<EmblemSize, { container: string; icon: string }> = {
  xs: {
    container: 'h-6 w-6 min-w-[24px] rounded-lg emblem-xs',
    icon: 'h-3.5 w-3.5',
  },
  sm: {
    container: 'h-8 w-8 min-w-[32px] rounded-lg emblem-sm',
    icon: 'h-4 w-4',
  },
  md: {
    container: 'h-11 w-11 min-w-[44px] rounded-xl emblem-md',
    icon: 'h-5 w-5',
  },
  lg: {
    container: 'h-14 w-14 min-w-[56px] rounded-2xl emblem-lg',
    icon: 'h-7 w-7',
  },
  xl: {
    container: 'h-18 w-18 min-w-[72px] rounded-2xl emblem-xl',
    icon: 'h-9 w-9',
  },
}

const variantClasses: Record<EmblemVariant, string> = {
  emerald: 'emblem-emerald',
  rose: 'emblem-rose',
  violet: 'emblem-violet',
  cyan: 'emblem-cyan',
  amber: 'emblem-amber',
  indigo: 'emblem-indigo',
  blue: 'emblem-blue',
  orange: 'emblem-orange',
  slate: 'emblem-slate',
}

export function Emblem3D({
  icon: Icon,
  variant = 'indigo',
  size = 'md',
  floating = false,
  pulse = false,
  className,
  iconClassName,
  children,
  ...props
}: Emblem3DProps) {
  const sizeConfig = sizeClasses[size]
  const variantClass = variantClasses[variant]

  return (
    <div
      className={cn(
        'emblem-3d',
        sizeConfig.container,
        variantClass,
        floating && 'animate-float-subtle',
        pulse && 'animate-pulse-glow',
        className
      )}
      {...props}
    >
      <div className="emblem-3d-inner">
        {Icon ? <Icon className={cn(sizeConfig.icon, iconClassName)} /> : children}
      </div>
    </div>
  )
}
