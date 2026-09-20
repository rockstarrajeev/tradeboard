import type * as React from 'react'
import { cn } from '@/lib/utils'

export interface TradeboardLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  glow?: boolean
}

const sizeMap = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
  xl: 'h-20 w-20',
}

export function TradeboardLogo({
  size = 'sm',
  glow = false,
  className,
  ...props
}: TradeboardLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Tradeboard"
      className={cn(
        sizeMap[size],
        'shrink-0 object-contain transition-transform duration-200',
        glow && 'drop-shadow-[0_0_8px_rgba(0,180,255,0.4)]',
        className
      )}
      {...props}
    />
  )
}
