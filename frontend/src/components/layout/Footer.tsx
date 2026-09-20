import { Github, Linkedin, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSessionStore } from '@/stores/sessionStore'

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const [version, setVersion] = useState<string>('')
  const activeSessionCount = useSessionStore((s) => s.activeSessionCount)

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await fetch('/auth/app-info')
        const data = await response.json()
        if (data.status === 'success') {
          setVersion(data.version)
        }
      } catch (_error) {}
    }

    fetchVersion()
  }, [])

  return (
    <footer className={cn('mt-auto border-t border-[#FF6B00]/20 bg-muted/20 backdrop-blur-sm', className)}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Copyright 2026</span>
            <span className="hidden md:inline text-[#FF6B00]/50">|</span>
            <a
              href="https://rajeevupadhyay.com"
              className="text-[#FF6B00] dark:text-[#FF7700] hover:text-orange-400 hover:underline font-bold transition-colors drop-shadow-[0_0_6px_rgba(255,107,0,0.2)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Rajeev Upadhyay
            </a>
          </div>
          <span className="text-center font-semibold text-[#FF6B00] dark:text-[#FF7700] drop-shadow-[0_0_8px_rgba(255,107,0,0.25)]">
            Tradeboard - Algorithmic Trading Platform
          </span>
          {version && (
            <>
              <span className="hidden md:inline text-[#FF6B00]/50">|</span>
              <Badge variant="outline" className="gap-1 border-[#FF6B00]/40 bg-[#FF6B00]/10 text-[#FF6B00] dark:text-[#FF7700] font-semibold shadow-[0_0_10px_rgba(255,107,0,0.15)]">
                <span className="opacity-75">v</span>
                <span>{version}</span>
              </Badge>
            </>
          )}
          {activeSessionCount > 0 && (
            <>
              <span className="hidden md:inline text-[#FF6B00]/50">|</span>
              <Badge variant="outline" className="gap-1 border-[#FF6B00]/40 bg-[#FF6B00]/10 text-[#FF6B00] dark:text-[#FF7700] font-semibold shadow-[0_0_10px_rgba(255,107,0,0.15)]">
                <Monitor className="h-3 w-3 text-[#FF6B00]" />
                <span>
                  {activeSessionCount} {activeSessionCount === 1 ? 'session' : 'sessions'}
                </span>
              </Badge>
            </>
          )}
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-[#FF6B00] dark:hover:text-[#FF7700] hover:bg-[#FF6B00]/15 hover:shadow-[0_0_12px_rgba(255,107,0,0.3)] transition-all" title="GitHub">
            <a
              href="https://github.com/rockstarrajeev"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-8 w-8 text-muted-foreground hover:text-[#FF6B00] dark:hover:text-[#FF7700] hover:bg-[#FF6B00]/15 hover:shadow-[0_0_12px_rgba(255,107,0,0.3)] transition-all"
            title="LinkedIn"
          >
            <a
              href="https://www.linkedin.com/in/rajeevrockstar/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-[#FF6B00] dark:hover:text-[#FF7700] hover:bg-[#FF6B00]/15 hover:shadow-[0_0_12px_rgba(255,107,0,0.3)] transition-all" title="Follow us on X">
            <a
              href="https://x.com/rajeevrockstar"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
              </svg>
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-8 w-8 text-muted-foreground hover:text-[#FF6B00] dark:hover:text-[#FF7700] hover:bg-[#FF6B00]/15 hover:shadow-[0_0_12px_rgba(255,107,0,0.3)] transition-all"
            title="Subscribe to YouTube"
          >
            <a
              href="https://www.youtube.com/@RajeevRockstar"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </Button>
        </div>
      </div>
    </footer>
  )
}
