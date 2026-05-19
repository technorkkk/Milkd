'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Moon,
  Sun,
  DollarSign,
  Trash2,
  HelpCircle,
  AlertTriangle,
  Phone,
  Mail,
  Save,
  Building2,
  Users,
  Droplets,
  Wallet,
} from 'lucide-react'
import { useDairyStore } from '@/lib/store'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { BottomNavigation, NavSpacer } from '@/components/navigation'
import { toast } from 'sonner'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatIndianCurrency(value: number): string {
  return '₹' + value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className={`rounded-[16px] border-border bg-card p-4 gap-0 ${className}`}>
        {children}
      </Card>
    </motion.div>
  )
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="size-4 text-primary" />
      <h2 className="font-heading text-sm font-bold text-foreground">{title}</h2>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const {
    settings,
    fetchSettings,
    updateSettings,
    milkPrices,
    fetchMilkPrices,
    updateMilkPrices,
    resetData,
  } = useDairyStore()

  const { theme, setTheme } = useTheme()

  // Business info form
  const [businessName, setBusinessName] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [savingBusiness, setSavingBusiness] = useState(false)

  // Milk prices form
  const [cowPrice, setCowPrice] = useState('')
  const [buffaloPrice, setBuffaloPrice] = useState('')
  const [savingPrices, setSavingPrices] = useState(false)

  // Dark mode
  const [isDark, setIsDark] = useState(false)

  // Reset dialog
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetType, setResetType] = useState<'ALL' | 'CUSTOMERS' | 'DELIVERIES' | 'PAYMENTS' | null>(null)
  const [resetConfirmText, setResetConfirmText] = useState('')
  const [isResetting, setIsResetting] = useState(false)

  // Fetch data on mount
  useEffect(() => {
    fetchSettings()
    fetchMilkPrices()
  }, [fetchSettings, fetchMilkPrices])

  // Load business info
  useEffect(() => {
    async function loadBusiness() {
      try {
        const res = await fetch('/api/business')
        if (res.ok) {
          const data = await res.json()
          setBusinessName(data.name || '')
          setBusinessPhone(data.phone || '')
          setBusinessAddress(data.address || '')
        }
      } catch (error) {
        console.error('Failed to load business info:', error)
      }
    }
    loadBusiness()
  }, [])

  // Sync dark mode with theme + persist to database
  useEffect(() => {
    setIsDark(theme === 'dark')
  }, [theme])

  // Load milk prices into form
  useEffect(() => {
    if (milkPrices.length > 0) {
      const cow = milkPrices.find((p) => p.type === 'COW')
      const buffalo = milkPrices.find((p) => p.type === 'BUFFALO')
      if (cow) setCowPrice(String(cow.price))
      if (buffalo) setBuffaloPrice(String(buffalo.price))
    }
  }, [milkPrices])

  // Handle dark mode toggle
  const handleDarkModeToggle = useCallback((checked: boolean) => {
    setIsDark(checked)
    setTheme(checked ? 'dark' : 'light')
    // Persist to database
    updateSettings({ darkMode: checked }).catch((err) => {
      console.error('Failed to save dark mode setting:', err)
    })
  }, [setTheme, updateSettings])

  // Save business info
  const handleSaveBusiness = useCallback(async () => {
    if (!businessName.trim()) {
      toast.error('Business name is required')
      return
    }
    setSavingBusiness(true)
    try {
      const res = await fetch('/api/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: businessName.trim(),
          phone: businessPhone.trim() || null,
          address: businessAddress.trim() || null,
        }),
      })
      if (res.ok) {
        toast.success('Business info updated')
      } else {
        toast.error('Failed to update business info')
      }
    } catch {
      toast.error('Failed to update business info')
    } finally {
      setSavingBusiness(false)
    }
  }, [businessName, businessPhone, businessAddress])

  // Save milk prices
  const handleSavePrices = useCallback(async () => {
    const cow = parseFloat(cowPrice)
    const buffalo = parseFloat(buffaloPrice)

    if (isNaN(cow) || cow <= 0) {
      toast.error('Please enter a valid COW milk price')
      return
    }
    if (isNaN(buffalo) || buffalo <= 0) {
      toast.error('Please enter a valid BUFFALO milk price')
      return
    }

    setSavingPrices(true)
    try {
      await updateMilkPrices([
        { type: 'COW', price: cow },
        { type: 'BUFFALO', price: buffalo },
      ])
      toast.success('Milk prices updated')
    } catch {
      toast.error('Failed to update milk prices')
    } finally {
      setSavingPrices(false)
    }
  }, [cowPrice, buffaloPrice, updateMilkPrices])

  // Handle reset
  const handleReset = useCallback(async () => {
    if (!resetType) return
    if (resetConfirmText !== 'RESET') {
      toast.error('Please type RESET to confirm')
      return
    }

    setIsResetting(true)
    try {
      await resetData(resetType)
      toast.success(`Data reset successfully: ${resetType}`)
      setResetDialogOpen(false)
      setResetType(null)
      setResetConfirmText('')
    } catch {
      toast.error('Failed to reset data')
    } finally {
      setIsResetting(false)
    }
  }, [resetType, resetConfirmText, resetData])

  // Open reset dialog for specific type
  const openResetDialog = (type: 'ALL' | 'CUSTOMERS' | 'DELIVERIES' | 'PAYMENTS') => {
    setResetType(type)
    setResetConfirmText('')
    setResetDialogOpen(true)
  }

  const retentionMonths = settings?.retentionMonths ?? 5

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 glass safe-top">
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="flex items-center gap-3">
            <Settings className="size-6 text-primary" />
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Settings
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-4 flex flex-col gap-4">

        {/* ── Business Info Section ──────────────────────────────────────────── */}
        <SectionCard delay={0}>
          <SectionTitle icon={Building2} title="Business Info" />
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bizName" className="text-xs">Business Name</Label>
              <Input
                id="bizName"
                placeholder="Enter business name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="rounded-[12px] h-10 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bizPhone" className="text-xs">Phone</Label>
              <Input
                id="bizPhone"
                placeholder="Enter phone number"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                className="rounded-[12px] h-10 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bizAddress" className="text-xs">Address</Label>
              <Input
                id="bizAddress"
                placeholder="Enter address"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                className="rounded-[12px] h-10 text-sm"
              />
            </div>
            <Button
              onClick={handleSaveBusiness}
              disabled={savingBusiness}
              className="rounded-btn mt-1 gap-1.5"
              size="sm"
            >
              <Save className="size-4" />
              {savingBusiness ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </SectionCard>

        {/* ── Appearance Section ─────────────────────────────────────────────── */}
        <SectionCard delay={0.05}>
          <SectionTitle icon={isDark ? Moon : Sun} title="Appearance" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isDark ? (
                <Moon className="size-4 text-muted-foreground" />
              ) : (
                <Sun className="size-4 text-muted-foreground" />
              )}
              <span className="text-sm text-foreground">Dark Mode</span>
            </div>
            <Switch
              checked={isDark}
              onCheckedChange={handleDarkModeToggle}
            />
          </div>
        </SectionCard>

        {/* ── Milk Prices Section ────────────────────────────────────────────── */}
        <SectionCard delay={0.1}>
          <SectionTitle icon={DollarSign} title="Milk Prices" />
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cowPrice" className="text-xs">COW Milk Price (per liter)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="cowPrice"
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="0.00"
                  value={cowPrice}
                  onChange={(e) => setCowPrice(e.target.value)}
                  className="rounded-[12px] pl-8 h-10 text-sm font-number"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="buffaloPrice" className="text-xs">BUFFALO Milk Price (per liter)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="buffaloPrice"
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="0.00"
                  value={buffaloPrice}
                  onChange={(e) => setBuffaloPrice(e.target.value)}
                  className="rounded-[12px] pl-8 h-10 text-sm font-number"
                />
              </div>
            </div>
            <Button
              onClick={handleSavePrices}
              disabled={savingPrices}
              className="rounded-btn mt-1 gap-1.5"
              size="sm"
            >
              <Save className="size-4" />
              {savingPrices ? 'Saving...' : 'Save Prices'}
            </Button>
          </div>
        </SectionCard>

        {/* ── Data Retention Section ─────────────────────────────────────────── */}
        <SectionCard delay={0.15}>
          <SectionTitle icon={AlertTriangle} title="Data Retention" />
          <div className="rounded-[12px] bg-secondary/60 dark:bg-secondary/40 p-3">
            <p className="text-sm text-foreground">
              Records older than <span className="font-number font-bold text-primary">{retentionMonths} months</span> are automatically deleted.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This helps keep your database clean and performant. Adjust the retention period from the server configuration.
            </p>
          </div>
        </SectionCard>

        {/* ── Help & Support Section ─────────────────────────────────────────── */}
        <SectionCard delay={0.2}>
          <SectionTitle icon={HelpCircle} title="Help & Support" />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">App Version</span>
              <span className="font-number text-sm font-semibold text-foreground">1.0.0</span>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              <span className="text-sm text-foreground">support@milkdairy.app</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-muted-foreground" />
              <span className="text-sm text-foreground">+91 98765 43210</span>
            </div>
            <Separator />
            <div className="rounded-[12px] bg-secondary/60 dark:bg-secondary/40 p-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Quick Guide:</strong> Add customers first, then record daily milk deliveries and payments.
                View monthly invoices for each customer. Use the settings to customize your business info and milk prices.
                Data older than {retentionMonths} months is automatically cleaned up.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ── Danger Zone Section ────────────────────────────────────────────── */}
        <SectionCard delay={0.25} className="border-red-500/30 dark:border-red-500/20">
          <SectionTitle icon={Trash2} title="Danger Zone" />
          <p className="text-xs text-muted-foreground mb-3">
            These actions are irreversible. Please be careful.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant="destructive"
              className="rounded-btn w-full gap-1.5"
              size="sm"
              onClick={() => openResetDialog('ALL')}
            >
              <AlertTriangle className="size-4" />
              Reset ALL Data
            </Button>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="rounded-btn text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-500/10 gap-1"
                size="sm"
                onClick={() => openResetDialog('CUSTOMERS')}
              >
                <Users className="size-3.5" />
                <span className="text-xs">Customers</span>
              </Button>
              <Button
                variant="outline"
                className="rounded-btn text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-500/10 gap-1"
                size="sm"
                onClick={() => openResetDialog('DELIVERIES')}
              >
                <Droplets className="size-3.5" />
                <span className="text-xs">Deliveries</span>
              </Button>
              <Button
                variant="outline"
                className="rounded-btn text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-500/10 gap-1"
                size="sm"
                onClick={() => openResetDialog('PAYMENTS')}
              >
                <Wallet className="size-3.5" />
                <span className="text-xs">Payments</span>
              </Button>
            </div>
          </div>
        </SectionCard>

        <NavSpacer />
      </main>

      {/* ── Reset Confirmation Dialog ──────────────────────────────────────── */}
      <AlertDialog open={resetDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setResetDialogOpen(false)
          setResetType(null)
          setResetConfirmText('')
        }
      }}>
        <AlertDialogContent className="rounded-[16px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-red-500" />
              Reset {resetType === 'ALL' ? 'All Data' : resetType?.charAt(0) + resetType?.slice(1).toLowerCase()}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {resetType === 'ALL'
                ? 'customers, deliveries, payments, and invoices'
                : resetType?.toLowerCase()
              }. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="resetConfirm" className="text-sm font-medium text-foreground">
              Type <span className="font-number font-bold text-red-500">RESET</span> to confirm
            </Label>
            <Input
              id="resetConfirm"
              placeholder="Type RESET here"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              className="rounded-[12px] font-number h-10"
              autoComplete="off"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              disabled={isResetting || resetConfirmText !== 'RESET'}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isResetting ? 'Resetting...' : `Reset ${resetType === 'ALL' ? 'Everything' : resetType?.charAt(0) + resetType?.slice(1).toLowerCase()}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Bottom Navigation ──────────────────────────────────────────────── */}
      <BottomNavigation />
    </div>
  )
}
