import { useState, useEffect } from 'react'
import { X, Plus, Minus, SlidersHorizontal, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { StockItem, AdjustStockDto } from '../../../api/inventory'
import { inventoryApi } from '../../../api/inventory'

// ─── Motivos predefinidos ─────────────────────────────────────────────────────

const REASONS = [
  'Sobrante de inventario físico',
  'Merma / deterioro',
  'Pérdida / robo',
  'Error de ingreso anterior',
  'Muestra / uso interno',
  'Donación',
  'Otro (especificar en notas)',
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  item: StockItem | null
  warehouses: { id: number; code: string; name: string }[]
  onClose: () => void
  onSuccess: () => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function AdjustModal({ item, warehouses, onClose, onSuccess }: Props) {
  const [mode, setMode]       = useState<'add' | 'remove'>('add')
  const [qty, setQty]         = useState('')
  const [reason, setReason]   = useState(REASONS[0])
  const [notes, setNotes]     = useState('')
  const [warehouseId, setWid] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(false)

  useEffect(() => {
    if (item) {
      setWid(item.warehouseId)
      setQty('')
      setMode('add')
      setReason(REASONS[0])
      setNotes('')
      setError('')
      setDone(false)
    }
  }, [item])

  if (!item) return null

  const qtyNum = parseFloat(qty) || 0
  const finalQty = mode === 'add' ? qtyNum : -qtyNum
  const resultStock = item.quantity + finalQty

  const handleSubmit = async () => {
    if (!qty || qtyNum <= 0) { setError('Ingresa una cantidad válida'); return }
    if (!warehouseId)        { setError('Selecciona un almacén'); return }
    if (mode === 'remove' && qtyNum > item.quantity) {
      setError(`No puedes retirar más de ${item.quantity} ${item.product.unit} disponibles`)
      return
    }
    setError('')
    setLoading(true)
    try {
      const dto: AdjustStockDto = {
        productId:   item.productId,
        warehouseId: Number(warehouseId),
        quantity:    finalQty,
        reason,
        notes: notes || undefined,
      }
      await inventoryApi.adjust(dto)
      setDone(true)
      setTimeout(() => { onSuccess(); onClose() }, 1200)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Error al ajustar el stock')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        backdropFilter: 'blur(2px)'
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden'
      }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SlidersHorizontal size={18} style={{ color: '#2563EB' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>Ajuste de stock</div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>{item.product.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Stock actual */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, background: '#F8FAFC', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Stock actual</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#0F172A' }}>
                {item.quantity} <span style={{ fontSize: 13, fontWeight: 400, color: '#64748B' }}>{item.product.unit}</span>
              </div>
            </div>
            <div style={{ flex: 1, background: '#F8FAFC', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Stock resultante</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: resultStock < 0 ? '#DC2626' : resultStock === 0 ? '#D97706' : '#16A34A' }}>
                {qtyNum > 0 ? resultStock : '—'} <span style={{ fontSize: 13, fontWeight: 400, color: '#64748B' }}>{item.product.unit}</span>
              </div>
            </div>
          </div>

          {/* Almacén (si hay múltiples) */}
          {warehouses.length > 1 && (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Almacén</label>
              <select
                value={warehouseId}
                onChange={e => setWid(Number(e.target.value))}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: 9, fontSize: 13, color: '#0F172A', background: '#F8FAFC' }}
              >
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          )}

          {/* Modo + Cantidad */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Tipo de ajuste</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {([['add', Plus, 'Ingreso', '#DCFCE7', '#16A34A'], ['remove', Minus, 'Egreso', '#FEE2E2', '#DC2626']] as const).map(
                ([m, Icon, label, bg, color]) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '10px 0', border: `2px solid ${mode === m ? color : '#E2E8F0'}`,
                      borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                      background: mode === m ? bg : '#F8FAFC',
                      color: mode === m ? color : '#64748B',
                      transition: 'all 0.15s'
                    }}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                )
              )}
            </div>

            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
              Cantidad ({item.product.unit})
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={qty}
              onChange={e => setQty(e.target.value)}
              placeholder={`Ej: 10`}
              style={{
                width: '100%', padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: 9,
                fontSize: 15, fontWeight: 600, color: '#0F172A', background: '#F8FAFC',
                boxSizing: 'border-box', outline: 'none'
              }}
            />
          </div>

          {/* Motivo */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Motivo del ajuste</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: 9, fontSize: 13, color: '#0F172A', background: '#F8FAFC' }}
            >
              {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Notas */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Notas adicionales</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Opcional — observaciones del ajuste"
              rows={2}
              style={{
                width: '100%', padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: 9,
                fontSize: 13, color: '#0F172A', background: '#F8FAFC', resize: 'none',
                boxSizing: 'border-box', fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#FEE2E2', borderRadius: 9, color: '#DC2626', fontSize: 13 }}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {/* Éxito */}
          {done && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#DCFCE7', borderRadius: 9, color: '#16A34A', fontSize: 13, fontWeight: 600 }}>
              <CheckCircle2 size={15} />
              Ajuste registrado correctamente
            </div>
          )}

          {/* Botones */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '11px 0', border: '1px solid #E2E8F0', borderRadius: 10,
                background: '#F8FAFC', cursor: 'pointer', fontWeight: 500, fontSize: 14, color: '#475569'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || done}
              style={{
                flex: 2, padding: '11px 0', border: 'none', borderRadius: 10,
                background: loading || done ? '#94A3B8' : '#2563EB',
                cursor: loading || done ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontSize: 14, color: '#fff', transition: 'background 0.15s'
              }}
            >
              {loading ? 'Guardando…' : done ? '✓ Guardado' : 'Confirmar ajuste'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
