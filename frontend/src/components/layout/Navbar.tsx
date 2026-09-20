import { BarChart3, BookOpen, LogOut, Menu, Moon, Sun, Zap } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { authApi } from '@/api/auth'
import { LogoutConfirmDialog } from '@/components/auth/LogoutConfirmDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { isActiveRoute, mobileSheetItems, navItems } from '@/config/navigation'
import { useProfileMenuItems } from '@/hooks/useProfileMenuItems'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { showToast } from '@/utils/toast'
import { Emblem3D, type EmblemVariant } from '@/components/ui/Emblem3D'

const navItemEmblems: Record<string, EmblemVariant> = {
  '/dashboard': 'indigo',
  '/orderbook': 'blue',
  '/tradebook': 'violet',
  '/positions': 'emerald',
  '/trading': 'cyan',
  '/platforms': 'violet',
  '/strategy': 'amber',
  '/logs': 'orange',
  '/tools': 'slate',
  '/profile': 'indigo',
  '/apikey': 'amber',
  '/action-center': 'rose',
  '/agent': 'cyan',
  '/master-contract': 'emerald',
  '/telegram': 'blue',
  '/whatsapp': 'emerald',
  '/holdings': 'indigo',
  '/flow': 'violet',
  '/scalping': 'orange',
  '/python': 'blue',
  '/pnl-tracker': 'emerald',
  '/historify': 'slate',
  '/search/token': 'cyan',
  '/sandbox': 'amber',
  '/leverage': 'violet',
  '/admin': 'slate',
}

interface NavbarProps {
  /**
   * Span the full viewport instead of the centred, width-capped container.
   *
   * Pages rendered inside Layout share its `container mx-auto`, so the nav
   * lines up with the content below it and this stays false. Full-bleed pages
   * under FullWidthLayout render this navbar themselves and have no such
   * container, so a capped nav floats inset above edge-to-edge content -- on a
   * 1920px screen Tailwind caps `container` at 1536px, leaving ~192px of gutter
   * each side while the page fills the width.
   */
  fluid?: boolean
}

export function Navbar({ fluid = false }: NavbarProps = {}) {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const { mode, appMode, toggleMode, toggleAppMode, isTogglingMode } = useThemeStore()
  const { user, logout } = useAuthStore()

  // Profile menu filtered by broker capabilities (shared hook, issue #1480)
  const filteredProfileMenuItems = useProfileMenuItems()

  const handleLogout = async () => {
    try {
      await authApi.logout()
      logout()
      navigate('/login')
      showToast.success('Logged out successfully')
    } catch {
      logout()
      navigate('/login')
    }
  }

  const handleModeToggle = async () => {
    const result = await toggleAppMode()
    if (result.success) {
      const newMode = useThemeStore.getState().appMode
      showToast.success(`Switched to ${newMode === 'live' ? 'Live' : 'Analyze'} mode`)

      // Show warning toast when enabling analyzer mode (like old UI)
      if (newMode === 'analyzer') {
        setTimeout(() => {
          showToast.warning('Analyzer (Sandbox) mode is for testing purposes only', undefined, {
            duration: 10000,
          })
        }, 2000)
      }
    } else {
      showToast.error(result.message || 'Failed to toggle mode')
    }
  }

  const isActive = (href: string) => isActiveRoute(location.pathname, href)

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl border-white/10 dark:border-white/10 shadow-xs transition-all duration-300">
      <div
        className={cn(
          'px-4 flex h-14 items-center',
          fluid ? 'w-full' : 'container mx-auto'
        )}
      >
        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2 min-h-[44px] min-w-[44px]">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 overflow-y-auto glass-card">
            {/* Visually hidden but accessible for screen readers */}
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>Main navigation and quick access links</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4 py-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2.5 px-2"
                onClick={() => setMobileOpen(false)}
              >
                <img
                  src="/logo.png"
                  alt="Tradeboard"
                  className="h-8 w-8 shrink-0 object-contain drop-shadow-[0_0_8px_rgba(0,180,255,0.4)]"
                />
                <span className="font-black text-lg bg-gradient-to-r from-orange-400 via-[#FF6B00] to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(255,107,0,0.4)]">
                  Tradeboard
                </span>
              </Link>

              {/* Secondary nav items (not in bottom nav) */}
              <nav className="flex flex-col gap-1">
                <div className="px-3 py-2 text-xs font-bold text-[#FF6B00] dark:text-[#FF7700] uppercase tracking-wider">
                  Navigation
                </div>
                {mobileSheetItems.map((item) => {
                  const active = isActive(item.href)
                  const cls = cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all min-h-[44px] touch-manipulation active:scale-[0.98]',
                    active
                      ? 'bg-[#FF6B00]/15 text-[#FF6B00] dark:text-[#FF7700] border border-[#FF6B00]/40 shadow-[0_0_12px_rgba(255,107,0,0.25)] font-bold'
                      : 'text-contrast-subtext hover:text-[#FF6B00] dark:hover:text-[#FF7700] hover:bg-[#FF6B00]/10 active:bg-muted'
                  )
                  const inner = (
                    <>
                      <Emblem3D
                        icon={item.icon}
                        variant={navItemEmblems[item.href] || 'indigo'}
                        size="xs"
                        pulse={active}
                        className="shrink-0 shadow-xs"
                      />
                      <span>{item.label}</span>
                    </>
                  )
                  return item.external ? (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cls}
                      aria-current={active ? 'page' : undefined}
                    >
                      {inner}
                    </a>
                  ) : (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cls}
                      aria-current={active ? 'page' : undefined}
                    >
                      {inner}
                    </Link>
                  )
                })}
              </nav>

              {/* Profile menu items for mobile access */}
              <nav className="flex flex-col gap-1 border-t border-white/10 pt-4">
                <div className="px-3 py-2 text-xs font-bold text-[#FF6B00] dark:text-[#FF7700] uppercase tracking-wider">
                  Quick Access
                </div>
                {filteredProfileMenuItems.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all min-h-[44px] touch-manipulation active:scale-[0.98]',
                        active
                          ? 'bg-[#FF6B00]/15 text-[#FF6B00] dark:text-[#FF7700] border border-[#FF6B00]/40 shadow-[0_0_12px_rgba(255,107,0,0.25)] font-bold'
                          : 'text-contrast-subtext hover:text-[#FF6B00] dark:hover:text-[#FF7700] hover:bg-[#FF6B00]/10 active:bg-muted'
                      )}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Emblem3D
                        icon={item.icon}
                        variant={navItemEmblems[item.href] || 'slate'}
                        size="xs"
                        pulse={active}
                        className="shrink-0 shadow-xs"
                      />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
                <a
                  href="https://docs.algo.wesoftcorp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-contrast-subtext hover:text-[#FF6B00] dark:hover:text-[#FF7700] transition-all min-h-[44px] touch-manipulation hover:bg-[#FF6B00]/10 active:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  <Emblem3D icon={BookOpen} variant="cyan" size="xs" className="shrink-0 shadow-xs" />
                  <span>Docs</span>
                </a>
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 mr-6 group shrink-0">
          <img
            src="/logo.png"
            alt="Tradeboard"
            className="h-8 w-8 shrink-0 object-contain drop-shadow-[0_0_8px_rgba(0,180,255,0.4)] group-hover:scale-105 transition-transform duration-200"
          />
          <span className="hidden font-black tracking-tight sm:inline-block text-lg bg-gradient-to-r from-orange-400 via-[#FF6B00] to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(255,107,0,0.4)]">
            Tradeboard
          </span>
        </Link>

        {/* Desktop Navigation.
            Icon-only between md and xl so all 9 items fit portrait monitors
            and small laptops (768-1280px wide) without squashing or pushing
            the profile menu off-screen; full labels from xl up (issue #1384). */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const className = cn(
              'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all duration-200 active:scale-[0.97] group',
              active
                ? 'bg-[#FF6B00]/15 text-[#FF6B00] dark:text-[#FF7700] border border-[#FF6B00]/40 shadow-[0_0_14px_rgba(255,107,0,0.25)] font-bold'
                : 'text-contrast-label hover:text-[#FF6B00] dark:hover:text-[#FF7700] hover:bg-[#FF6B00]/10'
            )
            const content = (
              <>
                <Emblem3D
                  icon={item.icon}
                  variant={navItemEmblems[item.href] || 'indigo'}
                  size="xs"
                  pulse={active}
                  className={cn(
                    'transition-transform duration-200 shrink-0 shadow-xs',
                    active
                      ? 'scale-105 ring-1 ring-[#FF6B00]/50'
                      : 'opacity-85 group-hover:opacity-100 group-hover:scale-105'
                  )}
                />
                <span className={cn('hidden xl:inline', active && 'drop-shadow-[0_0_8px_rgba(255,107,0,0.35)]')}>
                  {item.label}
                </span>
              </>
            )
            // Flask-served pages (e.g. /trading) need a full page load,
            // not client-side routing.
            return item.external ? (
              <a
                key={item.href}
                href={item.href}
                title={item.label}
                className={className}
                aria-current={active ? 'page' : undefined}
              >
                {content}
              </a>
            ) : (
              <Link
                key={item.href}
                to={item.href}
                title={item.label}
                className={className}
                aria-current={active ? 'page' : undefined}
              >
                {content}
              </Link>
            )
          })}
        </nav>

        {/* Right Side */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
          {/* Broker Badge — hidden below lg to keep the bar within narrow
              (portrait/small-laptop) widths */}
          {user?.broker && (
            <Badge variant="glass" className="hidden lg:flex text-xs font-medium">
              {user.broker}
            </Badge>
          )}

          {/* Mode Badge with 3D tactile LED glow */}
          <Badge
            variant={appMode === 'live' ? 'profit' : 'secondary'}
            className={cn(
              'text-xs transition-all shadow-xs gap-1.5',
              appMode === 'analyzer' &&
                'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40 font-semibold'
            )}
          >
            <span
              className={cn(
                'inline-block h-2 w-2 rounded-full',
                appMode === 'live'
                  ? 'bg-emerald-500 animate-pulse-glow shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                  : 'bg-purple-500 animate-pulse-glow shadow-[0_0_8px_rgba(168,85,247,0.8)]'
              )}
            />
            <span className="hidden lg:inline">
              {appMode === 'live' ? 'Live Mode' : 'Analyze Mode'}
            </span>
            <span className="lg:hidden">{appMode === 'live' ? 'Live' : 'Analyze'}</span>
          </Badge>

          {/* Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-white/10 dark:hover:bg-white/10"
            onClick={handleModeToggle}
            disabled={isTogglingMode}
            title={`Switch to ${appMode === 'live' ? 'Analyze' : 'Live'} mode`}
            aria-label={`Switch to ${appMode === 'live' ? 'Analyze' : 'Live'} mode`}
          >
            {isTogglingMode ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : appMode === 'live' ? (
              <Zap className="h-4 w-4 text-emerald-500" />
            ) : (
              <BarChart3 className="h-4 w-4 text-purple-400" />
            )}
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-white/10 dark:hover:bg-white/10"
            onClick={toggleMode}
            disabled={appMode !== 'live'}
            title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {mode === 'light' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-400" />}
          </Button>

          {/* Profile Dropdown with 3D tactile button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-sm hover:scale-105 transition-transform border border-white/20"
                aria-label="Open user menu"
              >
                <span className="text-sm font-bold">
                  {user?.username?.[0]?.toUpperCase() || 'O'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-card">
              {filteredProfileMenuItems.map((item) =>
                item.external ? (
                  <DropdownMenuItem key={item.href} asChild className="cursor-pointer">
                    <a href={item.href} className="flex items-center gap-2.5">
                      <Emblem3D
                        icon={item.icon}
                        variant={navItemEmblems[item.href] || 'slate'}
                        size="xs"
                        className="shrink-0 shadow-xs"
                      />
                      <span>{item.label}</span>
                    </a>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    key={item.href}
                    onSelect={() => navigate(item.href)}
                    className="cursor-pointer flex items-center gap-2.5"
                  >
                    <Emblem3D
                      icon={item.icon}
                      variant={navItemEmblems[item.href] || 'slate'}
                      size="xs"
                      className="shrink-0 shadow-xs"
                    />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                )
              )}
              <DropdownMenuItem asChild className="cursor-pointer">
                <a
                  href="https://docs.algo.wesoftcorp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5"
                >
                  <Emblem3D icon={BookOpen} variant="cyan" size="xs" className="shrink-0 shadow-xs" />
                  <span>Docs</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowLogoutDialog(true)}
                className="text-destructive focus:text-destructive flex items-center gap-2.5 cursor-pointer"
              >
                <Emblem3D icon={LogOut} variant="rose" size="xs" className="shrink-0 shadow-xs" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <LogoutConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogout}
      />
    </nav>
  )
}
