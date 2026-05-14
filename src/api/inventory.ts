import { api } from './axios'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface StockItem {
  id: number
  productId: number
  warehouseId: number
  quantity: number
  averageCost: number
  totalValue: number
  product: {
    id: number
    name: string
    sku: string
    barcode?: string
    unit: string
    retailPrice: number
    costPrice: number
    category?: { id: number; name: string }
    mainImageUrl?: string
  }
  warehouse: {
    id: number
    code: string
    name: string
  }
}

export interface StockMovement {
  id: number
  type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'RETURN' | 'OWN_USE' | 'CONVERT'
  quantity: number
  costPrice: number
  totalValue: number
  referenceId?: string
  notes?: string
  createdAt: string
  product: { id: number; name: string; sku: string; unit: string }
  warehouse: { id: number; name: string; code: string }
  user?: { id: number; name: string }
}

export interface StockSummary {
  totalProducts: number
  totalUnits: number
  totalValue: number
  lowStockCount: number
  outOfStockCount: number
}

export interface AdjustStockDto {
  productId: number
  warehouseId: number
  quantity: number      // puede ser negativo (merma) o positivo (sobrante)
  reason: string
  notes?: string
}

export interface MovementsFilters {
  productId?: number
  warehouseId?: number
  type?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const inventoryApi = {

  /** Stock actual — todos los productos en todos los almacenes */
  getStock: async (params?: {
    warehouseId?: number
    categoryId?: number
    search?: string
    lowStock?: boolean
  }) => {
    const res = await api.get<{ data: StockItem[]; total: number }>('/stock', { params })
    return res.data
  },

  /** Resumen ejecutivo para las cards */
  getSummary: async (): Promise<StockSummary> => {
    const res = await api.get<StockSummary>('/stock/summary')
    return res.data
  },

  /** Historial de movimientos */
  getMovements: async (filters: MovementsFilters = {}) => {
    const res = await api.get<{ data: StockMovement[]; total: number; page: number; limit: number }>(
      '/stock/movements',
      { params: { ...filters, limit: filters.limit ?? 30 } }
    )
    return res.data
  },

  /** Ajuste manual de stock */
  adjust: async (dto: AdjustStockDto) => {
    const res = await api.post<StockMovement>('/stock/adjust', dto)
    return res.data
  },

  /** Lista de almacenes disponibles */
  getWarehouses: async () => {
    const res = await api.get<{ id: number; code: string; name: string }[]>('/stock/warehouses')
    return res.data
  },
}
