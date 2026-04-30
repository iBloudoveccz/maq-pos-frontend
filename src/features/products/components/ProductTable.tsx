import { useState } from 'react';
import {
  Search, Plus, Edit2, Trash2, ToggleLeft, ToggleRight,
  Package, ChevronLeft, ChevronRight, Filter, RefreshCw
} from 'lucide-react';
import type { Product } from '../types';

interface Props {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  onPageChange: (p: number) => void;
  onNew: () => void;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  onToggleActive: (p: Product) => void;
  categoryName?: string;
}

export default function ProductTable({
  products, total, page, limit, loading,
  search, onSearchChange, onPageChange,
  onNew, onEdit, onDelete, onToggleActive, categoryName
}: Props) {
  const totalPages = Math.ceil(total / limit) || 1;
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Toolbar (similar al S12) ── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200 flex-shrink-0">
        {/* Nuevo */}
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={13} /> Nuevo
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Búsqueda por código, nombre..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white transition-all"
          />
        </div>

        {/* Categoría activa */}
        {categoryName && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-md">
            <Filter size={11} className="text-amber-500" />
            <span className="text-xs font-medium text-amber-700 max-w-[140px] truncate">{categoryName}</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* Total */}
          <span className="text-xs text-slate-400">
            {loading ? <RefreshCw size={12} className="animate-spin" /> : `${total} registro${total !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-center text-slate-400">
              <RefreshCw size={28} className="mx-auto mb-2 animate-spin opacity-40" />
              <p className="text-xs">Cargando...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16">
            <Package size={44} className="text-slate-200 mb-3" />
            <p className="text-sm font-medium text-slate-500 mb-1">No hay productos</p>
            <p className="text-xs text-slate-400 mb-4">
              {search ? 'Sin resultados para la búsqueda' : 'Crea el primer producto con el botón Nuevo'}
            </p>
            <button
              onClick={onNew}
              className="px-4 py-2 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 font-medium transition-colors"
            >
              + Nuevo producto
            </button>
          </div>
        ) : (
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-100">
              <tr className="border-b-2 border-slate-300">
                <th className="text-left px-3 py-2 font-bold text-slate-600 w-8">#</th>
                <th className="text-left px-3 py-2 font-bold text-slate-600 w-28">Código</th>
                <th className="text-left px-3 py-2 font-bold text-slate-600">Nombre</th>
                <th className="text-left px-3 py-2 font-bold text-slate-600 hidden lg:table-cell">Categoría</th>
                <th className="text-left px-3 py-2 font-bold text-slate-600 hidden md:table-cell w-14">Unidad</th>
                <th className="text-right px-3 py-2 font-bold text-slate-600 w-24">Costo</th>
                <th className="text-right px-3 py-2 font-bold text-slate-600 w-24">P. Venta</th>
                <th className="text-right px-3 py-2 font-bold text-slate-600 w-20 hidden lg:table-cell">Margen</th>
                <th className="text-center px-3 py-2 font-bold text-slate-600 w-20 hidden md:table-cell">Estado</th>
                <th className="px-3 py-2 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => {
                const margin = p.costPrice > 0
                  ? (((p.retailPrice - p.costPrice) / p.costPrice) * 100).toFixed(1)
                  : null;
                const isHovered = hoveredId === p.id;
                const even = idx % 2 === 0;

                return (
                  <tr
                    key={p.id}
                    onMouseEnter={() => setHoveredId(p.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`border-b border-slate-200 transition-colors cursor-default
                      ${isHovered ? 'bg-indigo-50' : even ? 'bg-white' : 'bg-slate-50/60'}
                      ${!p.isActive ? 'opacity-50' : ''}
                    `}
                  >
                    <td className="px-3 py-2 text-slate-400 text-center">{(page-1)*limit+idx+1}</td>
                    <td className="px-3 py-2">
                      <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px]">
                        {p.code}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <p className="font-semibold text-slate-800 leading-tight">{p.name}</p>
                      {p.barcode && <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.barcode}</p>}
                      {p.spec   && <p className="text-[10px] text-slate-400">{p.spec}</p>}
                    </td>
                    <td className="px-3 py-2 hidden lg:table-cell">
                      {p.category
                        ? <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-medium">{p.category.name}</span>
                        : <span className="text-slate-300">—</span>
                      }
                    </td>
                    <td className="px-3 py-2 text-slate-500 hidden md:table-cell">{p.unit ?? '—'}</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-600">S/. {p.costPrice.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-slate-800">S/. {p.retailPrice.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right hidden lg:table-cell">
                      {margin !== null
                        ? <span className={`font-bold ${parseFloat(margin)>20?'text-emerald-600':parseFloat(margin)>0?'text-amber-600':'text-red-500'}`}>{margin}%</span>
                        : <span className="text-slate-300">—</span>
                      }
                    </td>
                    <td className="px-3 py-2 text-center hidden md:table-cell">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        p.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {p.isActive ? '● Activo' : '○ Inactivo'}
                      </span>
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => onEdit(p)} title="Editar"
                          className="p-1.5 rounded hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 transition-colors">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => onToggleActive(p)} title={p.isActive ? 'Desactivar' : 'Activar'}
                          className="p-1.5 rounded hover:bg-amber-100 text-slate-400 hover:text-amber-600 transition-colors">
                          {p.isActive ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                        </button>
                        <button onClick={() => onDelete(p)} title="Eliminar"
                          className="p-1.5 rounded hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          <p className="text-xs text-slate-500">
            Mostrando {(page-1)*limit+1}–{Math.min(page*limit, total)} de <strong>{total}</strong>
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => onPageChange(page-1)} disabled={page<=1}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i+1).map(p => (
              <button key={p} onClick={() => onPageChange(p)}
                className={`w-6 h-6 text-xs rounded transition-colors ${
                  page===p ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-200 text-slate-600'
                }`}>
                {p}
              </button>
            ))}
            <button onClick={() => onPageChange(page+1)} disabled={page>=totalPages}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
