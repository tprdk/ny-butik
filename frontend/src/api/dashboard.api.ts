import { apiClient } from './client'
import type { AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types/api.types'

const unwrap = <T>(res: AxiosResponse<ApiResponse<T>>): T => res.data.data

export interface OrderSummaryItem {
  id: number
  orderNumber: string
  customerName: string
  totalAmount: number
  status: string
  createdAt: string
}

export interface TopProductItem {
  productId: number
  productName: string
  totalSold: number
  totalRevenue: number
}

export interface DashboardStats {
  totalOrders: number
  todayOrders: number
  totalRevenue: number
  todayRevenue: number
  totalProducts: number
  lowStockProducts: number
  totalCustomers: number
  newCustomersToday: number
  recentOrders: OrderSummaryItem[]
  topProducts: TopProductItem[]
}

export interface SalesReportRow {
  date: string
  orderCount: number
  revenue: number
}

export interface SalesReportResponse {
  from: string
  to: string
  totalRevenue: number
  totalOrders: number
  rows: SalesReportRow[]
}

export const dashboardApi = {
  getStats: (): Promise<DashboardStats> =>
    apiClient.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats').then(unwrap),

  getSalesReport: (from: string, to: string): Promise<SalesReportResponse> =>
    apiClient
      .get<ApiResponse<SalesReportResponse>>(`/admin/reports/sales?from=${from}&to=${to}`)
      .then(unwrap),

  exportCsv: async (from: string, to: string): Promise<void> => {
    const res = await apiClient.get(`/admin/reports/sales/export?from=${from}&to=${to}`, {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = `satis-raporu-${from}-${to}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  },
}
