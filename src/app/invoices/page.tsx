'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  X,
  Calendar,
  Download,
  Search,
} from 'lucide-react'
import { useDairyStore, type Invoice, type Customer } from '@/lib/store'
import { Button } from '@/components/ui/button'
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
} from '@/components/ui/sheet'
import { BottomNavigation, NavSpacer } from '@/components/navigation'
import { toast } from 'sonner'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function formatIndianCurrency(value: number): string {
  return '₹' + value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// ─── Business Info (for invoice preview) ────────────────────────────────────

interface BusinessInfo {
  id: string
  name: string
  phone: string | null
  address: string | null
}

// ─── Invoice with Customer ──────────────────────────────────────────────────

interface InvoiceWithCustomer extends Invoice {
  customerName: string
  customerPhone: string | null
  customerAddress: string | null
}

// ─── Invoice Card ────────────────────────────────────────────────────────────

function InvoiceCard({
  invoice,
  index,
  onClick,
}: {
  invoice: InvoiceWithCustomer
  index: number
  onClick: () => void
}) {
  const isPaid = invoice.balance <= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
    >
      <Card
        className="rounded-[16px] border-border bg-card p-0 gap-0 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
        onClick={onClick}
      >
        <div className="p-4">
          {/* Top row: Customer name + Status badge */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-base font-semibold text-foreground truncate">
                {invoice.customerName}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <Calendar className="size-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {MONTH_SHORT[invoice.month - 1]} {invoice.year}
                </span>
              </div>
            </div>
            <Badge
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ml-2 shrink-0 ${
                isPaid
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800'
              }`}
            >
              {isPaid ? 'Paid' : 'Due'}
            </Badge>
          </div>

          {/* Details row */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Liters</p>
              <p className="font-number text-sm font-semibold text-foreground">
                {invoice.totalLiters.toLocaleString('en-IN', { minimumFractionDigits: 1 })} L
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Amount</p>
              <p className="font-number text-sm font-semibold text-foreground">
                {formatIndianCurrency(invoice.totalAmount)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Paid</p>
              <p className="font-number text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {formatIndianCurrency(invoice.paidAmount)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Balance</p>
              <p className={`font-number text-sm font-semibold ${
                isPaid
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatIndianCurrency(invoice.balance)}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ─── Invoice Preview (Sheet) ─────────────────────────────────────────────────

function InvoicePreview({
  invoice,
  business,
  open,
  onClose,
}: {
  invoice: InvoiceWithCustomer | null
  business: BusinessInfo | null
  open: boolean
  onClose: () => void
}) {
  if (!invoice) return null

  const isPaid = invoice.balance <= 0

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-[24px] max-h-[90vh] overflow-y-auto p-0"
      >
        {/* Custom header with X close button */}
        <div className="sticky top-0 z-10 glass rounded-t-[24px] px-4 py-3 flex items-center justify-between border-b border-border">
          <h2 className="font-heading text-lg font-bold text-foreground">Invoice</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-secondary"
            onClick={onClose}
          >
            <X className="size-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="px-5 py-5">
          {/* Business Info */}
          {business && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mb-5"
            >
              <h3 className="font-heading text-xl font-bold text-primary mb-1">
                {business.name}
              </h3>
              {business.phone && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <span className="text-xs">📞</span> {business.phone}
                </p>
              )}
              {business.address && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <span className="text-xs">📍</span> {business.address}
                </p>
              )}
            </motion.div>
          )}

          <Separator className="mb-5" />

          {/* Customer Info */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.25 }}
            className="mb-5"
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Bill To</p>
            <h4 className="font-heading text-base font-semibold text-foreground">
              {invoice.customerName}
            </h4>
            {invoice.customerPhone && (
              <p className="text-sm text-muted-foreground">{invoice.customerPhone}</p>
            )}
            {invoice.customerAddress && (
              <p className="text-sm text-muted-foreground">{invoice.customerAddress}</p>
            )}
          </motion.div>

          <Separator className="mb-5" />

          {/* Invoice Details */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.25 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="size-4 text-primary" />
              <span className="font-heading text-sm font-semibold text-foreground">
                {MONTH_NAMES[invoice.month - 1]} {invoice.year}
              </span>
            </div>

            <div className="rounded-[12px] bg-secondary/60 dark:bg-secondary/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Liters</span>
                <span className="font-number text-sm font-semibold text-foreground">
                  {invoice.totalLiters.toLocaleString('en-IN', { minimumFractionDigits: 1 })} L
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="font-number text-sm font-semibold text-foreground">
                  {formatIndianCurrency(invoice.totalAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Paid Amount</span>
                <span className="font-number text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatIndianCurrency(invoice.paidAmount)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Balance</span>
                <span className={`font-number text-lg font-bold ${
                  isPaid
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatIndianCurrency(invoice.balance)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.25 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-muted-foreground italic">
              Thank you for your business
            </p>
          </motion.div>

          {/* Close Button */}
          <div className="mt-6 pb-4">
            <Button
              onClick={onClose}
              className="w-full rounded-btn"
              variant="outline"
            >
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
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
        <FileText className="size-10 text-muted-foreground" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-foreground">
        No invoices found
      </h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-[260px]">
        No invoices match the selected month, year, and customer filter. Try adjusting your filters.
      </p>
    </motion.div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function InvoicesSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-36 rounded-[16px] bg-card animate-pulse border border-border"
        />
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const {
    customers,
    loadingCustomers,
    fetchCustomers,
    fetchInvoice,
  } = useDairyStore()

  // Filter state
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('ALL')

  // Invoice data
  const [invoices, setInvoices] = useState<InvoiceWithCustomer[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)

  // Preview state
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceWithCustomer | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Business info for preview
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null)

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Fetch business info
  useEffect(() => {
    async function loadBusiness() {
      try {
        const res = await fetch('/api/business')
        if (res.ok) {
          const data = await res.json()
          setBusinessInfo(data)
        }
      } catch (error) {
        console.error('Failed to fetch business info:', error)
      }
    }
    loadBusiness()
  }, [])

  // Fetch invoices when filters change
  const fetchAllInvoices = useCallback(async () => {
    setLoadingInvoices(true)
    try {
      const targetCustomers = selectedCustomerId === 'ALL'
        ? customers
        : customers.filter((c) => c.id === selectedCustomerId)

      const results: InvoiceWithCustomer[] = []

      // Fetch invoices for each customer in parallel
      const promises = targetCustomers.map(async (customer) => {
        try {
          const res = await fetch(
            `/api/invoices/${customer.id}?month=${selectedMonth}&year=${selectedYear}`
          )
          if (res.ok) {
            const data: Invoice = await res.json()
            results.push({
              ...data,
              customerName: customer.name,
              customerPhone: customer.phone,
              customerAddress: customer.address,
            })
          }
        } catch {
          // Skip customers with no invoice data
        }
      })

      await Promise.all(promises)
      setInvoices(results)
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
      toast.error('Failed to load invoices')
    } finally {
      setLoadingInvoices(false)
    }
  }, [customers, selectedCustomerId, selectedMonth, selectedYear])

  useEffect(() => {
    if (customers.length > 0) {
      fetchAllInvoices()
    }
  }, [customers.length, fetchAllInvoices])

  // Compute totals
  const totals = useMemo(() => {
    const totalLiters = invoices.reduce((sum, i) => sum + i.totalLiters, 0)
    const totalAmount = invoices.reduce((sum, i) => sum + i.totalAmount, 0)
    const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0)
    const totalBalance = invoices.reduce((sum, i) => sum + i.balance, 0)
    return { totalLiters, totalAmount, totalPaid, totalBalance }
  }, [invoices])

  // Year options: current year and previous year
  const yearOptions = useMemo(() => {
    const currentYear = now.getFullYear()
    return [currentYear, currentYear - 1]
  }, [])

  // Open preview
  const handleOpenPreview = (invoice: InvoiceWithCustomer) => {
    setPreviewInvoice(invoice)
    setPreviewOpen(true)
  }

  // Close preview
  const handleClosePreview = () => {
    setPreviewOpen(false)
    // Delay clearing invoice to allow animation
    setTimeout(() => setPreviewInvoice(null), 300)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 glass safe-top">
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="size-6 text-primary" />
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Invoices
              </h1>
            </div>
            <Badge variant="secondary" className="font-number text-xs">
              {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-4">
        {/* ── Filters ───────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-3 mb-4"
        >
          {/* Month + Year selectors */}
          <div className="flex items-center gap-2">
            <Select
              value={String(selectedMonth)}
              onValueChange={(val) => setSelectedMonth(parseInt(val, 10))}
            >
              <SelectTrigger className="rounded-[12px] flex-1 h-10 bg-card border-border text-sm">
                <Calendar className="size-4 text-muted-foreground mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_NAMES.map((name, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(selectedYear)}
              onValueChange={(val) => setSelectedYear(parseInt(val, 10))}
            >
              <SelectTrigger className="rounded-[12px] w-[110px] h-10 bg-card border-border text-sm font-number">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer filter */}
          <Select
            value={selectedCustomerId}
            onValueChange={setSelectedCustomerId}
          >
            <SelectTrigger className="rounded-[12px] w-full h-10 bg-card border-border text-sm">
              <Search className="size-4 text-muted-foreground mr-1.5" />
              <SelectValue placeholder="All Customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Customers</SelectItem>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} {c.balance > 0 ? `(₹${c.balance.toFixed(2)} due)` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* ── Summary Card ─────────────────────────────────────────────────── */}
        {invoices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="rounded-[16px] border-border bg-card p-4 gap-0 mb-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Liters</p>
                  <p className="font-number text-lg font-bold text-foreground">
                    {totals.totalLiters.toLocaleString('en-IN', { minimumFractionDigits: 1 })} L
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Amount</p>
                  <p className="font-number text-lg font-bold text-foreground">
                    {formatIndianCurrency(totals.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Paid</p>
                  <p className="font-number text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatIndianCurrency(totals.totalPaid)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Balance</p>
                  <p className={`font-number text-lg font-bold ${
                    totals.totalBalance <= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatIndianCurrency(totals.totalBalance)}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── Invoice List ──────────────────────────────────────────────────── */}
        {loadingInvoices || loadingCustomers ? (
          <InvoicesSkeleton />
        ) : invoices.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {invoices.map((invoice, i) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  index={i}
                  onClick={() => handleOpenPreview(invoice)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <NavSpacer />
      </main>

      {/* ── Invoice Preview Sheet ──────────────────────────────────────────── */}
      <InvoicePreview
        invoice={previewInvoice}
        business={businessInfo}
        open={previewOpen}
        onClose={handleClosePreview}
      />

      {/* ── Bottom Navigation ──────────────────────────────────────────────── */}
      <BottomNavigation />
    </div>
  )
}
