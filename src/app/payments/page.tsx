'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Wallet,
  Banknote,
  Smartphone,
  Building2,
  Trash2,
  Search,
  Calendar,
} from 'lucide-react'
import { useDairyStore, type Payment } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
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

// ─── Method Badge Config ──────────────────────────────────────────────────────

const METHOD_CONFIG: Record<string, {
  icon: React.ComponentType<{ className?: string }>
  bgClass: string
}> = {
  CASH: {
    icon: Banknote,
    bgClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  UPI: {
    icon: Smartphone,
    bgClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  BANK: {
    icon: Building2,
    bgClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
}

// ─── Payment Card ─────────────────────────────────────────────────────────────

function PaymentCard({
  payment,
  index,
  onDelete,
}: {
  payment: Payment
  index: number
  onDelete: (id: string) => void
}) {
  const methodConfig = METHOD_CONFIG[payment.method] || METHOD_CONFIG.CASH
  const MethodIcon = methodConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      <Card className="rounded-[16px] border-border bg-card p-0 gap-0 overflow-hidden">
        <div className="p-4">
          {/* Top row: Customer name + Method badge */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-base font-semibold text-foreground truncate">
                {payment.customerName}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <Calendar className="size-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {formatDateDisplay(payment.date)}
                </span>
              </div>
            </div>
            <Badge
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ml-2 shrink-0 ${methodConfig.bgClass}`}
            >
              <MethodIcon className="size-3" />
              {payment.method}
            </Badge>
          </div>

          {/* Amount row + Delete */}
          <div className="flex items-center justify-between">
            <span className="font-number text-xl font-bold text-foreground">
              {formatIndianCurrency(payment.amount)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0"
              onClick={() => onDelete(payment.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          {/* Note */}
          {payment.note && (
            <p className="text-xs text-muted-foreground mt-1.5 truncate">
              {payment.note}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

// ─── Date Group ───────────────────────────────────────────────────────────────

function DateGroup({
  date,
  payments,
  startIndex,
  onDelete,
}: {
  date: string
  payments: Payment[]
  startIndex: number
  onDelete: (id: string) => void
}) {
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)

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
            {payments.length} payment{payments.length !== 1 ? 's' : ''}
          </span>
          <span className="font-number text-sm font-bold text-foreground">
            {formatIndianCurrency(totalAmount)}
          </span>
        </div>
      </div>

      {/* Payment cards */}
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {payments.map((payment, i) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
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
        <Wallet className="size-10 text-muted-foreground" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-foreground">
        No payments recorded
      </h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-[260px]">
        No payments match your current filters. Try changing the filters, or record a new payment.
      </p>
    </motion.div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function PaymentsSkeleton() {
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

export default function PaymentsPage() {
  const {
    payments,
    loadingPayments,
    fetchPayments,
    paymentFilters,
    setPaymentFilters,
    createPayment,
    deletePayment,
    customers,
    fetchCustomers,
  } = useDairyStore()

  // Sheet open state
  const [sheetOpen, setSheetOpen] = useState(false)

  // Form state
  const [formCustomerId, setFormCustomerId] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formDate, setFormDate] = useState(getTodayStr())
  const [formMethod, setFormMethod] = useState<string>('CASH')
  const [formNote, setFormNote] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Customer search for filter
  const [customerSearch, setCustomerSearch] = useState('')

  // Fetch data on mount
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Fetch payments when filters change
  useEffect(() => {
    fetchPayments()
  }, [fetchPayments, paymentFilters])

  // Calculate total amount
  const totalAmount = useMemo(
    () => payments.reduce((sum, p) => sum + p.amount, 0),
    [payments]
  )

  // Group payments by date
  const groupedPayments = useMemo(() => {
    const groups: Record<string, Payment[]> = {}
    for (const p of payments) {
      if (!groups[p.date]) groups[p.date] = []
      groups[p.date].push(p)
    }
    // Sort dates descending (most recent first)
    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a))
    return sortedDates.map((date) => ({
      date,
      payments: groups[date],
    }))
  }, [payments])

  // Filter customers for dropdown search
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers
    const q = customerSearch.toLowerCase()
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q))
    )
  }, [customers, customerSearch])

  // Reset form
  const resetForm = useCallback(() => {
    setFormCustomerId('')
    setFormAmount('')
    setFormDate(getTodayStr())
    setFormMethod('CASH')
    setFormNote('')
  }, [])

  // Handle add payment
  const handleAddPayment = async () => {
    if (!formCustomerId) {
      toast.error('Please select a customer')
      return
    }
    if (!formAmount || parseFloat(formAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setIsCreating(true)
    try {
      await createPayment({
        customerId: formCustomerId,
        amount: parseFloat(formAmount),
        date: formDate,
        method: formMethod,
        note: formNote.trim() || undefined,
      })
      toast.success('Payment recorded successfully')
      setSheetOpen(false)
      resetForm()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to record payment'
      toast.error(message)
    } finally {
      setIsCreating(false)
    }
  }

  // Handle delete payment
  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await deletePayment(deleteId)
      toast.success('Payment deleted')
      setDeleteId(null)
    } catch {
      toast.error('Failed to delete payment')
    } finally {
      setIsDeleting(false)
    }
  }

  // Method filter handler
  const handleMethodFilter = (value: string) => {
    if (value === 'ALL') {
      setPaymentFilters({ method: undefined })
    } else {
      setPaymentFilters({ method: value })
    }
  }

  // Current method filter value for ToggleGroup
  const currentMethodFilter = paymentFilters.method || 'ALL'

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 glass safe-top">
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Payments
              </h1>
              <Badge variant="secondary" className="font-number text-xs">
                {formatIndianCurrency(totalAmount)}
              </Badge>
            </div>
            <Button
              onClick={() => setSheetOpen(true)}
              size="sm"
              className="rounded-btn gap-1.5"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Add Payment</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-4">
        {/* ── Filters Row ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 mb-4">
          {/* Date picker + Method toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={paymentFilters.date || ''}
                onChange={(e) => setPaymentFilters({ date: e.target.value || undefined })}
                className="rounded-[12px] pl-10 pr-4 h-10 bg-card border-border text-sm font-number"
              />
            </div>
            <ToggleGroup
              type="single"
              value={currentMethodFilter}
              onValueChange={(val) => {
                if (val) handleMethodFilter(val)
              }}
              variant="outline"
              className="rounded-[12px] border border-border bg-card"
            >
              <ToggleGroupItem
                value="ALL"
                className="text-xs px-2.5 h-10 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-l-[12px]"
              >
                All
              </ToggleGroupItem>
              <ToggleGroupItem
                value="CASH"
                className="text-xs px-2 h-10 data-[state=on]:bg-emerald-500 data-[state=on]:text-white gap-1"
              >
                <Banknote className="size-3" />
                <span className="hidden sm:inline">Cash</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="UPI"
                className="text-xs px-2 h-10 data-[state=on]:bg-blue-500 data-[state=on]:text-white gap-1"
              >
                <Smartphone className="size-3" />
                <span className="hidden sm:inline">UPI</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="BANK"
                className="text-xs px-2 h-10 data-[state=on]:bg-purple-500 data-[state=on]:text-white gap-1 rounded-r-[12px]"
              >
                <Building2 className="size-3" />
                <span className="hidden sm:inline">Bank</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Customer filter dropdown */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Select
              value={paymentFilters.customerId || 'ALL'}
              onValueChange={(val) =>
                setPaymentFilters({ customerId: val === 'ALL' ? undefined : val })
              }
            >
              <SelectTrigger className="rounded-[12px] w-full h-10 bg-card border-border text-sm pl-10">
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 pb-2">
                  <Input
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="rounded-lg h-8 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <SelectItem value="ALL">All Customers</SelectItem>
                {filteredCustomers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} {c.balance > 0 ? `(₹${c.balance.toFixed(2)} due)` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Payments List ──────────────────────────────────────────────── */}
        {loadingPayments ? (
          <PaymentsSkeleton />
        ) : payments.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-5">
            {groupedPayments.map((group, gi) => {
              // Calculate start index for stagger animation
              const startIndex = groupedPayments
                .slice(0, gi)
                .reduce((sum, g) => sum + g.payments.length, 0)

              return (
                <DateGroup
                  key={group.date}
                  date={group.date}
                  payments={group.payments}
                  startIndex={startIndex}
                  onDelete={(id) => setDeleteId(id)}
                />
              )
            })}
          </div>
        )}

        <NavSpacer />
      </main>

      {/* ── Add Payment Sheet ─────────────────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-heading">Add Payment</SheetTitle>
            <SheetDescription>
              Record a new payment from a customer.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-5 px-4 py-4 overflow-y-auto flex-1">
            {/* Customer Select */}
            <div className="flex flex-col gap-2">
              <Label>Customer *</Label>
              {customers.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-center">
                  <p className="text-sm text-muted-foreground">No customers found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add customers first from the Customers page
                  </p>
                </div>
              ) : (
                <Select value={formCustomerId} onValueChange={setFormCustomerId}>
                  <SelectTrigger className="rounded-lg w-full">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} — {formatIndianCurrency(Math.abs(c.balance))} {c.balance > 0 ? 'due' : 'advance'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Amount Input */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="rounded-lg pl-8 font-number"
                />
              </div>
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

            {/* Method Select */}
            <div className="flex flex-col gap-2">
              <Label>Method *</Label>
              <Select value={formMethod} onValueChange={setFormMethod}>
                <SelectTrigger className="rounded-lg w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">
                    <div className="flex items-center gap-2">
                      <Banknote className="size-4 text-emerald-500" />
                      <span>CASH</span>
                      <Badge className={`text-[9px] px-1.5 py-0 rounded-md ${METHOD_CONFIG.CASH.bgClass}`}>
                        Cash
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="UPI">
                    <div className="flex items-center gap-2">
                      <Smartphone className="size-4 text-blue-500" />
                      <span>UPI</span>
                      <Badge className={`text-[9px] px-1.5 py-0 rounded-md ${METHOD_CONFIG.UPI.bgClass}`}>
                        UPI
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="BANK">
                    <div className="flex items-center gap-2">
                      <Building2 className="size-4 text-purple-500" />
                      <span>BANK</span>
                      <Badge className={`text-[9px] px-1.5 py-0 rounded-md ${METHOD_CONFIG.BANK.bgClass}`}>
                        Bank
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Note Input */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Input
                id="note"
                placeholder="Add a note..."
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                className="rounded-lg"
              />
            </div>
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
                onClick={handleAddPayment}
                disabled={isCreating || !formCustomerId || !formAmount}
                className="rounded-btn flex-1"
              >
                {isCreating ? 'Recording...' : 'Record Payment'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ── Delete Confirmation Dialog ─────────────────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-[16px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment? This action cannot be undone and the amount will be added back to the customer&apos;s balance.
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
