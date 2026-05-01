import { useState, useEffect, useRef } from 'react';
import { X, Package, Wand2, TrendingUp, TrendingDown, Minus, ImagePlus, Trash2 } from 'lucide-react';
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
const MARGIN_GOAL = 20;

const empty = (): CreateProductDto => ({
  sku: '', barcode: '', name: '', unit: 'Unid',
  spec: '', description: '', notes: '', isActive: true,
  isPublished: true, isFeatured: false, categoryId: null,
  costPrice: 0, retailPrice: 0,
  wholesalePrice1: 0, wholesalePrice2: 0, wholesalePrice3: 0,
  memberPrice: 0, vipPrice2: 0, vipPrice3: 0, vipPrice4: 0, vipPrice5: 0,
  taxRate: 0.18, isTaxExempt: false,
});

function generateSku(categoryId?: number | null): string {
  const prefix = categoryId ? String(categoryId).padStart(2, '0') : '00';
  const seq    = String(Date.now()).slice(-6);
  return `${prefix}${seq}`;
}

function suggestRetail(cost: number): number {
  return cost > 0 ? parseFloat((cost * 1.20 * 1.18).toFixed(2)) : 0;
}

function MarginBadge({ cost, retail }: { cost: number; retail: number }) {
  if (!cost || !retail || cost <= 0 || retail <= 0) return null;
  const margin = ((retail - cost) / cost) * 100;
  const ok   = margin >= MARGIN_GOAL;
  const warn = margin >= MARGIN_GOAL * 0.6 && margin < MARGIN_GOAL;
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
      ok   ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
      warn ? 'bg-amber-50  border-amber-200  text-amber-700'   :
             'bg-red-50    border-red-200    text-red-700'
    }`}>
      {ok ? <TrendingUp size={13} /> : warn ? <Minus size={13} /> : <TrendingDown size={13} />}
      Margen {margin.toFixed(1)}%
      {!ok && <span className="opacity-70"> (mín. {MARGIN_GOAL}%)</span>}
    </div>
  );
}

export default function ProductFormModal({
  product, categories, onSave, onClose, loading, defaultCategoryId
}: Props) {
  const [form, setForm]     = useState<CreateProductDto>(empty());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setForm({
        sku:         product.sku,
        barcode:     product.barcode    ?? '',
        name:        product.name,
        unit:        product.unit       ?? 'Unid',
        spec:        product.spec       ?? '',
        description: product.description ?? '',
        notes:       product.notes      ?? '',
        isActive:    product.isActive,
        isPublished: product.isPublished,
        isFeatured:  product.isFeatured,
        categoryId:  product.categoryId ?? null,
        costPrice:       Number(product.costPrice),
        retailPrice:     Number(product.retailPrice),
        wholesalePrice1: Number(product.wholesalePrice1 ?? 0),
        wholesalePrice2: Number(product.wholesalePrice2 ?? 0),
        wholesalePrice3: Number(product.wholesalePrice3 ?? 0),
        memberPrice:     Number(product.memberPrice     ?? 0),
        vipPrice2:   Number(product.vipPrice2  ?? 0),
        vipPrice3:   Number(product.vipPrice3  ?? 0),
        vipPrice4:   Number(product.vipPrice4  ?? 0),
        vipPrice5:   Number(product.vipPrice5  ?? 0),
        taxRate:     Number(product.taxRate    ?? 0.18),
        isTaxExempt: product.isTaxExempt ?? false,
      });
      setImgPreview(product.mainImageUrl ?? null);
    } else {
      const f = empty();
      f.categoryId = defaultCategoryId ?? null;
      f.sku = generateSku(defaultCategoryId);
      setForm(f);
      setImgPreview(null);
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
    if (!form.name.trim())     e.name       = 'Requerido';
    if (form.retailPrice <= 0) e.retailPrice = 'Debe ser mayor a 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /** Construye payload limpio — solo campos que el backend acepta */
  const buildPayload = (): CreateProductDto => ({
    name:       form.name.trim(),
    unit:       form.unit || 'Unid',
    costPrice:  form.costPrice,
    retailPrice: form.retailPrice,
    isActive:   form.isActive,
    isPublished: form.isPublished,
    isFeatured:  form.isFeatured,
    ...(form.sku?.trim()         && { sku:         form.sku.trim() }),
    ...(form.barcode?.trim()     && { barcode:     form.barcode.trim() }),
    ...(form.description?.trim() && { description: form.description.trim() }),
    ...(form.spec?.trim()        && { spec:        form.spec.trim() }),
    ...(form.notes?.trim()       && { notes:       form.notes.trim() }),
    ...(form.categoryId != null  && { categoryId:  form.categoryId }),
    ...(form.wholesalePrice1     && { wholesalePrice1: form.wholesalePrice1 }),
    ...(form.wholesalePrice2     && { wholesalePrice2: form.wholesalePrice2 }),
    ...(form.wholesalePrice3     && { wholesalePrice3: form.wholesalePrice3 }),
    ...(form.memberPrice         && { memberPrice:     form.memberPrice }),
    ...(form.vipPrice2           && { vipPrice2:       form.vipPrice2 }),
    ...(form.vipPrice3           && { vipPrice3:       form.vipPrice3 }),
    ...(form.vipPrice4           && { vipPrice4:       form.vipPrice4 }),
    ...(form.vipPrice5           && { vipPrice5:       form.vipPrice5 }),
    taxRate:    form.taxRate ?? 0.18,
    isTaxExempt: form.isTaxExempt ?? false,
  });

  const handleSave = () => { if (validate()) onSave(buildPayload()); };

  const flatCats: { id: number; label: string; isChild: boolean }[] = [];
  categories.filter(c => c.parentId === null).forEach(root => {
    flatCats.push({ id: root.id, label: root.name, isChild: false });
    categories.filter(c => c.parentId === root.id).forEach(ch =>
      flatCats.push({ id: ch.id, label: ch.name, isChild: true })
    );
  });

  const inp = (f: string) => `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all ${errors[f] ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-400'}`;
  const numInp = `w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all`;

  const Section = ({ title }: { title: string }) => (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest whitespace-nowrap">{title}</span>
      <span className="flex-1 h-px bg-indigo-100 block" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: '92vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Package size={14} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm">{product ? 'Editar producto' : 'Nuevo producto'}</h2>
              {product && <p className="text-xs text-slate-400">SKU: {product.sku}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400"><X size={16} /></button>
        </div>

        {/* Scroll body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* ── INFO BÁSICA ── */}
          <Section title="Información básica" />

          {/* Foto */}
          <div className="flex items-center gap-3 mb-3">
            <div onClick={() => fileRef.current?.click()}
              className={`w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0 transition-all ${imgPreview ? 'border-slate-200' : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50'}`}>
              {imgPreview
                ? <img src={imgPreview} className="w-full h-full object-cover" />
                : <div className="text-center"><ImagePlus size={20} className="text-slate-300 mx-auto mb-1" /><span className="text-[10px] text-slate-400">Foto</span></div>
              }
            </div>
            <div className="text-xs text-slate-400">
              <p>Haz clic para agregar una imagen</p>
              <p className="text-[10px]">JPG, PNG — máx. 2MB</p>
              {imgPreview && (
                <button onClick={() => { setImgPreview(null); if(fileRef.current) fileRef.current.value=''; }}
                  className="flex items-center gap-1 text-red-400 hover:text-red-600 mt-1"><Trash2 size={10}/> Quitar</button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Categoría */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Categoría</label>
              <select value={form.categoryId ?? ''} onChange={e => {
                const id = e.target.value ? parseInt(e.target.value) : null;
                set('categoryId', id);
                if (!product) set('sku', generateSku(id));
              }} className={inp('categoryId')}>
                <option value="">-- Sin categoría --</option>
                {flatCats.map(c => <option key={c.id} value={c.id}>{c.isChild ? `   └ ${c.label}` : c.label}</option>)}
              </select>
            </div>

            {/* SKU / Código */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Código (SKU)</label>
              <div className="flex gap-1.5">
                <input value={form.sku ?? ''} onChange={e => set('sku', e.target.value)}
                  placeholder="Auto-generado" className={`${inp('sku')} flex-1`} />
                <button type="button" onClick={() => set('sku', generateSku(form.categoryId))} title="Regenerar código"
                  className="px-2 border border-slate-300 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 text-slate-400 hover:text-indigo-600 transition-colors">
                  <Wand2 size={14} />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Dejar vacío para auto-generar</p>
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Código de barras</label>
              <input value={form.barcode ?? ''} onChange={e => set('barcode', e.target.value)}
                placeholder="EAN / UPC" className={inp('barcode')} />
            </div>

            {/* Nombre */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Nombre <span className="text-red-400">*</span></label>
              <input value={form.name} onChange={e => set('name', e.target.value.toUpperCase())}
                placeholder="Nombre del producto" className={inp('name')} />
              {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>}
            </div>

            {/* Unidad */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Unidad de medida</label>
              <input list="units-list" value={form.unit ?? ''} onChange={e => set('unit', e.target.value)}
                placeholder="Unid, Kg, Caja..." className={inp('unit')} />
              <datalist id="units-list">{UNITS.map(u => <option key={u} value={u} />)}</datalist>
            </div>

            {/* Especificación */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Especificación</label>
              <input value={form.spec ?? ''} onChange={e => set('spec', e.target.value)}
                placeholder="Presentación, tamaño..." className={inp('spec')} />
            </div>

            {/* Estado */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Estado</label>
              <div className="flex gap-2">
                {[true, false].map(v => (
                  <button key={String(v)} type="button" onClick={() => set('isActive', v)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      form.isActive === v
                        ? v ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-400 text-white border-slate-400'
                        : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'
                    }`}>{v ? '✓ Activo' : '✗ Inactivo'}</button>
                ))}
              </div>
            </div>

            {/* Descripción */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Descripción</label>
              <textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)}
                rows={2} placeholder="Descripción del producto..." className={`${inp('description')} resize-none`} />
            </div>

            {/* Notas */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Notas internas</label>
              <textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value)}
                rows={2} placeholder="Observaciones para uso interno..." className={`${inp('notes')} resize-none`} />
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* ── PRECIOS ── */}
          <Section title="Configuración de precios" />

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Precio de compra (costo)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">S/.</span>
                <input type="number" step="0.01" min="0" value={form.costPrice || ''}
                  onChange={handleCostChange} placeholder="0.00"
                  className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-600">Precio de venta <span className="text-red-400">*</span></label>
                {form.costPrice > 0 && (
                  <button type="button" onClick={() => set('retailPrice', suggestRetail(form.costPrice))}
                    className="text-[10px] text-indigo-600 hover:underline flex items-center gap-0.5">
                    <Wand2 size={10}/> Sugerir +20%
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">S/.</span>
                <input type="number" step="0.01" min="0" value={form.retailPrice || ''}
                  onChange={num('retailPrice')} placeholder="0.00"
                  className={`${errors.retailPrice ? 'border-red-300' : 'border-slate-300'} w-full border rounded-lg pl-8 pr-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-200`} />
              </div>
              {errors.retailPrice && <p className="text-red-500 text-xs mt-0.5">{errors.retailPrice}</p>}
            </div>
          </div>

          {/* IGV + Margen */}
          {form.retailPrice > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-2 flex-1">
                {[
                  { label: 'Base imponible', value: `S/. ${base.toFixed(2)}`, cls: 'text-slate-700' },
                  { label: 'IGV 18%',         value: `S/. ${igv.toFixed(2)}`,  cls: 'text-amber-600' },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-slate-400">{label}</p>
                    <p className={`text-sm font-bold ${cls}`}>{value}</p>
                  </div>
                ))}
              </div>
              <MarginBadge cost={form.costPrice} retail={form.retailPrice} />
            </div>
          )}

          {/* Mayoristas */}
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Precios mayoristas</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {([1,2,3] as const).map(n => (
              <div key={n}>
                <label className="block text-[11px] text-slate-500 mb-1">Mayorista {n}</label>
                <div className="relative">
                  <span className="absolute left-2 top-2.5 text-slate-400 text-[11px]">S/.</span>
                  <input type="number" step="0.01" min="0" placeholder="0.00"
                    value={(form[`wholesalePrice${n}` as keyof CreateProductDto] as number) || ''}
                    onChange={num(`wholesalePrice${n}` as keyof CreateProductDto)}
                    className={`${numInp} pl-7 text-xs`} />
                </div>
              </div>
            ))}
          </div>

          {/* VIP */}
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Precios Miembro / VIP</p>
          <div className="grid grid-cols-5 gap-2 mb-2">
            {[
              { key: 'memberPrice', label: 'Miembro' },
              { key: 'vipPrice2',   label: 'VIP 2' },
              { key: 'vipPrice3',   label: 'VIP 3' },
              { key: 'vipPrice4',   label: 'VIP 4' },
              { key: 'vipPrice5',   label: 'VIP 5' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-[10px] text-slate-500 mb-1">{label}</label>
                <div className="relative">
                  <span className="absolute left-1.5 top-2 text-slate-400 text-[10px]">S/</span>
                  <input type="number" step="0.01" min="0" placeholder="0.00"
                    value={(form[key as keyof CreateProductDto] as number) || ''}
                    onChange={num(key as keyof CreateProductDto)}
                    className="w-full border border-slate-300 rounded-lg pl-5 pr-1 py-1.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                </div>
              </div>
            ))}
          </div>

        </div>{/* end scroll */}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={loading}
            className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold transition-colors min-w-[120px] text-center">
            {loading ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </div>
    </div>
  );
}
