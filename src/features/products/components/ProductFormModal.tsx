import { useState, useEffect, useRef } from 'react';
import { X, Package, Wand2, TrendingUp, TrendingDown, Minus, ImagePlus, Trash2, Plus, Search, Building2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersApi, type Supplier, type CreateSupplierDto } from '@/api/suppliers';
import type { Product, Category, CreateProductDto, UpdateProductDto } from '../types';

interface Props {
  product?: Product | null;
  categories: Category[];
  onSave: (data: CreateProductDto | UpdateProductDto) => void;
  onClose: () => void;
  loading?: boolean;
  defaultCategoryId?: number | null;
}

const UNITS = ['Unid', 'Caja', 'Kg', 'Lt', 'Par', 'Doc', 'Paq', 'Bolsa', 'Rollo', 'Mt', 'Grm'];

const empty = (): CreateProductDto => ({
  sku: '', barcode: '', name: '', unit: 'Unid',
  spec: '', description: '', notes: '', isActive: true,
  isPublished: true, isFeatured: false, categoryId: null,
  costPrice: 0, retailPrice: 0,
  wholesalePrice1: 0, wholesalePrice2: 0, wholesalePrice3: 0,
  memberPrice: 0, vipPrice2: 0, vipPrice3: 0, vipPrice4: 0, vipPrice5: 0,
  taxRate: 0.18, isTaxExempt: false,
});

function generateSku(categoryId?: number | null) {
  const prefix = categoryId ? String(categoryId).padStart(2, '0') : '00';
  return `${prefix}${String(Date.now()).slice(-6)}`;
}

function suggestRetail(cost: number) {
  return cost > 0 ? parseFloat((cost * 1.20 * 1.18).toFixed(2)) : 0;
}

function MarginBadge({ cost, retail }: { cost: number; retail: number }) {
  if (!cost || !retail) return null;
  const m = ((retail - cost) / cost) * 100;
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${m >= 20 ? 'bg-emerald-100 text-emerald-700' : m >= 12 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
      {m >= 20 ? <TrendingUp size={11}/> : m >= 12 ? <Minus size={11}/> : <TrendingDown size={11}/>}
      {m.toFixed(1)}%
    </div>
  );
}

/* ─── Mini-modal para crear proveedor rápido ─── */
function QuickSupplierModal({ onCreated, onClose }: { onCreated: (s: Supplier) => void; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<CreateSupplierDto>({ code: '', name: '', ruc: '', contactName: '', phone: '', email: '', address: '' });
  const [err, setErr] = useState('');

  const mut = useMutation({
    mutationFn: suppliersApi.create,
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      onCreated(s);
    },
    onError: (e: any) => setErr(e?.response?.data?.message ?? 'Error al crear proveedor'),
  });

  const lbl = 'block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1';
  const inp = 'w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all';

  const tabs = [
    { id: 'basic',    label: 'F1 Información básica' },
    { id: 'contact',  label: 'F2 Contacto' },
    { id: 'finance',  label: 'F3 Finanzas' },
  ];
  const [tab, setTab] = useState('basic');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-indigo-600" />
            <span className="font-bold text-slate-800 text-sm">Nuevo proveedor</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-200 text-slate-400"><X size={14}/></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-5 pt-3 gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-t-md transition-colors border-b-2 -mb-px ${tab === t.id ? 'border-indigo-500 text-indigo-700 bg-indigo-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'basic' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Código <span className="text-red-400">*</span></label>
                  <input value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value}))} placeholder="619" className={inp} />
                </div>
                <div>
                  <label className={lbl}>RUC / NIT</label>
                  <input value={form.ruc} onChange={e => setForm(f => ({...f, ruc: e.target.value}))} placeholder="20123456789" className={inp} />
                </div>
              </div>
              <div>
                <label className={lbl}>Nombre de la empresa <span className="text-red-400">*</span></label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Distribuidora SAC" className={inp} />
              </div>
              <div>
                <label className={lbl}>Nombre de contacto</label>
                <input value={form.contactName} onChange={e => setForm(f => ({...f, contactName: e.target.value}))} placeholder="Juan Pérez" className={inp} />
              </div>
            </div>
          )}
          {tab === 'contact' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Teléfono</label>
                  <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="987654321" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Correo electrónico</label>
                  <input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="proveedor@email.com" className={inp} />
                </div>
              </div>
              <div>
                <label className={lbl}>Dirección</label>
                <input value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} placeholder="Jr. Lima 123, Tarapoto" className={inp} />
              </div>
            </div>
          )}
          {tab === 'finance' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-lg text-center text-sm text-slate-400">
                Los datos financieros del proveedor se gestionan desde el módulo de Compras
              </div>
              <div>
                <label className={lbl}>Observaciones</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
                  rows={3} placeholder="Notas internas del proveedor..." className={`${inp} resize-none`} />
              </div>
            </div>
          )}

          {err && <p className="text-red-500 text-xs mt-3">{err}</p>}
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg">Cerrar</button>
          <button
            onClick={() => {
              if (!form.code.trim() || !form.name.trim()) { setErr('Código y nombre son requeridos'); return; }
              setErr('');
              mut.mutate(form);
            }}
            disabled={mut.isPending}
            className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50">
            {mut.isPending ? 'Guardando...' : 'Save (F4)'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal principal ─── */
export default function ProductFormModal({ product, categories, onSave, onClose, loading, defaultCategoryId }: Props) {
  const [form, setForm]         = useState<CreateProductDto>(empty());
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showSupplierDrop, setShowSupplierDrop] = useState(false);
  const [showQuickSupplier, setShowQuickSupplier] = useState(false);
  const [initialStock, setInitialStock] = useState<number>(0);
  const fileRef  = useRef<HTMLInputElement>(null);
  const dropRef  = useRef<HTMLDivElement>(null);

  /* Suppliers */
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers', supplierSearch],
    queryFn: () => suppliersApi.list(supplierSearch || undefined),
  });

  /* Cerrar dropdown al hacer click afuera */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowSupplierDrop(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (product) {
      setForm({
        sku: product.sku, barcode: product.barcode ?? '', name: product.name,
        unit: product.unit ?? 'Unid', spec: product.spec ?? '',
        description: product.description ?? '', notes: product.notes ?? '',
        isActive: product.isActive, isPublished: product.isPublished,
        isFeatured: product.isFeatured, categoryId: product.categoryId ?? null,
        costPrice: Number(product.costPrice), retailPrice: Number(product.retailPrice),
        wholesalePrice1: Number(product.wholesalePrice1 ?? 0),
        wholesalePrice2: Number(product.wholesalePrice2 ?? 0),
        wholesalePrice3: Number(product.wholesalePrice3 ?? 0),
        memberPrice: Number(product.memberPrice ?? 0),
        vipPrice2: Number(product.vipPrice2 ?? 0), vipPrice3: Number(product.vipPrice3 ?? 0),
        vipPrice4: Number(product.vipPrice4 ?? 0), vipPrice5: Number(product.vipPrice5 ?? 0),
        taxRate: Number(product.taxRate ?? 0.18), isTaxExempt: product.isTaxExempt ?? false,
      });
      setImgPreview(product.mainImageUrl ?? null);
    } else {
      const f = empty();
      f.categoryId = defaultCategoryId ?? null;
      f.sku = generateSku(defaultCategoryId);
      setForm(f);
      setImgPreview(null);
      setSelectedSupplier(null);
      setInitialStock(0);
    }
    setErrors({});
  }, [product, defaultCategoryId]);

  const set = (key: keyof CreateProductDto, value: unknown) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };
  const num = (key: keyof CreateProductDto) =>
    (e: React.ChangeEvent<HTMLInputElement>) => set(key, parseFloat(e.target.value) || 0);

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cost = parseFloat(e.target.value) || 0;
    set('costPrice', cost);
    if (form.retailPrice === 0 && cost > 0) set('retailPrice', suggestRetail(cost));
  };

  const igv  = form.retailPrice > 0 ? form.retailPrice - form.retailPrice / 1.18 : 0;
  const base = form.retailPrice > 0 ? form.retailPrice / 1.18 : 0;

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImgPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())     e.name        = 'Requerido';
    if (form.retailPrice <= 0) e.retailPrice  = 'Debe ser mayor a 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = (): CreateProductDto => ({
    name: form.name.trim(), unit: form.unit || 'Unid',
    costPrice: form.costPrice, retailPrice: form.retailPrice,
    isActive: form.isActive, isPublished: form.isPublished, isFeatured: form.isFeatured,
    ...(form.sku?.trim()         && { sku: form.sku.trim() }),
    ...(form.barcode?.trim()     && { barcode: form.barcode.trim() }),
    ...(form.description?.trim() && { description: form.description.trim() }),
    ...(form.spec?.trim()        && { spec: form.spec.trim() }),
    ...(form.notes?.trim()       && { notes: form.notes.trim() }),
    ...(form.categoryId != null  && { categoryId: form.categoryId }),
    ...(form.wholesalePrice1     && { wholesalePrice1: form.wholesalePrice1 }),
    ...(form.wholesalePrice2     && { wholesalePrice2: form.wholesalePrice2 }),
    ...(form.wholesalePrice3     && { wholesalePrice3: form.wholesalePrice3 }),
    ...(form.memberPrice         && { memberPrice: form.memberPrice }),
    ...(form.vipPrice2           && { vipPrice2: form.vipPrice2 }),
    ...(form.vipPrice3           && { vipPrice3: form.vipPrice3 }),
    ...(form.vipPrice4           && { vipPrice4: form.vipPrice4 }),
    ...(form.vipPrice5           && { vipPrice5: form.vipPrice5 }),
    taxRate: form.taxRate ?? 0.18, isTaxExempt: form.isTaxExempt ?? false,
    ...(imgPreview               && { mainImageUrl: imgPreview }),
    // Inventario inicial — solo en creación (no en edición)
    ...(!product && initialStock > 0 && { initialStock }),
  });

  const handleSave = () => { if (validate()) onSave(buildPayload()); };

  const flatCats: { id: number; label: string; isChild: boolean }[] = [];
  categories.filter(c => c.parentId === null).forEach(root => {
    flatCats.push({ id: root.id, label: root.name, isChild: false });
    categories.filter(c => c.parentId === root.id).forEach(ch =>
      flatCats.push({ id: ch.id, label: ch.name, isChild: true }));
  });

  const lbl  = 'block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1';
  const inp  = (f: string) => `w-full border rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 transition-all ${errors[f] ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-400'}`;
  const nInp = `w-full border border-slate-300 rounded-md pl-5 pr-1 py-1.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all`;

  const SectionTitle = ({ title }: { title: string }) => (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest whitespace-nowrap">{title}</span>
      <span className="flex-1 h-px bg-indigo-100" />
    </div>
  );

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
    s.code.includes(supplierSearch)
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col" style={{ maxHeight: '94vh' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50 rounded-t-2xl flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Package size={14} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-sm leading-tight">
                  {product ? 'Editar producto' : 'Nuevo producto'}
                </h2>
                {product && <p className="text-[11px] text-slate-400">SKU: {product.sku}</p>}
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400">
              <X size={16}/>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5">

              {/* ══ Fila principal: campos + foto ══ */}
              <div className="flex gap-5">
                <div className="flex-1 min-w-0">

                  {/* Fila 1: Categoría | SKU | Barcode | Proveedor */}
                  <div className="grid grid-cols-12 gap-2 mb-3">
                    <div className="col-span-3">
                      <label className={lbl}>Categoría</label>
                      <select value={form.categoryId ?? ''} onChange={e => {
                        const id = e.target.value ? parseInt(e.target.value) : null;
                        set('categoryId', id);
                        if (!product) set('sku', generateSku(id));
                      }} className={inp('categoryId')}>
                        <option value="">-- Sin categoría --</option>
                        {flatCats.map(c => <option key={c.id} value={c.id}>{c.isChild ? `  └ ${c.label}` : c.label}</option>)}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <label className={lbl}>Código (SKU)</label>
                      <div className="flex gap-1">
                        <input value={form.sku ?? ''} onChange={e => set('sku', e.target.value)}
                          placeholder="Auto-gen." className={`${inp('sku')} flex-1`}/>
                        <button type="button" onClick={() => set('sku', generateSku(form.categoryId))}
                          className="px-2 border border-slate-300 rounded-md hover:bg-indigo-50 hover:border-indigo-300 text-slate-400 hover:text-indigo-600 transition-colors">
                          <Wand2 size={13}/>
                        </button>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <label className={lbl}>Código de barras</label>
                      <input value={form.barcode ?? ''} onChange={e => set('barcode', e.target.value)}
                        placeholder="EAN / UPC" className={inp('barcode')}/>
                    </div>
                    {/* Proveedor */}
                    <div className="col-span-3" ref={dropRef}>
                      <label className={lbl}>Proveedor</label>
                      <div className="flex gap-1">
                        <div className="relative flex-1">
                          <button type="button"
                            onClick={() => setShowSupplierDrop(v => !v)}
                            className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm text-left flex items-center justify-between hover:border-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200">
                            <span className={selectedSupplier ? 'text-slate-800 truncate' : 'text-slate-400'}>
                              {selectedSupplier ? selectedSupplier.name : 'Seleccionar...'}
                            </span>
                            <span className="text-slate-400 text-xs ml-1">▾</span>
                          </button>

                          {showSupplierDrop && (
                            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                              <div className="p-2 border-b border-slate-100">
                                <div className="relative">
                                  <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"/>
                                  <input autoFocus value={supplierSearch}
                                    onChange={e => setSupplierSearch(e.target.value)}
                                    placeholder="Buscar proveedor..."
                                    className="w-full pl-6 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"/>
                                </div>
                              </div>
                              <div className="max-h-44 overflow-y-auto">
                                <button type="button" onClick={() => { setSelectedSupplier(null); setShowSupplierDrop(false); }}
                                  className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:bg-slate-50 border-b border-slate-100 italic">
                                  — Sin proveedor —
                                </button>
                                {filteredSuppliers.map(s => (
                                  <button key={s.id} type="button"
                                    onClick={() => { setSelectedSupplier(s); setShowSupplierDrop(false); setSupplierSearch(''); }}
                                    className={`w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 transition-colors ${selectedSupplier?.id === s.id ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700'}`}>
                                    <span className="font-mono text-slate-400 mr-1">{s.code}</span>
                                    {s.name}
                                  </button>
                                ))}
                                {filteredSuppliers.length === 0 && (
                                  <div className="px-3 py-2 text-xs text-slate-400 text-center">Sin resultados</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Botón crear proveedor rápido */}
                        <button type="button" onClick={() => setShowQuickSupplier(true)}
                          title="Nuevo proveedor"
                          className="px-2 border border-slate-300 rounded-md hover:bg-emerald-50 hover:border-emerald-400 text-slate-400 hover:text-emerald-600 transition-colors flex-shrink-0">
                          <Plus size={13}/>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Fila 2: Nombre */}
                  <div className="mb-3">
                    <label className={lbl}>Nombre <span className="text-red-400 normal-case">*</span></label>
                    <input value={form.name} onChange={e => set('name', e.target.value.toUpperCase())}
                      placeholder="Nombre del producto" className={inp('name')}/>
                    {errors.name && <p className="text-red-500 text-[11px] mt-0.5">{errors.name}</p>}
                  </div>

                  {/* Fila 3: Unidad | Espec | Estado */}
                  <div className="grid grid-cols-12 gap-2 mb-3">
                    <div className="col-span-3">
                      <label className={lbl}>Unidad</label>
                      <input list="units-list" value={form.unit ?? ''} onChange={e => set('unit', e.target.value)}
                        className={inp('unit')}/>
                      <datalist id="units-list">{UNITS.map(u => <option key={u} value={u}/>)}</datalist>
                    </div>
                    <div className="col-span-4">
                      <label className={lbl}>Especificación</label>
                      <input value={form.spec ?? ''} onChange={e => set('spec', e.target.value)}
                        placeholder="Presentación, tamaño..." className={inp('spec')}/>
                    </div>
                    <div className="col-span-5">
                      <label className={lbl}>Estado</label>
                      <div className="flex gap-1.5">
                        {[true, false].map(v => (
                          <button key={String(v)} type="button" onClick={() => set('isActive', v)}
                            className={`flex-1 py-1.5 rounded-md text-xs font-semibold border transition-all ${form.isActive === v
                              ? v ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-400 text-white border-slate-400'
                              : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'}`}>
                            {v ? '✓ Activo' : '✗ Inactivo'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Fila 4: Descripción | Notas */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={lbl}>Descripción</label>
                      <textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)}
                        rows={2} placeholder="Descripción del producto..."
                        className={`${inp('description')} resize-none text-xs`}/>
                    </div>
                    <div>
                      <label className={lbl}>Notas internas</label>
                      <textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value)}
                        rows={2} placeholder="Observaciones para uso interno..."
                        className={`${inp('notes')} resize-none text-xs`}/>
                    </div>
                  </div>
                </div>

                {/* Foto */}
                <div className="flex-shrink-0 w-36">
                  <label className={lbl}>Foto</label>
                  <div onClick={() => fileRef.current?.click()}
                    className={`w-full aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${imgPreview ? 'border-slate-200' : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50'}`}>
                    {imgPreview
                      ? <img src={imgPreview} className="w-full h-full object-cover" alt="preview"/>
                      : <>
                          <ImagePlus size={24} className="text-slate-300 mb-1"/>
                          <span className="text-[10px] text-slate-400 text-center px-1">Haz clic para agregar</span>
                          <span className="text-[9px] text-slate-300 mt-0.5">JPG, PNG — máx. 2MB</span>
                        </>
                    }
                  </div>
                  {imgPreview && (
                    <button onClick={() => { setImgPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                      className="mt-1 flex items-center gap-1 text-[10px] text-red-400 hover:text-red-600 mx-auto">
                      <Trash2 size={9}/> Quitar imagen
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage}/>
                </div>
              </div>

              {/* ══ Precios ══ */}
              <div className="border-t border-slate-200 mt-4 pt-4">
                <SectionTitle title="Configuración de precio e inventario"/>

                <div className="grid grid-cols-12 gap-2 mb-3">
                  {/* Precio compra */}
                  <div className="col-span-2">
                    <label className={lbl}>Precio compra</label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">S/.</span>
                      <input type="number" step="0.01" min="0" value={form.costPrice || ''}
                        onChange={handleCostChange} placeholder="0.00"
                        className="w-full border border-slate-300 rounded-md pl-7 pr-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-200"/>
                    </div>
                  </div>
                  {/* Precio base */}
                  <div className="col-span-2">
                    <label className={lbl}>Precio base</label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">S/.</span>
                      <input readOnly value={form.retailPrice > 0 ? base.toFixed(2) : ''} placeholder="0.00"
                        className="w-full border border-slate-200 bg-slate-50 rounded-md pl-7 pr-2 py-1.5 text-sm text-right text-slate-500 cursor-default focus:outline-none"/>
                    </div>
                  </div>
                  {/* IGV */}
                  <div className="col-span-2">
                    <label className={lbl}>Imp. IGV 18%</label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-400 text-[11px]">S/.</span>
                      <input readOnly value={form.retailPrice > 0 ? igv.toFixed(2) : ''} placeholder="0.00"
                        className="w-full border border-amber-200 bg-amber-50 rounded-md pl-7 pr-2 py-1.5 text-sm text-right text-amber-700 cursor-default focus:outline-none"/>
                    </div>
                  </div>
                  {/* Precio venta */}
                  <div className="col-span-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className={`${lbl} mb-0`}>Precio de venta <span className="text-red-400">*</span></label>
                      {form.costPrice > 0 && (
                        <button type="button" onClick={() => set('retailPrice', suggestRetail(form.costPrice))}
                          className="text-[10px] text-indigo-500 hover:text-indigo-700 flex items-center gap-0.5">
                          <Wand2 size={9}/> +20%
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">S/.</span>
                      <input type="number" step="0.01" min="0" value={form.retailPrice || ''}
                        onChange={num('retailPrice')} placeholder="0.00"
                        className={`w-full border rounded-md pl-7 pr-2 py-1.5 text-sm text-right font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.retailPrice ? 'border-red-300 bg-red-50' : 'border-indigo-300'}`}/>
                    </div>
                    {errors.retailPrice && <p className="text-red-500 text-[10px] mt-0.5">{errors.retailPrice}</p>}
                  </div>
                  {/* Margen */}
                  <div className="col-span-1 flex flex-col">
                    <label className={lbl}>Margen</label>
                    <div className="flex-1 flex items-center justify-center">
                      {form.costPrice > 0 && form.retailPrice > 0
                        ? <MarginBadge cost={form.costPrice} retail={form.retailPrice}/>
                        : <span className="text-slate-300 text-xs">—</span>
                      }
                    </div>
                  </div>
                  {/* Inventario inicial */}
                  <div className="col-span-2">
                    <label className={lbl}>Inventario inicial</label>
                    <div className="relative">
                      <input type="number" step="1" min="0" value={initialStock || ''}
                        onChange={e => setInitialStock(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-200"/>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-0.5">Almacén principal</p>
                  </div>
                </div>

                {/* Mayoristas + VIP */}
                <div className="grid grid-cols-8 gap-2">
                  {([1,2,3] as const).map(n => (
                    <div key={n} className="col-span-1">
                      <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Mayorista {n}</label>
                      <div className="relative">
                        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">S/</span>
                        <input type="number" step="0.01" min="0" placeholder="0.00"
                          value={(form[`wholesalePrice${n}` as keyof CreateProductDto] as number) || ''}
                          onChange={num(`wholesalePrice${n}` as keyof CreateProductDto)}
                          className={nInp}/>
                      </div>
                    </div>
                  ))}
                  {([
                    { key: 'memberPrice', label: 'Miembro' },
                    { key: 'vipPrice2',   label: 'VIP 2' },
                    { key: 'vipPrice3',   label: 'VIP 3' },
                    { key: 'vipPrice4',   label: 'VIP 4' },
                    { key: 'vipPrice5',   label: 'VIP 5' },
                  ]).map(({ key, label }) => (
                    <div key={key} className="col-span-1">
                      <label className="block text-[10px] text-indigo-400 font-semibold uppercase tracking-wide mb-1">{label}</label>
                      <div className="relative">
                        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-indigo-300 text-[10px]">S/</span>
                        <input type="number" step="0.01" min="0" placeholder="0.00"
                          value={(form[key as keyof CreateProductDto] as number) || ''}
                          onChange={num(key as keyof CreateProductDto)}
                          className="w-full border border-indigo-200 bg-indigo-50/40 rounded-md pl-5 pr-1 py-1.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-indigo-200"/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-3 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex-shrink-0">
            <button onClick={onClose} className="px-5 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={loading}
              className="px-6 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold transition-colors min-w-[130px] text-center">
              {loading ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </div>
      </div>

      {/* Mini-modal de creación rápida de proveedor */}
      {showQuickSupplier && (
        <QuickSupplierModal
          onCreated={s => { setSelectedSupplier(s); setShowQuickSupplier(false); }}
          onClose={() => setShowQuickSupplier(false)}
        />
      )}
    </>
  );
}
