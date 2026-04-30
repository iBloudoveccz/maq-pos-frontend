import { useState, useEffect } from 'react';
import { X, Package, DollarSign, Tag, ChevronRight } from 'lucide-react';
import type { Product, Category, CreateProductDto, UpdateProductDto } from '../types';

interface Props {
  product?: Product | null;
  categories: Category[];
  onSave: (data: CreateProductDto | UpdateProductDto) => void;
  onClose: () => void;
  loading?: boolean;
  defaultCategoryId?: number | null;
}

type Tab = 'basic' | 'prices' | 'extra';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'basic',  label: '1. Información básica', icon: <Package size={13} /> },
  { id: 'prices', label: '2. Precios',             icon: <DollarSign size={13} /> },
  { id: 'extra',  label: '3. Otras propiedades',   icon: <Tag size={13} /> },
];

const emptyForm = (): CreateProductDto => ({
  code: '', barcode: '', name: '', unit: 'Unid',
  spec: '', notes: '', isActive: true, categoryId: null,
  costPrice: 0, retailPrice: 0,
  wholesalePrice1: 0, wholesalePrice2: 0, wholesalePrice3: 0,
  memberPrice: 0,
  vipPrice2: 0, vipPrice3: 0, vipPrice4: 0, vipPrice5: 0,
  zzsl: 1, lunit: 1,
});

export default function ProductFormModal({
  product, categories, onSave, onClose, loading, defaultCategoryId
}: Props) {
  const [tab, setTab] = useState<Tab>('basic');
  const [form, setForm] = useState<CreateProductDto>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setForm({
        code:            product.code,
        barcode:         product.barcode ?? '',
        name:            product.name,
        unit:            product.unit ?? 'Unid',
        spec:            product.spec ?? '',
        notes:           product.notes ?? '',
        isActive:        product.isActive,
        categoryId:      product.categoryId ?? null,
        costPrice:       product.costPrice,
        retailPrice:     product.retailPrice,
        wholesalePrice1: product.wholesalePrice1 ?? 0,
        wholesalePrice2: product.wholesalePrice2 ?? 0,
        wholesalePrice3: product.wholesalePrice3 ?? 0,
        memberPrice:     product.memberPrice ?? 0,
        vipPrice2:       product.vipPrice2 ?? 0,
        vipPrice3:       product.vipPrice3 ?? 0,
        vipPrice4:       product.vipPrice4 ?? 0,
        vipPrice5:       product.vipPrice5 ?? 0,
        zzsl:            product.zzsl ?? 1,
        lunit:           product.lunit ?? 1,
      });
    } else {
      const f = emptyForm();
      f.categoryId = defaultCategoryId ?? null;
      setForm(f);
    }
    setErrors({});
    setTab('basic');
  }, [product, defaultCategoryId]);

  const set = (key: keyof CreateProductDto, value: unknown) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };

  const numSet = (key: keyof CreateProductDto) =>
    (e: React.ChangeEvent<HTMLInputElement>) => set(key, parseFloat(e.target.value) || 0);

  // Auto-calculate retail price from cost (adds 18% IGV + margin)
  const autoRetail = () => {
    if (form.costPrice > 0 && form.retailPrice === 0) {
      const suggested = parseFloat((form.costPrice * 1.18 * 1.3).toFixed(2));
      set('retailPrice', suggested);
    }
  };

  // IGV amount
  const igv = form.retailPrice > 0 ? parseFloat((form.retailPrice - form.retailPrice / 1.18).toFixed(2)) : 0;
  const basePrice = form.retailPrice > 0 ? parseFloat((form.retailPrice / 1.18).toFixed(2)) : 0;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.code.trim())  e.code = 'El código es requerido';
    if (!form.name.trim())  e.name = 'El nombre es requerido';
    if (form.retailPrice <= 0) e.retailPrice = 'El precio de venta debe ser mayor a 0';
    setErrors(e);
    if (Object.keys(e).length > 0) {
      if (e.code || e.name) setTab('basic');
      else if (e.retailPrice) setTab('prices');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
  };

  // Build flat categories list for dropdown (with indentation)
  const flatCats: { id: number; label: string; depth: number }[] = [];
  const buildFlat = (cats: Category[], depth = 0) => {
    cats.filter(c => c.parentId === null || depth > 0 || categories.some(cc => cc.id === c.id))
      .forEach(c => {
        if (c.parentId === null) {
          flatCats.push({ id: c.id, label: c.name, depth: 0 });
          const children = categories.filter(ch => ch.parentId === c.id);
          children.forEach(ch => flatCats.push({ id: ch.id, label: ch.name, depth: 1 }));
        }
      });
  };
  const roots = categories.filter(c => c.parentId === null);
  roots.forEach(r => {
    flatCats.push({ id: r.id, label: r.name, depth: 0 });
    categories.filter(c => c.parentId === r.id).forEach(ch =>
      flatCats.push({ id: ch.id, label: ch.name, depth: 1 })
    );
  });

  const inputCls = (field: string) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? 'border-red-300 focus:ring-red-200'
        : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-400'
    }`;

  const numCls = `border rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all border-slate-300 w-full`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Package size={16} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm">
                {product ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              {product && <p className="text-xs text-slate-400">{product.code} · {product.name}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors -mb-px
                ${tab === t.id
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── TAB 1: BASIC ── */}
          {tab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Categoría</label>
                  <select
                    value={form.categoryId ?? ''}
                    onChange={e => set('categoryId', e.target.value ? parseInt(e.target.value) : null)}
                    className={inputCls('categoryId')}
                  >
                    <option value="">-- Sin categoría --</option>
                    {flatCats.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.depth > 0 ? `\u00A0\u00A0\u00A0└ ${c.label}` : c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Code */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Código <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.code}
                    onChange={e => set('code', e.target.value)}
                    placeholder="Ej: 01000001"
                    className={inputCls('code')}
                  />
                  {errors.code && <p className="text-red-500 text-xs mt-0.5">{errors.code}</p>}
                </div>

                {/* Barcode */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Código de barras</label>
                  <input
                    value={form.barcode}
                    onChange={e => set('barcode', e.target.value)}
                    placeholder="EAN / UPC"
                    className={inputCls('barcode')}
                  />
                </div>

                {/* Name */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Nombre <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={e => set('name', e.target.value.toUpperCase())}
                    placeholder="Nombre del producto"
                    className={inputCls('name')}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>}
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Unidad</label>
                  <select value={form.unit} onChange={e => set('unit', e.target.value)} className={inputCls('unit')}>
                    <option>Unid</option>
                    <option>Caja</option>
                    <option>Kg</option>
                    <option>Lt</option>
                    <option>Par</option>
                    <option>Doc</option>
                    <option>Paq</option>
                    <option>Bolsa</option>
                  </select>
                </div>

                {/* Spec */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Especificación</label>
                  <input
                    value={form.spec}
                    onChange={e => set('spec', e.target.value)}
                    placeholder="Presentación, tamaño..."
                    className={inputCls('spec')}
                  />
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-2">Estado</label>
                  <div className="flex gap-3">
                    {[true, false].map(val => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => set('isActive', val)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                          form.isActive === val
                            ? val ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-400 text-white border-slate-400'
                            : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {val ? '✓ Activo' : '✗ Inactivo'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Notas</label>
                  <textarea
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                    rows={2}
                    placeholder="Observaciones adicionales..."
                    className={`${inputCls('notes')} resize-none`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: PRICES ── */}
          {tab === 'prices' && (
            <div className="space-y-5">
              {/* Main pricing section */}
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">
                  Configuración de precio e inventario
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Precio de compra (costo)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 text-xs">S/.</span>
                      <input
                        type="number" step="0.01" min="0"
                        value={form.costPrice || ''}
                        onChange={numSet('costPrice')}
                        onBlur={autoRetail}
                        className={`${numCls} pl-8`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Precio de venta (público) <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 text-xs">S/.</span>
                      <input
                        type="number" step="0.01" min="0"
                        value={form.retailPrice || ''}
                        onChange={numSet('retailPrice')}
                        className={`${errors.retailPrice ? 'border-red-300' : ''} ${numCls} pl-8`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.retailPrice && <p className="text-red-500 text-xs mt-0.5">{errors.retailPrice}</p>}
                  </div>
                </div>

                {/* IGV preview */}
                {form.retailPrice > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white rounded-lg p-2 border border-indigo-100">
                      <p className="text-xs text-slate-500">Precio base</p>
                      <p className="font-bold text-slate-800 text-sm">S/. {basePrice.toFixed(2)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-indigo-100">
                      <p className="text-xs text-slate-500">IGV (18%)</p>
                      <p className="font-bold text-amber-600 text-sm">S/. {igv.toFixed(2)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-indigo-100">
                      <p className="text-xs text-slate-500">Margen bruto</p>
                      <p className={`font-bold text-sm ${
                        form.costPrice > 0 && form.retailPrice > form.costPrice
                          ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        {form.costPrice > 0
                          ? `${(((form.retailPrice - form.costPrice) / form.costPrice) * 100).toFixed(1)}%`
                          : '—'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Wholesale prices */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                  Precios mayoristas
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {([1,2,3] as const).map(n => (
                    <div key={n}>
                      <label className="block text-xs text-slate-500 mb-1">Mayorista {n}</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs">S/.</span>
                        <input
                          type="number" step="0.01" min="0"
                          value={form[`wholesalePrice${n}` as keyof CreateProductDto] as number || ''}
                          onChange={numSet(`wholesalePrice${n}` as keyof CreateProductDto)}
                          className={`${numCls} pl-7 text-sm`}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Member & VIP prices */}
              <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                <h3 className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-3">
                  Precios Miembro / VIP
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Precio Miembro (Hyj)</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs">S/.</span>
                      <input
                        type="number" step="0.01" min="0"
                        value={form.memberPrice || ''}
                        onChange={numSet('memberPrice')}
                        className={`${numCls} pl-7`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {([2,3,4,5] as const).map(n => (
                    <div key={n}>
                      <label className="block text-xs text-slate-500 mb-1">VIP {n}</label>
                      <div className="relative">
                        <span className="absolute left-2 top-2.5 text-slate-400 text-xs">S/.</span>
                        <input
                          type="number" step="0.01" min="0"
                          value={form[`vipPrice${n}` as keyof CreateProductDto] as number || ''}
                          onChange={numSet(`vipPrice${n}` as keyof CreateProductDto)}
                          className={`${numCls} pl-6 text-sm`}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: EXTRA ── */}
          {tab === 'extra' && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                  Unidades y empaque
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Cantidad por caja (zzsl)
                    </label>
                    <input
                      type="number" step="1" min="1"
                      value={form.zzsl || 1}
                      onChange={numSet('zzsl')}
                      className={numCls}
                      placeholder="1"
                    />
                    <p className="text-xs text-slate-400 mt-1">Unidades que contiene una caja</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Unidad base (lunit)
                    </label>
                    <input
                      type="number" step="0.01" min="0.01"
                      value={form.lunit || 1}
                      onChange={numSet('lunit')}
                      className={numCls}
                      placeholder="1"
                    />
                    <p className="text-xs text-slate-400 mt-1">Factor de conversión base</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">
                  Resumen del producto
                </h3>
                <div className="space-y-2 text-sm">
                  {[
                    ['Código', form.code || '—'],
                    ['Nombre', form.name || '—'],
                    ['Categoría', flatCats.find(c => c.id === form.categoryId)?.label || 'Sin categoría'],
                    ['Unidad', form.unit || '—'],
                    ['Precio costo', `S/. ${(form.costPrice || 0).toFixed(2)}`],
                    ['Precio venta', `S/. ${(form.retailPrice || 0).toFixed(2)}`],
                    ['Estado', form.isActive ? 'Activo' : 'Inactivo'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-500 text-xs">{k}</span>
                      <span className="font-medium text-slate-800 text-xs text-right max-w-[200px] truncate">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          {/* Tab navigation arrows */}
          <div className="flex gap-2">
            {tab !== 'basic' && (
              <button
                onClick={() => setTab(tab === 'extra' ? 'prices' : 'basic')}
                className="text-xs text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors"
              >
                ← Anterior
              </button>
            )}
            {tab !== 'extra' && (
              <button
                onClick={() => setTab(tab === 'basic' ? 'prices' : 'extra')}
                className="text-xs text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200 flex items-center gap-1 transition-colors"
              >
                Siguiente <ChevronRight size={12} />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors"
            >
              {loading ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
