import { api } from './axios'
import type { Product, CreateProductDto, UpdateProductDto, ProductFilters, PaginatedProducts } from '../features/products/types'

// ─── Normalizar Decimal de Prisma → number JS ─────────────────────────────────

export function normalizeProduct(p: any): Product {
  const numFields = [
    'costPrice','retailPrice','wholesalePrice1','wholesalePrice2','wholesalePrice3',
    'memberPrice','vipPrice2','vipPrice3','vipPrice4','vipPrice5','taxRate',
  ]
  const out: any = { ...p }
  for (const f of numFields) {
    if (out[f] != null) out[f] = Number(out[f])
  }
  return out as Product
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const productsApi = {

  /**
   * Lista productos con soporte para múltiples categoryIds (incluye subcategorías).
   * Usado por ProductsPage.
   */
  getAll: async (filters?: ProductFilters): Promise<PaginatedProducts> => {
    const params: any = {}
    if (filters?.search)      params.search   = filters.search
    if (filters?.isActive !== undefined) params.isActive = filters.isActive
    if (filters?.page)        params.page     = filters.page
    if (filters?.limit)       params.limit    = filters.limit

    // Pasar categoryIds como array (Axios serializa como categoryIds[]=1&categoryIds[]=2)
    if (filters?.categoryIds?.length) {
      params.categoryIds = filters.categoryIds
    } else if (filters?.categoryId) {
      params.categoryId = filters.categoryId
    }

    const res = await api.get<any>('/products', { params })
    const raw  = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
    const total = res.data?.total ?? raw.length
    return {
      data:  raw.map(normalizeProduct),
      total,
      page:  res.data?.page  ?? filters?.page  ?? 1,
      limit: res.data?.limit ?? filters?.limit ?? 20,
    }
  },

  getOne: async (id: string): Promise<Product> => {
    const res = await api.get<any>(`/products/${id}`)
    return normalizeProduct(res.data)
  },

  /**
   * Crea el producto y, si initialStock > 0, registra el stock inicial.
   * Devuelve solo el Product (compatible con el mutation handler del ProductsPage).
   */
  create: async (dto: CreateProductDto): Promise<Product> => {
    const { initialStock, ...productData } = dto

    // 1. Crear el producto
    const res = await api.post<any>('/products', productData)
    const product = normalizeProduct(res.data)

    // 2. Registrar stock inicial si corresponde
    if (initialStock && initialStock > 0) {
      try {
        await api.post('/stock/adjust', {
          productId:    product.id,
          quantity:     initialStock,
          movementType: 'ADJUSTMENT',
          notes:        `Stock inicial al crear "${product.name}"`,
        })
      } catch (err) {
        console.warn('Producto creado pero falló el stock inicial:', err)
        // No lanzar — el producto ya existe, el stock se puede ajustar después
      }
    }

    return product
  },

  update: async (id: string, dto: Partial<UpdateProductDto>): Promise<Product> => {
    const { initialStock, ...productData } = dto as any
    const res = await api.patch<any>(`/products/${id}`, productData)
    return normalizeProduct(res.data)
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`)
  },
}
