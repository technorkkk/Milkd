'use client'

import { create } from 'zustand'

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardData {
  todayDeliveries: number
  todayLiters: number
  todayAmount: number
  todayCollections: number
  totalCustomers: number
  totalOutstanding: number
  morningDeliveries: DeliveryItem[]
  eveningDeliveries: DeliveryItem[]
}

interface Customer {
  id: string
  businessId: string
  name: string
  phone: string | null
  address: string | null
  milkType: string
  dailyLimit: number
  balance: number
  totalLiters: number
  createdAt: string
  updatedAt: string
}

interface CustomerDetail extends Customer {
  recentDeliveries: DeliveryRecord[]
  recentPayments: PaymentRecord[]
  monthWiseLiters: Array<{ month: number; year: number; liters: number }>
}

interface DeliveryItem {
  id: string
  customerId: string
  customerName: string
  milkType: string
  liters: number
  rate: number
  amount: number
}

interface Delivery {
  id: string
  customerId: string
  customerName: string
  milkType: string
  date: string
  shift: string
  liters: number
  rate: number
  amount: number
  createdAt: string
  updatedAt: string
}

interface DeliveryRecord {
  id: string
  customerId: string
  date: string
  shift: string
  liters: number
  rate: number
  amount: number
  createdAt: string
  updatedAt: string
}

interface Payment {
  id: string
  customerId: string
  customerName: string
  amount: number
  date: string
  method: string
  note: string | null
  createdAt: string
  updatedAt: string
}

interface PaymentRecord {
  id: string
  customerId: string
  date: string
  amount: number
  method: string
  note: string | null
  createdAt: string
  updatedAt: string
}

interface Invoice {
  id: string
  customerId: string
  month: number
  year: number
  totalLiters: number
  totalAmount: number
  paidAmount: number
  balance: number
  createdAt: string
  updatedAt: string
}

interface MilkPrice {
  id: string
  businessId: string
  type: string
  price: number
  createdAt: string
  updatedAt: string
}

interface Settings {
  id: string
  businessId: string
  darkMode: boolean
  retentionMonths: number
  currency: string
  createdAt: string
  updatedAt: string
}

interface DeliveryFilters {
  date?: string
  shift?: string
  customerId?: string
}

interface PaymentFilters {
  customerId?: string
  date?: string
  method?: string
}

// ─── Store Interface ─────────────────────────────────────────────────────────

interface DairyStore {
  // Dashboard
  dashboard: DashboardData | null
  loadingDashboard: boolean
  fetchDashboard: () => Promise<void>

  // Customers
  customers: Customer[]
  loadingCustomers: boolean
  fetchCustomers: () => Promise<void>
  selectedCustomer: CustomerDetail | null
  loadingSelectedCustomer: boolean
  fetchCustomer: (id: string) => Promise<void>
  createCustomer: (data: Partial<Customer>) => Promise<Customer | null>
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<Customer | null>
  deleteCustomer: (id: string) => Promise<boolean>

  // Deliveries
  deliveries: Delivery[]
  loadingDeliveries: boolean
  deliveryFilters: DeliveryFilters
  setDeliveryFilters: (filters: Partial<DeliveryFilters>) => void
  fetchDeliveries: () => Promise<void>
  createDelivery: (data: { customerId: string; date: string; shift: string; liters: number }) => Promise<{ customerBalance: number } | null>
  deleteDelivery: (id: string) => Promise<{ customerBalance: number } | null>

  // Payments
  payments: Payment[]
  loadingPayments: boolean
  paymentFilters: PaymentFilters
  setPaymentFilters: (filters: Partial<PaymentFilters>) => void
  fetchPayments: () => Promise<void>
  createPayment: (data: { customerId: string; amount: number; date: string; method: string; note?: string }) => Promise<{ customerBalance: number } | null>
  deletePayment: (id: string) => Promise<{ customerBalance: number } | null>

  // Invoices
  currentInvoice: Invoice | null
  loadingInvoice: boolean
  fetchInvoice: (customerId: string, month: number, year: number) => Promise<void>

  // Milk Prices
  milkPrices: MilkPrice[]
  fetchMilkPrices: () => Promise<void>
  updateMilkPrices: (prices: Array<{ type: string; price: number }>) => Promise<void>

  // Settings
  settings: Settings | null
  fetchSettings: () => Promise<void>
  updateSettings: (data: Partial<Settings>) => Promise<void>
  resetData: (type: 'ALL' | 'CUSTOMERS' | 'DELIVERIES' | 'PAYMENTS') => Promise<boolean>

  // Clear selected customer
  clearSelectedCustomer: () => void
}

// ─── Helper ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(errorData.error || `Request failed with status ${res.status}`)
  }
  return res.json()
}

function buildQueryString(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, value)
    }
  })
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useDairyStore = create<DairyStore>((set, get) => ({
  // ── Dashboard ────────────────────────────────────────────────────────────
  dashboard: null,
  loadingDashboard: false,

  fetchDashboard: async () => {
    set({ loadingDashboard: true })
    try {
      const data = await apiFetch<DashboardData>('/api/dashboard')
      set({ dashboard: data, loadingDashboard: false })
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
      set({ loadingDashboard: false })
    }
  },

  // ── Customers ────────────────────────────────────────────────────────────
  customers: [],
  loadingCustomers: false,
  selectedCustomer: null,
  loadingSelectedCustomer: false,

  fetchCustomers: async () => {
    set({ loadingCustomers: true })
    try {
      const data = await apiFetch<Customer[]>('/api/customers')
      set({ customers: data, loadingCustomers: false })
    } catch (error) {
      console.error('Failed to fetch customers:', error)
      set({ loadingCustomers: false })
    }
  },

  fetchCustomer: async (id: string) => {
    set({ loadingSelectedCustomer: true })
    try {
      const data = await apiFetch<CustomerDetail>(`/api/customers/${id}`)
      set({ selectedCustomer: data, loadingSelectedCustomer: false })
    } catch (error) {
      console.error('Failed to fetch customer:', error)
      set({ loadingSelectedCustomer: false })
    }
  },

  createCustomer: async (data) => {
    try {
      const customer = await apiFetch<Customer>('/api/customers', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      // Refresh customer list and dashboard
      await get().fetchCustomers()
      await get().fetchDashboard()
      return customer
    } catch (error) {
      console.error('Failed to create customer:', error)
      throw error
    }
  },

  updateCustomer: async (id, data) => {
    try {
      const customer = await apiFetch<Customer>(`/api/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      // Refresh lists
      await get().fetchCustomers()
      if (get().selectedCustomer?.id === id) {
        await get().fetchCustomer(id)
      }
      await get().fetchDashboard()
      return customer
    } catch (error) {
      console.error('Failed to update customer:', error)
      throw error
    }
  },

  deleteCustomer: async (id) => {
    try {
      await apiFetch(`/api/customers/${id}`, { method: 'DELETE' })
      // Refresh lists
      if (get().selectedCustomer?.id === id) {
        set({ selectedCustomer: null })
      }
      await get().fetchCustomers()
      await get().fetchDashboard()
      return true
    } catch (error) {
      console.error('Failed to delete customer:', error)
      throw error
    }
  },

  clearSelectedCustomer: () => {
    set({ selectedCustomer: null })
  },

  // ── Deliveries ───────────────────────────────────────────────────────────
  deliveries: [],
  loadingDeliveries: false,
  deliveryFilters: {},
  setDeliveryFilters: (filters) => {
    set((state) => ({
      deliveryFilters: { ...state.deliveryFilters, ...filters },
    }))
  },

  fetchDeliveries: async () => {
    set({ loadingDeliveries: true })
    try {
      const { deliveryFilters } = get()
      const qs = buildQueryString(deliveryFilters)
      const data = await apiFetch<Delivery[]>(`/api/deliveries${qs}`)
      set({ deliveries: data, loadingDeliveries: false })
    } catch (error) {
      console.error('Failed to fetch deliveries:', error)
      set({ loadingDeliveries: false })
    }
  },

  createDelivery: async (data) => {
    try {
      const result = await apiFetch<{ delivery: Delivery; balance: number }>('/api/deliveries', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      // Auto-refresh related data
      await get().fetchDeliveries()
      await get().fetchDashboard()
      if (get().selectedCustomer?.id === data.customerId) {
        await get().fetchCustomer(data.customerId)
      }
      await get().fetchCustomers()
      return { customerBalance: result.balance }
    } catch (error) {
      console.error('Failed to create delivery:', error)
      throw error
    }
  },

  deleteDelivery: async (id) => {
    try {
      const result = await apiFetch<{ success: boolean; deletedDelivery: { customerId: string }; balance: number }>(`/api/deliveries/${id}`, {
        method: 'DELETE',
      })
      // Auto-refresh related data
      await get().fetchDeliveries()
      await get().fetchDashboard()
      if (result.deletedDelivery?.customerId && get().selectedCustomer?.id === result.deletedDelivery.customerId) {
        await get().fetchCustomer(result.deletedDelivery.customerId)
      }
      await get().fetchCustomers()
      return { customerBalance: result.balance }
    } catch (error) {
      console.error('Failed to delete delivery:', error)
      throw error
    }
  },

  // ── Payments ─────────────────────────────────────────────────────────────
  payments: [],
  loadingPayments: false,
  paymentFilters: {},
  setPaymentFilters: (filters) => {
    set((state) => ({
      paymentFilters: { ...state.paymentFilters, ...filters },
    }))
  },

  fetchPayments: async () => {
    set({ loadingPayments: true })
    try {
      const { paymentFilters } = get()
      const qs = buildQueryString(paymentFilters)
      const data = await apiFetch<Payment[]>(`/api/payments${qs}`)
      set({ payments: data, loadingPayments: false })
    } catch (error) {
      console.error('Failed to fetch payments:', error)
      set({ loadingPayments: false })
    }
  },

  createPayment: async (data) => {
    try {
      const result = await apiFetch<{ payment: Payment; balance: number }>('/api/payments', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      // Auto-refresh related data
      await get().fetchPayments()
      await get().fetchDashboard()
      if (get().selectedCustomer?.id === data.customerId) {
        await get().fetchCustomer(data.customerId)
      }
      await get().fetchCustomers()
      return { customerBalance: result.balance }
    } catch (error) {
      console.error('Failed to create payment:', error)
      throw error
    }
  },

  deletePayment: async (id) => {
    try {
      const result = await apiFetch<{ success: boolean; balance: number }>(`/api/payments/${id}`, {
        method: 'DELETE',
      })
      // Auto-refresh related data
      await get().fetchPayments()
      await get().fetchDashboard()
      // We don't have customerId from delete response, so refresh selected customer if any
      if (get().selectedCustomer) {
        await get().fetchCustomer(get().selectedCustomer!.id)
      }
      await get().fetchCustomers()
      return { customerBalance: result.balance }
    } catch (error) {
      console.error('Failed to delete payment:', error)
      throw error
    }
  },

  // ── Invoices ─────────────────────────────────────────────────────────────
  currentInvoice: null,
  loadingInvoice: false,

  fetchInvoice: async (customerId, month, year) => {
    set({ loadingInvoice: true })
    try {
      const data = await apiFetch<Invoice>(`/api/invoices/${customerId}?month=${month}&year=${year}`)
      set({ currentInvoice: data, loadingInvoice: false })
    } catch (error) {
      console.error('Failed to fetch invoice:', error)
      set({ currentInvoice: null, loadingInvoice: false })
    }
  },

  // ── Milk Prices ──────────────────────────────────────────────────────────
  milkPrices: [],

  fetchMilkPrices: async () => {
    try {
      const data = await apiFetch<MilkPrice[]>('/api/milk-price')
      set({ milkPrices: data })
    } catch (error) {
      console.error('Failed to fetch milk prices:', error)
    }
  },

  updateMilkPrices: async (prices) => {
    try {
      const data = await apiFetch<MilkPrice[]>('/api/milk-price', {
        method: 'PUT',
        body: JSON.stringify({ prices }),
      })
      set({ milkPrices: data })
    } catch (error) {
      console.error('Failed to update milk prices:', error)
      throw error
    }
  },

  // ── Settings ─────────────────────────────────────────────────────────────
  settings: null,

  fetchSettings: async () => {
    try {
      const data = await apiFetch<Settings>('/api/settings')
      set({ settings: data })
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  },

  updateSettings: async (data) => {
    try {
      const updated = await apiFetch<Settings>('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      set({ settings: updated })
    } catch (error) {
      console.error('Failed to update settings:', error)
      throw error
    }
  },

  resetData: async (type) => {
    try {
      await apiFetch('/api/settings/reset', {
        method: 'POST',
        body: JSON.stringify({ type }),
      })
      // Refresh all data after reset
      await Promise.all([
        get().fetchDashboard(),
        get().fetchCustomers(),
        get().fetchDeliveries(),
        get().fetchPayments(),
      ])
      set({ selectedCustomer: null, currentInvoice: null })
      return true
    } catch (error) {
      console.error('Failed to reset data:', error)
      throw error
    }
  },
}))

// Re-export types for use in components
export type {
  DashboardData,
  Customer,
  CustomerDetail,
  Delivery,
  DeliveryItem,
  Payment,
  Invoice,
  MilkPrice,
  Settings,
  DeliveryFilters,
  PaymentFilters,
}
