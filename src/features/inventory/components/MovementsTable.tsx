import { useState } from 'react'
import {
  ShoppingCart, Truck, SlidersHorizontal, ArrowRightLeft,
  RotateCcw, Scissors, ChevronLeft, ChevronRight, Filter, Calendar
} from 'lucide-react'
import type { StockMovement, MovementsFilters } from '../../../api/inventory'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(n)

const fmtDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

const MOVEMENT_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PURCHASE:     { label: 'Compra',     color: '#16A34A', bg: '#DCFCE7', icon: <Truck size={13} />      },
  SALE:         { label: 'Venta',      color: '#2563EB', bg: '#DBEAFE', icon: <ShoppingCart size={13} /> },
  ADJUSTMENT:   { label: 'Ajuste',     color: '#7C3AED', bg: '#EDE9FE', icon: <SlidersHorizontal size={13} /> },
  TRANSFER_IN:  { label: 'Traslado ↓', color: '#0891B2', bg: '#CFFAFE', icon: <ArrowRightLeft size={13} /> },
  TRANSFER_OUT: { label: 'Traslado ↑', color: '#0891B2', bg: '#CFFAFE', icon: <ArrowRightLeft size={13} /> },
  RETURN:       { label: 'Devolución', color: '#D97706', bg: '#FEF3C7', icon: <RotateCcw size={13} />   },
  OWN_USE:      { label: 'Uso interno',color: '#DC2626', bg: '#FEE2E2', icon: <Scissors size={13} />    },
  CONVERT:      { label: 'Conversión', color: '#9333EA', bg: '#F3E8FF', icon: <ArrowRightLeft size={13} /> },
}

function TypeBadge({ type }: { type: string }) {
  const meta = MOVEMENT_META[type] ?? { label: type, color: '#475569', bg: '#F1F5F9', icon: null }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: meta.bg, color: meta.color,
      padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap'
    }}>
      {meta.icon}
      {meta.label}
    </span>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  movements: StockMovement[]
  loading: boolean
  total: number
  page: number
  limit: number
  onPageChange: (p: number) => void
  onFilter: (f: Partial<MovementsFilters>) => void
  warehouses: { id: number; code: string; name: string }[]
  currentFilters: MovementsFilters
}

const TYPES = ['', 'PURCHASE', 'SALE', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'RETURN', 'OWN_USE', 'CONVERT']

// ─── Componente ───────────────────────────────────────────────────────────────

export function MovementsTable({
  movements, loading, total, page, limit, onPageChange, onFilter, warehouses, currentFilters
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Filtros ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
        background: '#fff', borderBottom: '1px solid #E2E8F0', flexShrink: 0, flexWrap: 'wrap'
      }}>
        <Filter size={14} style={{ color: '#94A3B8', flexShrink: 0 }} />

        {/* Tipo */}
        <select
          value={currentFilters.type ?? ''}
          onChange={e => onFilter({ type: e.target.value || undefined, page: 1 })}
          style={{ padding: '7px 10px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, background: '#F8FAFC', color: '#0F172A', cursor: 'pointer' }}
        >
          <option value="">Todos los tipos</option>
          {TYPES.filter(Boolean).map(t => (
            <option key={t} value={t}>{MOVEMENT_META[t]?.label ?? t}</option>
          ))}
        </select>

        {/* Almacén */}
        <select
          value={currentFilters.warehouseId ?? ''}
          onChange={e => onFilter({ warehouseId: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
          style={{ padding: '7px 10px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, background: '#F8FAFC', color: '#0F172A', cursor: 'pointer' }}
        >
          <option value="">Todos los almacenes</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>

        {/* Fecha desde */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Calendar size={13} style={{ color: '#94A3B8' }} />
          <input
            type="date"
            value={currentFilters.dateFrom ?? ''}
            onChange={e => onFilter({ dateFrom: e.target.value || undefined, page: 1 })}
            style={{ padding: '6px 8px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, background: '#F8FAFC', color: '#0F172A' }}
          />
        </div>

        <span style={{ color: '#CBD5E1', fontSize: 12 }}>—</span>

        <input
          type="date"
          value={currentFilters.dateTo ?? ''}
          onChange={e => onFilter({ dateTo: e.target.value || undefined, page: 1 })}
          style={{ padding: '6px 8px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, background: '#F8FAFC', color: '#0F172A' }}
        />

        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94A3B8' }}>
          {total} movimientos
        </span>
      </div>

      {/* ── Tabla ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 1 }}>
              {['Fecha', 'Tipo', 'Producto', 'Almacén', 'Cantidad', 'Costo unit.', 'Referencia', 'Operador'].map((h, i) => (
                <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>
                Cargando movimientos…
              </td></tr>
            )}
            {!loading && movements.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>
                No hay movimientos para los filtros seleccionados
              </td></tr>
            )}
            {movements.map(mv => {
              const isOut = ['SALE', 'TRANSFER_OUT', 'OWN_USE'].includes(mv.type)
              return (
                <tr
                  key={mv.id}
                  style={{ borderBottom: '1px solid #F1F5F9', background: '#fff' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  <td style={{ padding: '10px 14px', color: '#475569', whiteSpace: 'nowrap' }}>{fmtDate(mv.createdAt)}</td>
                  <td style={{ padding: '10px 14px' }}><TypeBadge type={mv.type} /></td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: 500, color: '#0F172A' }}>{mv.product.name}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{mv.product.sku}</div>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#475569' }}>{mv.warehouse.name}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: isOut ? '#DC2626' : '#16A34A' }}>
                    {isOut ? '−' : '+'}{Math.abs(mv.quantity)} {mv.product.unit}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#475569' }}>{fmt(mv.costPrice)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    {mv.referenceId
                      ? <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#2563EB', background: '#EFF6FF', padding: '2px 6px', borderRadius: 4 }}>{mv.referenceId}</span>
                      : <span style={{ color: '#CBD5E1' }}>—</span>
                    }
                    {mv.notes && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{mv.notes}</div>}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#475569' }}>{mv.user?.name ?? '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Paginación ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderTop: '1px solid #E2E8F0', background: '#fff', flexShrink: 0
      }}>
        <span style={{ fontSize: 12, color: '#94A3B8' }}>
          Página {page} de {totalPages}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            style={{
              display: 'flex', alignItems: 'center', padding: '6px 10px',
              border: '1px solid #E2E8F0', borderRadius: 7, background: '#fff',
              cursor: page <= 1 ? 'not-allowed' : 'pointer', color: page <= 1 ? '#CBD5E1' : '#475569'
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            style={{
              display: 'flex', alignItems: 'center', padding: '6px 10px',
              border: '1px solid #E2E8F0', borderRadius: 7, background: '#fff',
              cursor: page >= totalPages ? 'not-allowed' : 'pointer', color: page >= totalPages ? '#CBD5E1' : '#475569'
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
