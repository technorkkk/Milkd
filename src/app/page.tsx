'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import {
  Droplets,
  IndianRupee,
  Wallet,
  Users,
  Sun,
  Moon,
  Milk,
} from 'lucide-react'
import { format } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BottomNavigation, NavSpacer } from '@/components/navigation'
import { useDairyStore, type DeliveryItem } from '@/lib/store'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatIndianCurrency(value: number): string {
  return value.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })
}

function formatLiters(value: number): string {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
}: {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
}) {
  const motionVal = useMotionValue(0)
  const display = useTransform(motionVal, (latest) => {
    if (decimals > 0) {
      return `${prefix}${latest.toFixed(decimals)}${suffix}`
    }
    return `${prefix}${formatIndianCurrency(Math.round(latest))}${suffix}`
  })
  const nodeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: Math.min(1.2, 0.3 + Math.abs(value) * 0.0005),
      ease: 'easeOut',
    })
    return controls.stop
  }, [value, motionVal])

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => {
      if (nodeRef.current) nodeRef.current.textContent = v
    })
    return unsubscribe
  }, [display])

  return (
    <span
      ref={nodeRef}
      className="font-number text-2xl font-bold leading-tight tracking-tight"
    >
      {prefix}
      {decimals > 0 ? (0).toFixed(decimals) : '0'}
      {suffix}
    </span>
  )
}

// ─── Motion Variants ──────────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const staggerItem = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0 },
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  prefix,
  suffix,
  decimals,
  colorClass,
  delay = 0,
}: {
  icon: React.ElementType
  label: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  colorClass: string
  delay?: number
}) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
      className="min-w-[148px] flex-shrink-0 snap-start sm:min-w-0"
    >
      <Card className="glass rounded-[16px] border-0 p-4 shadow-lg shadow-black/5 dark:shadow-black/20">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorClass}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 truncate text-xs font-medium text-muted-foreground">
              {label}
            </p>
            <AnimatedCounter
              value={value}
              prefix={prefix ?? ''}
              suffix={suffix ?? ''}
              decimals={decimals ?? 0}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ─── Delivery List Item ───────────────────────────────────────────────────────

function DeliveryRow({ item, index }: { item: DeliveryItem; index: number }) {
  const isCow = item.milkType === 'COW'

  return (
    <motion.div
      variants={staggerItem}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="glass flex items-center gap-3 rounded-[14px] border-0 px-4 py-3"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {item.customerName}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <Badge
            className={`h-5 rounded-md px-1.5 text-[10px] font-bold ${
              isCow
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                : 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
            } border-0`}
          >
            {item.milkType}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatLiters(item.liters)} L
          </span>
        </div>
      </div>
      <span className="font-number text-sm font-bold text-foreground">
        ₹{formatIndianCurrency(item.amount)}
      </span>
    </motion.div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ shift }: { shift: 'morning' | 'evening' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-border py-10"
    >
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        {shift === 'morning' ? (
          <Sun className="h-7 w-7 text-amber-400" />
        ) : (
          <Moon className="h-7 w-7 text-indigo-400" />
        )}
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        No {shift} deliveries yet
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        {shift === 'morning'
          ? "Today's morning entries will appear here"
          : "Today's evening entries will appear here"}
      </p>
    </motion.div>
  )
}

// ─── Delivery Section ─────────────────────────────────────────────────────────

function DeliverySection({
  title,
  shift,
  deliveries,
  icon: Icon,
  iconColor,
  badgeLabel,
}: {
  title: string
  shift: 'morning' | 'evening'
  deliveries: DeliveryItem[]
  icon: React.ElementType
  iconColor: string
  badgeLabel: string
}) {
  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="mb-3 flex items-center gap-2">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <h2 className="font-heading text-base font-bold text-foreground">
          {title}
        </h2>
        <Badge
          variant="secondary"
          className="ml-auto rounded-md text-[10px] font-semibold"
        >
          {badgeLabel}
        </Badge>
      </div>

      {deliveries.length === 0 ? (
        <EmptyState shift={shift} />
      ) : (
        <motion.div
          className="flex flex-col gap-2"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {deliveries.map((d, i) => (
            <DeliveryRow key={d.id} item={d} index={i} />
          ))}
        </motion.div>
      )}
    </motion.section>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5 px-4 pt-4 pb-2">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-28 rounded-md" />
        </div>
        <Skeleton className="h-5 w-24 rounded-md" />
      </div>

      {/* Stat cards skeleton */}
      <div className="flex gap-3 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="min-w-[148px] flex-shrink-0">
            <div className="rounded-[16px] bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="mb-2 h-3 w-20 rounded" />
                  <Skeleton className="h-7 w-16 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Outstanding & Customers skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-[16px] bg-card p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-3 w-20 rounded" />
                <Skeleton className="h-7 w-16 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Morning skeleton */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-32 rounded" />
        </div>
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-[14px] bg-card px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton className="mb-2 h-4 w-24 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
                <Skeleton className="h-4 w-14 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav spacer */}
      <NavSpacer />
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const {
    dashboard,
    loadingDashboard,
    fetchDashboard,
  } = useDairyStore()

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const today = new Date()
  const dateLabel = format(today, 'EEE, dd MMM')

  if (!dashboard && loadingDashboard) {
    return (
      <>
        <DashboardSkeleton />
        <BottomNavigation />
      </>
    )
  }

  // Dashboard failed to load - show retry UI
  if (!dashboard && !loadingDashboard) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-secondary">
            <Droplets className="size-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Could not load dashboard
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-[260px] text-center">
            Something went wrong. Please try again.
          </p>
          <Button
            onClick={() => fetchDashboard()}
            className="mt-4 rounded-btn gap-2"
          >
            Retry
          </Button>
        </div>
        <BottomNavigation />
      </>
    )
  }

  const d = dashboard!

  const outstandingPositive = d.totalOutstanding > 0

  return (
    <>
      <div className="flex flex-col gap-5 px-4 pt-4 pb-2">
        {/* ── Header Bar ──────────────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
              <Droplets className="h-5 w-5 text-primary" />
            </div>
            <h1 className="font-heading text-xl font-bold text-foreground">
              Milk Dairy
            </h1>
          </div>
          <time className="font-number text-sm font-medium text-muted-foreground">
            {dateLabel}
          </time>
        </motion.header>

        {/* ── Stat Cards Row ─────────────────────────────────────────────── */}
        <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 snap-x snap-mandatory sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
          <StatCard
            icon={Droplets}
            label="Today's Deliveries"
            value={d.todayDeliveries}
            colorClass="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            delay={0}
          />
          <StatCard
            icon={Milk}
            label="Today's Liters"
            value={d.todayLiters}
            suffix=" L"
            decimals={1}
            colorClass="bg-sky-500/15 text-sky-600 dark:text-sky-400"
            delay={0.08}
          />
          <StatCard
            icon={IndianRupee}
            label="Today's Amount"
            value={d.todayAmount}
            prefix="₹"
            colorClass="bg-amber-500/15 text-amber-600 dark:text-amber-400"
            delay={0.16}
          />
          <StatCard
            icon={Wallet}
            label="Collections"
            value={d.todayCollections}
            prefix="₹"
            colorClass="bg-purple-500/15 text-purple-600 dark:text-purple-400"
            delay={0.24}
          />
        </div>

        {/* ── Outstanding & Customers Row ────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.45, delay: 0.3, ease: 'easeOut' }}
          >
            <Card className="glass h-full rounded-[16px] border-0 p-4 shadow-lg shadow-black/5 dark:shadow-black/20">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    outstandingPositive
                      ? 'bg-red-500/15 text-red-500 dark:text-red-400'
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  <IndianRupee className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 truncate text-xs font-medium text-muted-foreground">
                    Outstanding
                  </p>
                  <AnimatedCounter
                    value={Math.abs(d.totalOutstanding)}
                    prefix={d.totalOutstanding < 0 ? '-₹' : '₹'}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.45, delay: 0.38, ease: 'easeOut' }}
          >
            <Card className="glass h-full rounded-[16px] border-0 p-4 shadow-lg shadow-black/5 dark:shadow-black/20">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
                  <Users className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 truncate text-xs font-medium text-muted-foreground">
                    Total Customers
                  </p>
                  <AnimatedCounter value={d.totalCustomers} />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ── Morning Deliveries Section ─────────────────────────────────── */}
        <DeliverySection
          title="Morning Deliveries"
          shift="morning"
          deliveries={d.morningDeliveries}
          icon={Sun}
          iconColor="text-amber-500"
          badgeLabel={`${d.morningDeliveries.length} entries`}
        />

        {/* ── Evening Deliveries Section ─────────────────────────────────── */}
        <DeliverySection
          title="Evening Deliveries"
          shift="evening"
          deliveries={d.eveningDeliveries}
          icon={Moon}
          iconColor="text-indigo-400"
          badgeLabel={`${d.eveningDeliveries.length} entries`}
        />

        {/* ── Bottom Navigation Spacer ───────────────────────────────────── */}
        <NavSpacer />
      </div>

      <BottomNavigation />
    </>
  )
}
