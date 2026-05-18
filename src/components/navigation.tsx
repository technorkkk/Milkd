'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Droplets, Wallet, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/',
    label: 'Home',
    icon: Home,
    activeIcon: Home,
  },
  {
    href: '/customers',
    label: 'Customers',
    icon: Users,
    activeIcon: Users,
  },
  {
    href: '/deliveries',
    label: 'Deliveries',
    icon: Droplets,
    activeIcon: Droplets,
  },
  {
    href: '/payments',
    label: 'Payments',
    icon: Wallet,
    activeIcon: Wallet,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    activeIcon: Settings,
  },
]

export function BottomNavigation() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="glass fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = active ? item.activeIcon : item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'touch-target relative flex flex-col items-center justify-center gap-0.5 rounded-btn px-3 py-1.5 transition-colors duration-200',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative flex items-center justify-center">
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -inset-2 rounded-full bg-primary/10"
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}
                <Icon
                  className={cn(
                    'relative z-10 h-5 w-5 transition-all duration-200',
                    active ? 'stroke-[2.5px]' : 'stroke-[1.5px]'
                  )}
                />
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium leading-tight transition-all duration-200',
                  active ? 'opacity-100' : 'opacity-60'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

/**
 * Spacer component to add bottom padding for the navigation bar.
 * Place this at the bottom of each page's scrollable content.
 */
export function NavSpacer() {
  return (
    <div
      className="flex-shrink-0"
      style={{ height: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}
    />
  )
}
