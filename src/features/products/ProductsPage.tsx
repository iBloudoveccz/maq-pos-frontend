import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { categoriesApi } from '@/api/categories';
import { productsApi }   from '@/api/products';

import CategoryPanel       from './components/CategoryPanel';
import ProductTable        from './components/ProductTable';
import CategoryFormModal   from './components/CategoryFormModal';
import ProductFormModal    from './components/ProductFormModal';
import DeleteProductModal  from './components/DeleteProductModal';

import type {
  Category, Product, CreateCategoryDto, CreateProductDto, UpdateProductDto
} from './types';

type CatModal =
  | { mode: 'create' }
  | { mode: 'create-sub'; parent: Category }
  | { mode: 'edit';       target: Category }
  | { mode: 'delete';     target: Category }
  | null;

export default function ProductsPage() {
  const qc = useQueryClient();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const LIMIT = 20;

  const [catModal, setCatModal]   = useState<CatModal>(null);
  const [prodModal, setProdModal] = useState<{ open: boolean; product?: Product | null }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<Product | null>(null);

  // Debounce search
  const searchRef = useRef('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    searchRef.current = search;
    const t = setTimeout(() => {
      if (searchRef.current === search) { setDebouncedSearch(search); setPage(1); }
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const handleCategorySelect = useCallback((id: number | null) => {
    setSelectedCategoryId(id); setPage(1); setSearch(''); setDebouncedSearch('');
  }, []);

  // ── Queries ──
  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn:  categoriesApi.getAll,
    staleTime: 5 * 60 * 1000,
  });

  const { data: productsData, isLoading: prodsLoading } = useQuery({
    queryKey: ['products', { search: debouncedSearch, categoryId: selectedCategoryId, page }],
    queryFn:  () => productsApi.getAll({
      search: debouncedSearch || undefined,
      categoryId: selectedCategoryId ?? undefined,
      page, limit: LIMIT,
    }),
    placeholderData: (prev) => prev,
  });

  const products: Product[] = productsData?.data ?? [];
  const total = productsData?.total ?? 0;

  // ── Category mutations ──
  const createCatMutation = useMutation({
    mutationFn: (dto: CreateCategoryDto) => categoriesApi.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Categoría creada'); setCatModal(null); },
    onError: (e: unknown) => { const ax = e as { response?: { data?: { message?: string | string[] } } }; const m = ax?.response?.data?.message; toast.error(Array.isArray(m) ? m[0] : (m ?? 'Error al crear categoría')); }
  });
  const updateCatMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: { name: string } }) => categoriesApi.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Categoría actualizada'); setCatModal(null); },
    onError: (e: unknown) => { const ax = e as { response?: { data?: { message?: string | string[] } } }; const m = ax?.response?.data?.message; toast.error(Array.isArray(m) ? m[0] : (m ?? 'Error al actualizar')); }
  });
  const deleteCatMutation = useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      if (selectedCategoryId === (catModal as { target: Category })?.target?.id) setSelectedCategoryId(null);
      toast.success('Categoría eliminada'); setCatModal(null);
    },
    onError: (e: unknown) => { const ax = e as { response?: { data?: { message?: string | string[] } } }; const m = ax?.response?.data?.message; toast.error(Array.isArray(m) ? m[0] : (m ?? 'Error al eliminar')); }
  });

  const handleCatConfirm = (data?: CreateCategoryDto | { name: string }) => {
    if (!catModal) return;
    if (catModal.mode === 'create')     createCatMutation.mutate(data as CreateCategoryDto);
    if (catModal.mode === 'create-sub') createCatMutation.mutate(data as CreateCategoryDto);
    if (catModal.mode === 'edit')       updateCatMutation.mutate({ id: catModal.target.id, dto: data as { name: string } });
    if (catModal.mode === 'delete')     deleteCatMutation.mutate(catModal.target.id);
  };

  // ── Product mutations ──
  const createProdMutation = useMutation({
    mutationFn: (dto: CreateProductDto) => productsApi.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Producto creado'); setProdModal({ open: false }); },
    onError: (e: unknown) => { const ax = e as { response?: { data?: { message?: string | string[] } } }; const m = ax?.response?.data?.message; toast.error(Array.isArray(m) ? m[0] : (m ?? 'Error al crear producto')); }
  });
  const updateProdMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductDto }) => productsApi.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Producto actualizado'); setProdModal({ open: false }); },
    onError: (e: unknown) => { const ax = e as { response?: { data?: { message?: string | string[] } } }; const m = ax?.response?.data?.message; toast.error(Array.isArray(m) ? m[0] : (m ?? 'Error al actualizar')); }
  });
  const deleteProdMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Producto eliminado'); setDeleteModal(null); },
    onError: (e: unknown) => { const ax = e as { response?: { data?: { message?: string | string[] } } }; const m = ax?.response?.data?.message; toast.error(Array.isArray(m) ? m[0] : (m ?? 'Error al eliminar')); }
  });
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => productsApi.update(id, { isActive }),
    onSuccess: (_d, vars) => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success(vars.isActive ? 'Producto activado' : 'Producto desactivado'); },
  });

  const handleSaveProduct = (data: CreateProductDto | UpdateProductDto) => {
    if (prodModal.product) updateProdMutation.mutate({ id: prodModal.product.id, dto: data });
    else createProdMutation.mutate(data as CreateProductDto);
  };

  const selectedCategory = selectedCategoryId ? categories.find(c => c.id === selectedCategoryId) : null;
  const catModalTarget = catModal && (catModal.mode === 'edit' || catModal.mode === 'delete') ? catModal.target : undefined;
  const catModalParent = catModal && catModal.mode === 'create-sub' ? catModal.parent : undefined;
  const catMutLoading  = createCatMutation.isPending || updateCatMutation.isPending || deleteCatMutation.isPending;
  const prodMutLoading = createProdMutation.isPending || updateProdMutation.isPending;

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

      {/* ── Left: category panel ── */}
      <CategoryPanel
        categories={categories}
        selectedId={selectedCategoryId}
        onSelect={handleCategorySelect}
        onCreateRoot={() => setCatModal({ mode: 'create' })}
        onCreateSub={parent => setCatModal({ mode: 'create-sub', parent })}
        onEdit={target => setCatModal({ mode: 'edit', target })}
        onDelete={target => setCatModal({ mode: 'delete', target })}
        loading={catsLoading}
      />

      {/* ── Right: product area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "white" }}>

        {/* Breadcrumb bar */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 flex-shrink-0">
          <span className="cursor-pointer hover:text-indigo-600 transition-colors font-medium" onClick={() => handleCategorySelect(null)}>
            Productos
          </span>
          {selectedCategory && (
            <> <span className="text-slate-300">/</span>
               <span className="text-slate-700 font-semibold">{selectedCategory.name}</span>
            </>
          )}
        </div>

        <ProductTable
          products={products} total={total} page={page} limit={LIMIT}
          loading={prodsLoading} search={search}
          onSearchChange={setSearch} onPageChange={setPage}
          onNew={() => setProdModal({ open: true, product: null })}
          onEdit={p => setProdModal({ open: true, product: p })}
          onDelete={setDeleteModal}
          onToggleActive={p => toggleActiveMutation.mutate({ id: p.id, isActive: !p.isActive })}
          categoryName={selectedCategory?.name}
        />
      </div>

      {/* ── Modals ── */}
      {catModal && (
        <CategoryFormModal
          mode={catModal.mode}
          category={catModalTarget ?? catModalParent}
          categories={categories}
          onConfirm={handleCatConfirm}
          onClose={() => setCatModal(null)}
          loading={catMutLoading}
        />
      )}
      {prodModal.open && (
        <ProductFormModal
          product={prodModal.product}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => setProdModal({ open: false })}
          loading={prodMutLoading}
          defaultCategoryId={selectedCategoryId}
        />
      )}
      {deleteModal && (
        <DeleteProductModal
          product={deleteModal}
          onConfirm={() => deleteProdMutation.mutate(deleteModal.id)}
          onClose={() => setDeleteModal(null)}
          loading={deleteProdMutation.isPending}
        />
      )}
    </div>
  );
}
