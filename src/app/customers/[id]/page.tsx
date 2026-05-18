'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Phone,
  MapPin,
  Pencil,
  IndianRupee,
  Droplets,
  Trash2,
  FileText,
  X,
  Sun,
  Moon,
  Calendar,
} from 'lucide-react'
import { useDairyStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BottomNavigation, NavSpacer } from '@/components/navigation'
import { toast } from 'sonner'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Customer Detail Page ────────────────────────────────────────────────────

export default function CustomerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string

  const {
    selectedCustomer,
    loadingSelectedCustomer,
    fetchCustomer,
    updateCustomer,
    deleteCustomer,
    fetchInvoice,
    currentInvoice,
    loadingInvoice,
    clearSelectedCustomer,
  } = useDairyStore()

  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [invoiceMonth, setInvoiceMonth] = useState(new Date().getMonth() + 1)
  const [invoiceYear, setInvoiceYear] = useState(new Date().getFullYear())

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editMilkType, setEditMilkType] = useState('COW')
  const [editDailyLimit, setEditDailyLimit] = useState('')

  useEffect(() => {
    if (customerId) {
      fetchCustomer(customerId)
    }
    return () => {
      clearSelectedCustomer()
    }
  }, [customerId, fetchCustomer, clearSelectedCustomer])

  // Populate edit form when dialog opens
  useEffect(() => {
    if (showEditDialog && selectedCustomer) {
      setEditName(selectedCustomer.name)
      setEditPhone(selectedCustomer.phone || '')
      setEditAddress(selectedCustomer.address || '')
      setEditMilkType(selectedCustomer.milkType)
      setEditDailyLimit(
        selectedCustomer.dailyLimit ? String(selectedCustomer.dailyLimit) : ''
      )
    }
  }, [showEditDialog, selectedCustomer])

  // Handle update customer
  const handleUpdateCustomer = async () => {
    if (!editName.trim()) {
      toast.error('Name is required')
      return
    }
    setIsUpdating(true)
    try {
      await updateCustomer(customerId, {
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
        address: editAddress.trim() || undefined,
        milkType: editMilkType,
        dailyLimit: editDailyLimit ? parseFloat(editDailyLimit) : undefined,
      })
      toast.success('Customer updated')
      setShowEditDialog(false)
    } catch {
      toast.error('Failed to update customer')
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle delete customer
  const handleDeleteCustomer = async () => {
    setIsDeleting(true)
    try {
      await deleteCustomer(customerId)
      toast.success('Customer deleted')
      router.push('/customers')
    } catch {
      toast.error('Failed to delete customer')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle generate invoice
  const handleGenerateInvoice = useCallback(async () => {
    try {
      await fetchInvoice(customerId, invoiceMonth, invoiceYear)
      setShowInvoice(true)
    } catch {
      toast.error('Failed to generate invoice')
    }
  }, [customerId, invoiceMonth, invoiceYear, fetchInvoice])

  // Max liters for bar indicator
  const maxLiters = selectedCustomer?.monthWiseLiters?.length
    ? Math.max(...selectedCustomer.monthWiseLiters.map((m) => m.liters), 1)
    : 1

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loadingSelectedCustomer) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="h-8 w-8 bg-card animate-pulse rounded-lg mb-6" />
          <div className="h-48 rounded-[16px] bg-card animate-pulse border border-border mb-4" />
          <div className="h-24 rounded-[16px] bg-card animate-pulse border border-border mb-4" />
          <div className="h-64 rounded-[16px] bg-card animate-pulse border border-border" />
        </div>
        <BottomNavigation />
      </div>
    )
  }

  // ── Not Found ────────────────────────────────────────────────────────────
  if (!selectedCustomer) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="mx-auto max-w-lg px-4 py-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/customers')}
            className="mb-4"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="font-heading text-lg font-semibold">
              Customer not found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The customer you are looking for does not exist.
            </p>
            <Button
              onClick={() => router.push('/customers')}
              className="mt-6 rounded-btn"
            >
              Back to Customers
            </Button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    )
  }

  const customer = selectedCustomer

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header with Back Button ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 glass safe-top">
        <div className="mx-auto max-w-lg px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/customers')}
            className="shrink-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="font-heading text-lg font-bold text-foreground truncate">
            Customer Details
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-4">
        {/* ── Customer Header Card ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="rounded-[16px] border-border bg-card p-0 gap-0 overflow-hidden mb-4">
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h2 className="font-heading text-xl font-bold text-foreground truncate">
                    {customer.name}
                  </h2>
                  <div className="flex flex-col gap-1 mt-1.5">
                    {customer.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="size-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {customer.phone}
                        </span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground truncate">
                          {customer.address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <Badge
                    className={`text-[10px] font-medium px-2.5 py-0.5 rounded-md ${
                      customer.milkType === 'COW'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                    }`}
                  >
                    {customer.milkType}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => setShowEditDialog(true)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Balance & Total Liters */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
                <div>
                  <span className="text-xs text-muted-foreground">Balance</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <IndianRupee
                      className={`size-4 ${
                        customer.balance > 0 ? 'text-red-500' : 'text-green-500'
                      }`}
                    />
                    <span
                      className={`font-number text-2xl font-bold ${
                        customer.balance > 0 ? 'text-red-500' : 'text-green-500'
                      }`}
                    >
                      {customer.balance > 0 ? '+' : ''}
                      ₹{Math.abs(customer.balance).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">
                    Total Liters
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Droplets className="size-4 text-muted-foreground" />
                    <span className="font-number text-2xl font-bold text-foreground">
                      {customer.totalLiters.toFixed(1)}
                      <span className="text-sm font-normal text-muted-foreground ml-0.5">
                        L
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Month-wise Liters ───────────────────────────────────────────────── */}
        {customer.monthWiseLiters && customer.monthWiseLiters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mb-4"
          >
            <h3 className="font-heading text-sm font-semibold text-foreground mb-2 px-1">
              Monthly Liters
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
              {customer.monthWiseLiters.map((m) => (
                <div
                  key={`${m.month}-${m.year}`}
                  className="shrink-0 w-[100px] rounded-[16px] bg-card border border-border p-3 flex flex-col items-center gap-1.5"
                >
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {MONTH_SHORT[m.month - 1]} {m.year}
                  </span>
                  <span className="font-number text-base font-bold text-foreground">
                    {m.liters.toFixed(1)}L
                  </span>
                  {/* Bar indicator */}
                  <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{
                        width: `${Math.min((m.liters / maxLiters) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Recent Deliveries ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="mb-4"
        >
          <h3 className="font-heading text-sm font-semibold text-foreground mb-2 px-1">
            Recent Deliveries
          </h3>
          {customer.recentDeliveries && customer.recentDeliveries.length > 0 ? (
            <Card className="rounded-[16px] border-border bg-card p-0 gap-0 overflow-hidden">
              <ScrollArea className="max-h-80">
                <div className="divide-y divide-border">
                  {customer.recentDeliveries.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex size-8 items-center justify-center rounded-lg shrink-0 ${
                            d.shift === 'MORNING'
                              ? 'bg-amber-100 dark:bg-amber-900/30'
                              : 'bg-indigo-100 dark:bg-indigo-900/30'
                          }`}
                        >
                          {d.shift === 'MORNING' ? (
                            <Sun className="size-4 text-amber-600 dark:text-amber-400" />
                          ) : (
                            <Moon className="size-4 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {formatDate(d.date)}
                            </span>
                            <Badge
                              className={`text-[9px] px-1.5 py-0 rounded ${
                                d.shift === 'MORNING'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                  : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                              }`}
                            >
                              {d.shift === 'MORNING' ? 'AM' : 'PM'}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground font-number">
                            {d.liters}L × ₹{d.rate.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <span className="font-number text-sm font-semibold text-foreground shrink-0 ml-2">
                        ₹{d.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          ) : (
            <Card className="rounded-[16px] border-border bg-card p-4">
              <p className="text-sm text-muted-foreground text-center">
                No deliveries recorded yet.
              </p>
            </Card>
          )}
        </motion.div>

        {/* ── Recent Payments ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mb-4"
        >
          <h3 className="font-heading text-sm font-semibold text-foreground mb-2 px-1">
            Recent Payments
          </h3>
          {customer.recentPayments && customer.recentPayments.length > 0 ? (
            <Card className="rounded-[16px] border-border bg-card p-0 gap-0 overflow-hidden">
              <ScrollArea className="max-h-80">
                <div className="divide-y divide-border">
                  {customer.recentPayments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex size-8 items-center justify-center rounded-lg shrink-0 ${
                            p.method === 'CASH'
                              ? 'bg-green-100 dark:bg-green-900/30'
                              : p.method === 'UPI'
                                ? 'bg-blue-100 dark:bg-blue-900/30'
                                : 'bg-purple-100 dark:bg-purple-900/30'
                          }`}
                        >
                          <IndianRupee
                            className={`size-4 ${
                              p.method === 'CASH'
                                ? 'text-green-600 dark:text-green-400'
                                : p.method === 'UPI'
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-purple-600 dark:text-purple-400'
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {formatDate(p.date)}
                            </span>
                            <Badge
                              className={`text-[9px] px-1.5 py-0 rounded ${
                                p.method === 'CASH'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800'
                                  : p.method === 'UPI'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                              }`}
                            >
                              {p.method}
                            </Badge>
                          </div>
                          {p.note && (
                            <span className="text-xs text-muted-foreground truncate block max-w-[180px]">
                              {p.note}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-number text-sm font-semibold text-green-600 dark:text-green-400 shrink-0 ml-2">
                        +₹{p.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          ) : (
            <Card className="rounded-[16px] border-border bg-card p-4">
              <p className="text-sm text-muted-foreground text-center">
                No payments recorded yet.
              </p>
            </Card>
          )}
        </motion.div>

        {/* ── Action Buttons ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="flex flex-col gap-3 mb-4"
        >
          {/* Generate Invoice */}
          <div className="rounded-[16px] bg-card border border-border p-4">
            <h3 className="font-heading text-sm font-semibold text-foreground mb-3">
              Generate Invoice
            </h3>
            <div className="flex gap-2 mb-3">
              <Select
                value={String(invoiceMonth)}
                onValueChange={(v) => setInvoiceMonth(parseInt(v))}
              >
                <SelectTrigger className="rounded-lg flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((name, i) => (
                    <SelectItem key={i} value={String(i + 1)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(invoiceYear)}
                onValueChange={(v) => setInvoiceYear(parseInt(v))}
              >
                <SelectTrigger className="rounded-lg w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleGenerateInvoice}
              disabled={loadingInvoice}
              className="w-full rounded-btn gap-2"
            >
              <FileText className="size-4" />
              {loadingInvoice ? 'Generating...' : 'Generate Invoice'}
            </Button>
          </div>

          {/* Delete Customer */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full rounded-btn gap-2 text-red-500 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash2 className="size-4" />
                Delete Customer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[16px]">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {customer.name} and all their
                  delivery and payment records. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-btn">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteCustomer}
                  disabled={isDeleting}
                  className="rounded-btn bg-red-500 hover:bg-red-600 text-white"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>

        <NavSpacer />
      </main>

      {/* ── Edit Customer Dialog ──────────────────────────────────────────────── */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="rounded-[16px] sm:rounded-lg max-w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-2">
                <Label>Milk Type</Label>
                <Select value={editMilkType} onValueChange={setEditMilkType}>
                  <SelectTrigger className="rounded-lg w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COW">COW</SelectItem>
                    <SelectItem value="BUFFALO">BUFFALO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <Label htmlFor="edit-dailyLimit">Daily Limit (L)</Label>
                <Input
                  id="edit-dailyLimit"
                  type="number"
                  value={editDailyLimit}
                  onChange={(e) => setEditDailyLimit(e.target.value)}
                  className="rounded-lg font-number"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="rounded-btn"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCustomer}
              disabled={isUpdating || !editName.trim()}
              className="rounded-btn"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Invoice Preview Overlay ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showInvoice && currentInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowInvoice(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-[16px] border border-border shadow-xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Invoice Header with X close */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                  <h3 className="font-heading text-base font-bold text-foreground">
                    Invoice
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {MONTH_NAMES[currentInvoice.month - 1]} {currentInvoice.year}
                  </p>
                </div>
                <button
                  onClick={() => setShowInvoice(false)}
                  className="flex size-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                  aria-label="Close invoice preview"
                >
                  <X className="size-5 text-muted-foreground" />
                </button>
              </div>

              {/* Invoice Body */}
              <div className="px-5 py-4">
                <div className="mb-4">
                  <span className="text-xs text-muted-foreground">Customer</span>
                  <p className="font-heading text-base font-semibold text-foreground">
                    {customer.name}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Liters
                    </span>
                    <span className="font-number text-sm font-semibold text-foreground">
                      {currentInvoice.totalLiters.toFixed(1)} L
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Amount
                    </span>
                    <span className="font-number text-sm font-semibold text-foreground">
                      ₹{currentInvoice.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Paid Amount
                    </span>
                    <span className="font-number text-sm font-semibold text-green-500">
                      ₹{currentInvoice.paidAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      Balance
                    </span>
                    <span
                      className={`font-number text-lg font-bold ${
                        currentInvoice.balance > 0
                          ? 'text-red-500'
                          : 'text-green-500'
                      }`}
                    >
                      {currentInvoice.balance > 0 ? '+' : ''}₹
                      {Math.abs(currentInvoice.balance).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoice Footer */}
              <div className="px-5 py-3 border-t border-border bg-secondary/30">
                <Button
                  onClick={() => setShowInvoice(false)}
                  className="w-full rounded-btn"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Navigation ────────────────────────────────────────────────── */}
      <BottomNavigation />
    </div>
  )
}
