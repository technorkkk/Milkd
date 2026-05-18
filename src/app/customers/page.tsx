'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Users,
  Phone,
  IndianRupee,
  Droplets,
} from 'lucide-react'
import { useDairyStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BottomNavigation, NavSpacer } from '@/components/navigation'
import { toast } from 'sonner'

// ─── Month Names ─────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// ─── Customer List Page ──────────────────────────────────────────────────────

export default function CustomersPage() {
  const router = useRouter()
  const {
    customers,
    loadingCustomers,
    fetchCustomers,
    createCustomer,
    createPayment,
  } = useDairyStore()

  const [search, setSearch] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formMilkType, setFormMilkType] = useState('COW')
  const [formDailyLimit, setFormDailyLimit] = useState('')

  // Quick payment state per customer
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, string>>({})
  const [payingCustomers, setPayingCustomers] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Filtered customers
  const filteredCustomers = customers.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q))
    )
  })

  // Reset form
  const resetForm = useCallback(() => {
    setFormName('')
    setFormPhone('')
    setFormAddress('')
    setFormMilkType('COW')
    setFormDailyLimit('')
  }, [])

  // Handle add customer
  const handleAddCustomer = async () => {
    if (!formName.trim()) {
      toast.error('Name is required')
      return
    }
    setIsCreating(true)
    try {
      await createCustomer({
        name: formName.trim(),
        phone: formPhone.trim() || undefined,
        address: formAddress.trim() || undefined,
        milkType: formMilkType,
        dailyLimit: formDailyLimit ? parseFloat(formDailyLimit) : undefined,
      })
      toast.success('Customer added successfully')
      setShowAddDialog(false)
      resetForm()
    } catch {
      toast.error('Failed to add customer')
    } finally {
      setIsCreating(false)
    }
  }

  // Handle quick payment
  const handleQuickPayment = async (customerId: string) => {
    const amountStr = paymentAmounts[customerId]
    const amount = parseFloat(amountStr || '')
    if (!amountStr || isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    setPayingCustomers((prev) => ({ ...prev, [customerId]: true }))
    try {
      const today = new Date().toISOString().split('T')[0]
      await createPayment({
        customerId,
        amount,
        date: today,
        method: 'CASH',
        note: 'Quick payment',
      })
      toast.success(`₹${amount.toFixed(2)} payment recorded`)
      setPaymentAmounts((prev) => {
        const next = { ...prev }
        delete next[customerId]
        return next
      })
    } catch {
      toast.error('Payment failed')
    } finally {
      setPayingCustomers((prev) => ({ ...prev, [customerId]: false }))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 glass safe-top">
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Customers
              </h1>
              <Badge variant="secondary" className="font-number text-xs">
                {customers.length}
              </Badge>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              size="sm"
              className="rounded-btn gap-1.5"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Add Customer</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-4">
        {/* ── Search Bar ─────────────────────────────────────────────────────── */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-[16px] pl-10 pr-4 h-11 bg-card border-border"
          />
        </div>

        {/* ── Customer Cards List ────────────────────────────────────────────── */}
        {loadingCustomers ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 rounded-[16px] bg-card animate-pulse border border-border"
              />
            ))}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-secondary">
              <Users className="size-10 text-muted-foreground" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-foreground">
              No customers yet
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-[260px]">
              Add your first customer to start tracking milk deliveries and payments.
            </p>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="mt-6 rounded-btn gap-2"
            >
              <Plus className="size-4" />
              Add Customer
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="flex flex-col gap-3">
              {filteredCustomers.map((customer, index) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ delay: index * 0.03, duration: 0.25 }}
                >
                  <Card
                    className="rounded-[16px] border-border bg-card cursor-pointer hover:shadow-md transition-shadow p-0 gap-0 overflow-hidden"
                    onClick={() => router.push(`/customers/${customer.id}`)}
                  >
                    <div className="p-4">
                      {/* Top row: Name + Milk Type Badge */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading text-base font-semibold text-foreground truncate">
                            {customer.name}
                          </h3>
                          {customer.phone && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Phone className="size-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {customer.phone}
                              </span>
                            </div>
                          )}
                        </div>
                        <Badge
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-md ml-2 shrink-0 ${
                            customer.milkType === 'COW'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                          }`}
                        >
                          {customer.milkType}
                        </Badge>
                      </div>

                      {/* Stats row: Balance + Total Liters */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          <IndianRupee className="size-3.5" />
                          <span
                            className={`font-number text-sm font-bold ${
                              customer.balance > 0
                                ? 'text-red-500'
                                : 'text-green-500'
                            }`}
                          >
                            {customer.balance > 0 ? '+' : ''}
                            ₹{Math.abs(customer.balance).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-0.5">
                            due
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Droplets className="size-3.5 text-muted-foreground" />
                          <span className="font-number text-sm font-semibold text-foreground">
                            {customer.totalLiters.toFixed(1)}L
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-0.5">
                            total
                          </span>
                        </div>
                      </div>

                      {/* Quick Payment Row */}
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="relative flex-1">
                          <IndianRupee className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={paymentAmounts[customer.id] || ''}
                            onChange={(e) =>
                              setPaymentAmounts((prev) => ({
                                ...prev,
                                [customer.id]: e.target.value,
                              }))
                            }
                            className="h-8 rounded-lg pl-8 pr-2 text-sm font-number bg-secondary/50 border-border"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <Button
                          size="sm"
                          className="h-8 rounded-lg px-3 text-xs shrink-0"
                          disabled={payingCustomers[customer.id]}
                          onClick={() => handleQuickPayment(customer.id)}
                        >
                          {payingCustomers[customer.id] ? '...' : 'Pay'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        <NavSpacer />
      </main>

      {/* ── Add Customer Dialog ──────────────────────────────────────────────── */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="rounded-[16px] sm:rounded-lg max-w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Add Customer</DialogTitle>
            <DialogDescription>
              Add a new customer to your dairy business.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Customer name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="rounded-lg"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="Phone number"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="rounded-lg"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Address"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                className="rounded-lg"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-2">
                <Label>Milk Type</Label>
                <Select value={formMilkType} onValueChange={setFormMilkType}>
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
                <Label htmlFor="dailyLimit">Daily Limit (L)</Label>
                <Input
                  id="dailyLimit"
                  type="number"
                  placeholder="0"
                  value={formDailyLimit}
                  onChange={(e) => setFormDailyLimit(e.target.value)}
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
              onClick={() => {
                setShowAddDialog(false)
                resetForm()
              }}
              className="rounded-btn"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCustomer}
              disabled={isCreating || !formName.trim()}
              className="rounded-btn"
            >
              {isCreating ? 'Adding...' : 'Add Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Bottom Navigation ────────────────────────────────────────────────── */}
      <BottomNavigation />
    </div>
  )
}
