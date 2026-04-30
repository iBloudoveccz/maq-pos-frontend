// ─── Category ────────────────────────────────────────────────────────────────
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

// ─── Product ─────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  code: string;
  barcode?: string | null;
  name: string;
  unit?: string | null;
  spec?: string | null;
  notes?: string | null;
  isActive: boolean;
  categoryId?: number | null;
  category?: Category | null;

  // Precios
  costPrice: number;       // jhj  - precio de costo
  retailPrice: number;     // lsj  - precio de venta público
  wholesalePrice1?: number | null; // pfj
  wholesalePrice2?: number | null; // pfj2
  wholesalePrice3?: number | null; // pfj3
  memberPrice?: number | null;     // Hyj - precio miembro
  vipPrice2?: number | null;
  vipPrice3?: number | null;
  vipPrice4?: number | null;
  vipPrice5?: number | null;

  // Empaque
  zzsl?: number | null;    // unidades por caja
  lunit?: number | null;   // unidad base conversión

  createdAt: string;
  updatedAt: string;

  // Stock (para mostrar en tabla)
  stock?: StockSummary[];
}

export interface StockSummary {
  warehouseId: string;
  warehouse?: { name: string };
  quantity: number;
  minStock: number;
}

export interface CreateProductDto {
  code: string;
  barcode?: string;
  name: string;
  unit?: string;
  spec?: string;
  notes?: string;
  isActive?: boolean;
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
  zzsl?: number;
  lunit?: number;
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
