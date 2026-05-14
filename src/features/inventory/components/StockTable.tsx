import { useState, useCallback } from 'react'
import {
  Search, SlidersHorizontal, Package, AlertTriangle,
  ChevronUp, ChevronDown, RefreshCw, Warehouse
} from 'lucide-react'
import type { StockItem } from '../../../api/inventory'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(n ?? 0)

const fmtQty = (n: number, unit: string) =>
  `${Number.isInteger(n) ? n : (n ?? 0).toFixed(2)} ${unit ?? 'und'}`

function stockBadge(qty: number) {
  if ((qty ?? 0) <= 0)
    return <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>Sin stock</span>
  if (qty <= 5)
    return <span style={{ background: '#FEF3C7', color: '#D97706', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>Stock bajo</span>
  return <span style={{ background: '#DCFCE7', color: '#16A34A', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>OK</span>
}

interface Props {
  items: StockItem[]
  loading: boolean
  onAdjust: (item: StockItem) => void
  onSearch: (q: string) => void
  onFilterWarehouse: (id: number | undefined) => void
  onFilterLowStock: (v: boolean) => void
  warehouses: { id: number; code: string; name: string }[]
  selectedWarehouse?: number
  lowStockOnly: boolean
  onRefresh: () => void
}

type SortKey = 'name' | 'quantity' | 'averageCost' | 'totalValue'

export function StockTable({
  items, loading, onAdjust, onSearch, onFilterWarehouse,
  onFilterLowStock, warehouses, selectedWarehouse, lowStockOnly, onRefresh
}: Props) {
  const [search, setSearch]   = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortAsc, setSortAsc] = useState(true)

  const handleSearch = useCallback((val: string) => {
    setSearch(val)
    onSearch(val)
  }, [onSearch])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(true) }
  }

  // Filtrar nulos defensivamente
  const safeItems = (items ?? []).filter(i => i != null)

  const sorted = [...safeItems].sort((a, b) => {
    let av: string | number = '', bv: string | number = ''
    switch (sortKey) {
      case 'name':        av = a.product?.name ?? ''; bv = b.product?.name ?? ''; break
      case 'quantity':    av = a.quantity ?? 0;       bv = b.quantity ?? 0;       break
      case 'averageCost': av = a.averageCost ?? 0;    bv = b.averageCost ?? 0;    break
      case 'totalValue':  av = a.totalValue ?? 0;     bv = b.totalValue ?? 0;     break
    }
    if (av < bv) return sortAsc ? -1 : 1
    if (av > bv) return sortAsc ?  1 : -1
    return 0
  })

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronUp size={12} style={{ opacity: 0.25 }} />
    return sortAsc
      ? <ChevronUp size={12} style={{ color: '#2563EB' }} />
      : <ChevronDown size={12} style={{ color: '#2563EB' }} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>

      {/* Barra de filtros */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
        background: '#fff', borderBottom: '1px solid #E2E8F0', flexShrink: 0, flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Buscar producto, SKU, código de barras…"
            style={{
              width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
              border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A',
              background: '#F8FAFC', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <select
          value={selectedWarehouse ?? ''}
          onChange={e => onFilterWarehouse(e.target.value ? Number(e.target.value) : undefined)}
          style={{ padding: '7px 10px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A', background: '#F8FAFC', cursor: 'pointer' }}
        >
          <option value="">Todos los almacenes</option>
          {(warehouses ?? []).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>

        <button
          onClick={() => onFilterLowStock(!lowStockOnly)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
            border: `1px solid ${lowStockOnly ? '#F59E0B' : '#E2E8F0'}`,
            borderRadius: 8, fontSize: 13, cursor: 'pointer',
            background: lowStockOnly ? '#FEF3C7' : '#F8FAFC',
            color: lowStockOnly ? '#92400E' : '#64748B', fontWeight: lowStockOnly ? 600 : 400
          }}
        >
          <AlertTriangle size={14} />
          Stock bajo
        </button>

        <button
          onClick={onRefresh}
          title="Actualizar"
          style={{ display: 'flex', alignItems: 'center', padding: 8, border: '1px solid #E2E8F0', borderRadius: 8, background: '#F8FAFC', cursor: 'pointer', color: '#64748B' }}
        >
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>

        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94A3B8' }}>{sorted.length} productos</span>
      </div>

      {/* Tabla */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 1 }}>
              {[
                { label: 'Producto',    key: 'name'        },
                { label: 'Almacén',     key: null          },
                { label: 'Stock',       key: 'quantity'    },
                { label: 'Estado',      key: null          },
                { label: 'Costo prom.', key: 'averageCost' },
                { label: 'Valor total', key: 'totalValue'  },
                { label: '',            key: null          },
              ].map(({ label, key }, i) => (
                <th
                  key={i}
                  onClick={() => key && toggleSort(key as SortKey)}
                  style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap', userSelect: 'none', cursor: key ? 'pointer' : 'default' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {label}
                    {key && <SortIcon k={key as SortKey} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && sorted.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>Cargando inventario…</td></tr>
            )}
            {!loading && sorted.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>
                <Package size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                No se encontraron productos
              </td></tr>
            )}

            {sorted.map(item => {
              // Defensas: product y warehouse pueden venir sin populate del backend
              const prod = item.product  ?? { name: '—', sku: '', unit: 'und', mainImageUrl: undefined, category: undefined } as any
              const wh   = item.warehouse ?? { name: '—' } as any
              const qty  = Number(item.quantity ?? 0)

              return (
                <tr
                  key={item.id}
                  style={{ borderBottom: '1px solid #F1F5F9', background: '#fff', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {prod.mainImageUrl
                        ? <img src={prod.mainImageUrl} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                        : <div style={{ width: 36, height: 36, borderRadius: 6, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Package size={16} style={{ color: '#93C5FD' }} />
                          </div>
                      }
                      <div>
                        <div style={{ fontWeight: 500, color: '#0F172A', lineHeight: 1.3 }}>{prod.name ?? '—'}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>
                          {prod.sku ?? ''}
                          {prod.category?.name ? ` · ${prod.category.name}` : ''}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '10px 14px', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Warehouse size={13} style={{ color: '#94A3B8' }} />
                      {wh.name ?? '—'}
                    </div>
                  </td>

                  <td style={{ padding: '10px 14px', fontWeight: 600, color: qty <= 0 ? '#DC2626' : qty <= 5 ? '#D97706' : '#0F172A' }}>
                    {fmtQty(qty, prod.unit ?? 'und')}
                  </td>

                  <td style={{ padding: '10px 14px' }}>
                    {stockBadge(qty)}
                  </td>

                  <td style={{ padding: '10px 14px', color: '#475569' }}>
                    {fmt(Number(item.averageCost ?? 0))}
                  </td>

                  <td style={{ padding: '10px 14px', fontWeight: 500, color: '#0F172A' }}>
                    {fmt(Number(item.totalValue ?? 0))}
                  </td>

                  <td style={{ padding: '10px 14px' }}>
                    <button
                      onClick={() => onAdjust(item)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                        border: '1px solid #E2E8F0', borderRadius: 7, background: '#fff',
                        cursor: 'pointer', fontSize: 12, color: '#475569', whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569' }}
                    >
                      <SlidersHorizontal size={13} />
                      Ajustar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
