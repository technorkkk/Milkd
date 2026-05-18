'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Droplets,
  Sun,
  Moon,
  Trash2,
  Calendar,
} from 'lucide-react'
import { useDairyStore, type Delivery } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { BottomNavigation, NavSpacer } from '@/components/navigation'
import { toast } from 'sonner'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`
}

function formatIndianCurrency(value: number): string {
  return '₹' + value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function getTodayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── Delivery Card ────────────────────────────────────────────────────────────

function DeliveryCard({
  delivery,
  index,
  onDelete,
}: {
  delivery: Delivery
  index: number
  onDelete: (id: string) => void
}) {
  const isCow = delivery.milkType === 'COW'
  const isMorning = delivery.shift === 'MORNING'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      <Card className="rounded-[16px] border-border bg-card p-0 gap-0 overflow-hidden">
        <div className="p-4">
          {/* Top row: Customer name + Milk type badge */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-base font-semibold text-foreground truncate">
                {delivery.customerName}
              </h3>
            </div>
            <Badge
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ml-2 shrink-0 ${
                isCow
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  : 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-800'
              }`}
            >
              {delivery.milkType}
            </Badge>
          </div>

          {/* Details row: Shift badge + Liters + Rate + Amount */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border-0 ${
                isMorning
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                  : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
              }`}
            >
              {isMorning ? (
                <Sun className="size-3 mr-0.5" />
              ) : (
                <Moon className="size-3 mr-0.5" />
              )}
              {delivery.shift}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {delivery.liters.toLocaleString('en-IN', { minimumFractionDigits: 1 })} L
            </span>
            <span className="text-xs text-muted-foreground">
              @ {formatIndianCurrency(delivery.rate)}/L
            </span>
          </div>

          {/* Amount row + Delete */}
          <div className="flex items-center justify-between">
            <span className="font-number text-lg font-bold text-foreground">
              {formatIndianCurrency(delivery.amount)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0"
              onClick={() => onDelete(delivery.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ─── Date Group ───────────────────────────────────────────────────────────────

function DateGroup({
  date,
  deliveries,
  startIndex,
  onDelete,
}: {
  date: string
  deliveries: Delivery[]
  startIndex: number
  onDelete: (id: string) => void
}) {
  const totalAmount = deliveries.reduce((sum, d) => sum + d.amount, 0)
  const totalLiters = deliveries.reduce((sum, d) => sum + d.liters, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Date header */}
      <div className="flex items-center justify-between mb-2 mt-2">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-primary" />
          <h2 className="font-heading text-sm font-bold text-foreground">
            {formatDateDisplay(date)}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {totalLiters.toLocaleString('en-IN', { minimumFractionDigits: 1 })} L
          </span>
          <span className="font-number text-sm font-bold text-foreground">
            {formatIndianCurrency(totalAmount)}
          </span>
        </div>
      </div>
      <Separator className="mb-3" />

      {/* Delivery cards */}
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {deliveries.map((delivery, i) => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              index={startIndex + i}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-secondary">
        <Droplets className="size-10 text-muted-foreground" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-foreground">
        No deliveries found
      </h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-[260px]">
        No deliveries match your current filters. Try changing the date or shift, or add a new delivery.
      </p>
    </motion.div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function DeliveriesSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-28 rounded-[16px] bg-card animate-pulse border border-border"
        />
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DeliveriesPage() {
  const {
    deliveries,
    loadingDeliveries,
    fetchDeliveries,
    deliveryFilters,
    setDeliveryFilters,
    createDelivery,
    deleteDelivery,
    customers,
    fetchCustomers,
    milkPrices,
    fetchMilkPrices,
  } = useDairyStore()

  // Sheet open state
  const [sheetOpen, setSheetOpen] = useState(false)

  // Form state
  const [formCustomerId, setFormCustomerId] = useState('')
  const [formDate, setFormDate] = useState(getTodayStr())
  const [formShift, setFormShift] = useState<string>('MORNING')
  const [formLiters, setFormLiters] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Customer search for filter
  const [customerSearch, setCustomerSearch] = useState('')

  // Fetch data on mount
  useEffect(() => {
    fetchCustomers()
    fetchMilkPrices()
  }, [fetchCustomers, fetchMilkPrices])

  // Fetch deliveries when filters change
  useEffect(() => {
    fetchDeliveries()
  }, [fetchDeliveries, deliveryFilters])

  // Calculate amount preview
  const previewAmount = useMemo(() => {
    if (!formCustomerId || !formLiters) return 0
    const customer = customers.find((c) => c.id === formCustomerId)
    if (!customer) return 0
    const milkPrice = milkPrices.find((mp) => mp.type === customer.milkType)
    if (!milkPrice) return 0
    const liters = parseFloat(formLiters) || 0
    return Math.round(liters * milkPrice.price * 100) / 100
  }, [formCustomerId, formLiters, customers, milkPrices])

  // Get rate for selected customer
  const previewRate = useMemo(() => {
    if (!formCustomerId) return 0
    const customer = customers.find((c) => c.id === formCustomerId)
    if (!customer) return 0
    const milkPrice = milkPrices.find((mp) => mp.type === customer.milkType)
    return milkPrice?.price ?? 0
  }, [formCustomerId, customers, milkPrices])

  // Group deliveries by date
  const groupedDeliveries = useMemo(() => {
    const groups: Record<string, Delivery[]> = {}
    for (const d of deliveries) {
      if (!groups[d.date]) groups[d.date] = []
      groups[d.date].push(d)
    }
    // Sort dates descending (most recent first)
    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a))
    return sortedDates.map((date) => ({
      date,
      deliveries: groups[date],
    }))
  }, [deliveries])

  // Reset form
  const resetForm = useCallback(() => {
    setFormCustomerId('')
    setFormDate(getTodayStr())
    setFormShift('MORNING')
    setFormLiters('')
  }, [])

  // Handle add delivery
  const handleAddDelivery = async () => {
    if (!formCustomerId) {
      toast.error('Please select a customer')
      return
    }
    if (!formLiters || parseFloat(formLiters) <= 0) {
      toast.error('Please enter valid liters')
      return
    }

    setIsCreating(true)
    try {
      await createDelivery({
        customerId: formCustomerId,
        date: formDate,
        shift: formShift,
        liters: parseFloat(formLiters),
      })
      toast.success('Delivery added successfully')
      setSheetOpen(false)
      resetForm()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add delivery'
      if (message.toLowerCase().includes('already exists')) {
        toast.error('Delivery already exists for this customer/date/shift')
      } else {
        toast.error(message)
      }
    } finally {
      setIsCreating(false)
    }
  }

  // Handle delete delivery
  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await deleteDelivery(deleteId)
      toast.success('Delivery deleted')
      setDeleteId(null)
    } catch {
      toast.error('Failed to delete delivery')
    } finally {
      setIsDeleting(false)
    }
  }

  // Shift filter handler
  const handleShiftFilter = (value: string) => {
    if (value === 'ALL') {
      setDeliveryFilters({ shift: undefined })
    } else {
      setDeliveryFilters({ shift: value })
    }
  }

  // Customer filter
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers
    const q = customerSearch.toLowerCase()
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q))
    )
  }, [customers, customerSearch])

  // Current shift filter value for ToggleGroup
  const currentShiftFilter = deliveryFilters.shift || 'ALL'

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 glass safe-top">
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Deliveries
              </h1>
              <Badge variant="secondary" className="font-number text-xs">
                {deliveries.length}
              </Badge>
            </div>
            <Button
              onClick={() => setSheetOpen(true)}
              size="sm"
              className="rounded-btn gap-1.5"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Add Delivery</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-4">
        {/* ── Filters Row ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 mb-4">
          {/* Date picker + Shift toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={deliveryFilters.date || ''}
                onChange={(e) => setDeliveryFilters({ date: e.target.value || undefined })}
                className="rounded-[12px] pl-10 pr-4 h-10 bg-card border-border text-sm font-number"
              />
            </div>
            <ToggleGroup
              type="single"
              value={currentShiftFilter}
              onValueChange={(val) => {
                if (val) handleShiftFilter(val)
              }}
              variant="outline"
              className="rounded-[12px] border border-border bg-card"
            >
              <ToggleGroupItem
                value="ALL"
                className="text-xs px-3 h-10 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-l-[12px]"
              >
                All
              </ToggleGroupItem>
              <ToggleGroupItem
                value="MORNING"
                className="text-xs px-2 h-10 data-[state=on]:bg-amber-500 data-[state=on]:text-white gap-1"
              >
                <Sun className="size-3" />
                <span className="hidden sm:inline">Morning</span>
                <span className="sm:hidden">AM</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="EVENING"
                className="text-xs px-2 h-10 data-[state=on]:bg-indigo-500 data-[state=on]:text-white gap-1 rounded-r-[12px]"
              >
                <Moon className="size-3" />
                <span className="hidden sm:inline">Evening</span>
                <span className="sm:hidden">PM</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Customer filter dropdown */}
          <Select
            value={deliveryFilters.customerId || 'ALL'}
            onValueChange={(val) =>
              setDeliveryFilters({ customerId: val === 'ALL' ? undefined : val })
            }
          >
            <SelectTrigger className="rounded-[12px] w-full h-10 bg-card border-border text-sm">
              <SelectValue placeholder="All Customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Customers</SelectItem>
              {filteredCustomers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ({c.milkType})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ── Deliveries List ──────────────────────────────────────────────── */}
        {loadingDeliveries ? (
          <DeliveriesSkeleton />
        ) : deliveries.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-5">
            {groupedDeliveries.map((group, gi) => (
              <DateGroup
                key={group.date}
                date={group.date}
                deliveries={group.deliveries}
                startIndex={gi * 5}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>
        )}

        <NavSpacer />
      </main>

      {/* ── Add Delivery Sheet ─────────────────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-heading">Add Delivery</SheetTitle>
            <SheetDescription>
              Record a new milk delivery for a customer.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-5 px-4 py-4 overflow-y-auto flex-1">
            {/* Customer Select */}
            <div className="flex flex-col gap-2">
              <Label>Customer *</Label>
              <Select value={formCustomerId} onValueChange={setFormCustomerId}>
                <SelectTrigger className="rounded-lg w-full">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.milkType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Input */}
            <div className="flex flex-col gap-2">
              <Label>Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="rounded-lg pl-10 font-number"
                />
              </div>
            </div>

            {/* Shift Select */}
            <div className="flex flex-col gap-2">
              <Label>Shift *</Label>
              <Select value={formShift} onValueChange={setFormShift}>
                <SelectTrigger className="rounded-lg w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MORNING">
                    <div className="flex items-center gap-2">
                      <Sun className="size-4 text-amber-500" />
                      MORNING
                    </div>
                  </SelectItem>
                  <SelectItem value="EVENING">
                    <div className="flex items-center gap-2">
                      <Moon className="size-4 text-indigo-400" />
                      EVENING
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Liters Input */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="liters">Liters *</Label>
              <Input
                id="liters"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="0.0"
                value={formLiters}
                onChange={(e) => setFormLiters(e.target.value)}
                className="rounded-lg font-number"
              />
            </div>

            {/* Preview */}
            {formCustomerId && formLiters && parseFloat(formLiters) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="rounded-[16px] border-border bg-secondary/50 p-4 gap-0">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Amount Preview
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span className="font-number">
                        {parseFloat(formLiters).toLocaleString('en-IN', { minimumFractionDigits: 1 })} L
                      </span>
                      <span>&times;</span>
                      <span className="font-number">
                        {formatIndianCurrency(previewRate)}/L
                      </span>
                    </div>
                    <span className="font-number text-xl font-bold text-foreground">
                      {formatIndianCurrency(previewAmount)}
                    </span>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          <SheetFooter className="px-4 pb-6">
            <div className="flex gap-2 w-full">
              <SheetClose asChild>
                <Button
                  variant="outline"
                  className="rounded-btn flex-1"
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </SheetClose>
              <Button
                onClick={handleAddDelivery}
                disabled={isCreating || !formCustomerId || !formLiters}
                className="rounded-btn flex-1"
              >
                {isCreating ? 'Adding...' : 'Add Delivery'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ── Delete Confirmation Dialog ─────────────────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-[16px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Delivery</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this delivery? This action cannot be undone and the amount will be removed from the customer&apos;s balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Bottom Navigation ──────────────────────────────────────────────── */}
      <BottomNavigation />
    </div>
  )
}
