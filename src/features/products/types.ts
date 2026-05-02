// src/features/products/types.ts

export interface Category {
  id: number;
  name: string;
  parentId: number | null;
  children?: Category[];
  _count?: { products: number };
}

export interface CreateCategoryDto {
  name: string;
  parentId?: number | null;
}
export interface UpdateCategoryDto {
  name?: string;
  parentId?: number | null;
}

// ── PRODUCT ──────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  sku: string;           // código interno (Cpcode del S12)
  barcode?: string | null;
  name: string;
  description?: string | null;
  spec?: string | null;
  unit?: string | null;
  notes?: string | null;
  isActive: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  categoryId?: number | null;
  category?: Category | null;

  costPrice: number;
  retailPrice: number;
  wholesalePrice1?: number | null;
  wholesalePrice2?: number | null;
  wholesalePrice3?: number | null;
  memberPrice?: number | null;
  vipPrice2?: number | null;
  vipPrice3?: number | null;
  vipPrice4?: number | null;
  vipPrice5?: number | null;
  taxRate?: number | null;
  isTaxExempt?: boolean;

  mainImageUrl?: string | null;

  createdAt: string;
  updatedAt: string;

  // Calculado por el backend
  totalStock?: number;
  isLowStock?: boolean;
}

export interface CreateProductDto {
  name: string;
  sku?: string;          // código interno — auto-generado si vacío
  barcode?: string;
  description?: string;
  spec?: string;
  unit?: string;
  notes?: string;
  isActive?: boolean;
  isPublished?: boolean;
  isFeatured?: boolean;
  categoryId?: number | null;

  costPrice: number;
  retailPrice: number;
  wholesalePrice1?: number;
  wholesalePrice2?: number;
  wholesalePrice3?: number;
  memberPrice?: number;
  vipPrice2?: number;
  vipPrice3?: number;
  vipPrice4?: number;
  vipPrice5?: number;
  taxRate?: number;
  isTaxExempt?: boolean;
  mainImageUrl?: string;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface ProductFilters {
  search?: string;
  categoryId?: number | null;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}
