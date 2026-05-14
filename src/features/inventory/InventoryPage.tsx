import { useState, useEffect, useCallback } from 'react'
import {
  Package, TrendingDown, DollarSign, AlertTriangle,
  BarChart3, History, SlidersHorizontal
} from 'lucide-react'
import { StockTable }     from './components/StockTable'
import { MovementsTable } from './components/MovementsTable'
import { AdjustModal }    from './components/AdjustModal'
import { inventoryApi }   from '../../api/inventory'
import type { StockItem, StockMovement, StockSummary, MovementsFilters } from '../../api/inventory'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(n)

const fmtNum = (n: number) =>
  new Intl.NumberFormat('es-PE').format(n)

// ─── Cards de resumen ─────────────────────────────────────────────────────────

function SummaryCard({
  icon: Icon, label, value, sub, color
}: { icon: React.ElementType; label: string; value: string; sub?: string; color: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '18px 20px',
      border: '1px solid #E2E8F0', flex: '1 1 160px',
      display: 'flex', alignItems: 'flex-start', gap: 14
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, background: color + '1A',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', lineHeight: 1.2, marginTop: 2 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'stock',     label: 'Stock actual',   icon: BarChart3        },
  { id: 'movements', label: 'Movimientos',     icon: History          },
]

// ─── Página principal ─────────────────────────────────────────────────────────

export function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'stock' | 'movements'>('stock')

  // Stock
  const [stock,         setStock]         = useState<StockItem[]>([])
  const [stockLoading,  setStockLoading]  = useState(true)
  const [stockSearch,   setStockSearch]   = useState('')
  const [warehouseId,   setWarehouseId]   = useState<number | undefined>()
  const [lowStockOnly,  setLowStockOnly]  = useState(false)

  // Movimientos
  const [movements,     setMovements]     = useState<StockMovement[]>([])
  const [mvTotal,       setMvTotal]       = useState(0)
  const [mvPage,        setMvPage]        = useState(1)
  const [mvLoading,     setMvLoading]     = useState(false)
  const [mvFilters,     setMvFilters]     = useState<MovementsFilters>({ page: 1, limit: 30 })

  // Resumen + almacenes
  const [summary,    setSummary]    = useState<StockSummary | null>(null)
  const [warehouses, setWarehouses] = useState<{ id: number; code: string; name: string }[]>([])

  // Modal
  const [adjustTarget, setAdjustTarget] = useState<StockItem | null>(null)

  // ── Carga de almacenes ──────────────────────────────────────────────────────
  useEffect(() => {
    inventoryApi.getWarehouses()
      .then(setWarehouses)
      .catch(() => setWarehouses([{ id: 1, code: '01', name: 'Almacén Principal' }]))
  }, [])

  // ── Carga de resumen ────────────────────────────────────────────────────────
  const loadSummary = useCallback(async () => {
    try {
      const s = await inventoryApi.getSummary()
      setSummary(s)
    } catch {
      // fallback silencioso
    }
  }, [])

  // ── Carga de stock ──────────────────────────────────────────────────────────
  const loadStock = useCallback(async () => {
    setStockLoading(true)
    try {
      const res = await inventoryApi.getStock({
        search: stockSearch || undefined,
        warehouseId,
        lowStock: lowStockOnly || undefined,
      })
      setStock(Array.isArray(res) ? res : res.data ?? [])
    } catch (e) {
      console.error('Error cargando stock:', e)
      setStock([])
    } finally {
      setStockLoading(false)
    }
  }, [stockSearch, warehouseId, lowStockOnly])

  // ── Carga de movimientos ────────────────────────────────────────────────────
  const loadMovements = useCallback(async (filters: MovementsFilters) => {
    setMvLoading(true)
    try {
      const res = await inventoryApi.getMovements(filters)
      setMovements(res.data ?? [])
      setMvTotal(res.total ?? 0)
    } catch {
      setMovements([])
      setMvTotal(0)
    } finally {
      setMvLoading(false)
    }
  }, [])

  // Efectos de carga
  useEffect(() => { loadSummary() }, [loadSummary])
  useEffect(() => { loadStock()   }, [loadStock])
  useEffect(() => { loadMovements(mvFilters) }, [mvFilters, loadMovements])

  const handleMvFilter = (partial: Partial<MovementsFilters>) => {
    const next = { ...mvFilters, ...partial }
    setMvFilters(next)
    setMvPage(next.page ?? 1)
  }

  const handleMvPage = (p: number) => handleMvFilter({ page: p })

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8FAFC' }}>

      {/* ── Encabezado ── */}
      <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0F172A' }}>Inventario</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#64748B', marginTop: 2 }}>
              Control de stock, movimientos y ajustes por almacén
            </p>
          </div>
          <button
            onClick={() => setAdjustTarget(stock[0] ?? null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
              background: '#2563EB', border: 'none', borderRadius: 10,
              color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer'
            }}
          >
            <SlidersHorizontal size={16} />
            Ajuste manual
          </button>
        </div>

        {/* ── Cards ── */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
          <SummaryCard
            icon={Package}
            label="Productos en stock"
            value={fmtNum(summary?.totalProducts ?? stock.length)}
            sub="referencias activas"
            color="#2563EB"
          />
          <SummaryCard
            icon={BarChart3}
            label="Total unidades"
            value={fmtNum(summary?.totalUnits ?? stock.reduce((s, i) => s + i.quantity, 0))}
            sub="en todos los almacenes"
            color="#7C3AED"
          />
          <SummaryCard
            icon={DollarSign}
            label="Valor total"
            value={fmt(summary?.totalValue ?? stock.reduce((s, i) => s + i.totalValue, 0))}
            sub="al costo promedio"
            color="#16A34A"
          />
          <SummaryCard
            icon={AlertTriangle}
            label="Stock bajo"
            value={String(summary?.lowStockCount ?? stock.filter(i => i.quantity > 0 && i.quantity <= 5).length)}
            sub={`${summary?.outOfStockCount ?? stock.filter(i => i.quantity <= 0).length} sin stock`}
            color="#D97706"
          />
          <SummaryCard
            icon={TrendingDown}
            label="Sin stock"
            value={String(summary?.outOfStockCount ?? stock.filter(i => i.quantity <= 0).length)}
            sub="requieren reposición"
            color="#DC2626"
          />
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid #E2E8F0' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: activeTab === id ? 600 : 400,
                color: activeTab === id ? '#2563EB' : '#64748B',
                borderBottom: `2px solid ${activeTab === id ? '#2563EB' : 'transparent'}`,
                marginBottom: -1, transition: 'all 0.15s'
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenido del tab activo ── */}
      <div style={{ flex: 1, overflow: 'hidden', background: '#fff' }}>
        {activeTab === 'stock' && (
          <StockTable
            items={stock}
            loading={stockLoading}
            onAdjust={setAdjustTarget}
            onSearch={setStockSearch}
            onFilterWarehouse={setWarehouseId}
            onFilterLowStock={setLowStockOnly}
            warehouses={warehouses}
            selectedWarehouse={warehouseId}
            lowStockOnly={lowStockOnly}
            onRefresh={loadStock}
          />
        )}
        {activeTab === 'movements' && (
          <MovementsTable
            movements={movements}
            loading={mvLoading}
            total={mvTotal}
            page={mvPage}
            limit={30}
            onPageChange={handleMvPage}
            onFilter={handleMvFilter}
            warehouses={warehouses}
            currentFilters={mvFilters}
          />
        )}
      </div>

      {/* ── Modal de ajuste ── */}
      <AdjustModal
        item={adjustTarget}
        warehouses={warehouses}
        onClose={() => setAdjustTarget(null)}
        onSuccess={() => { loadStock(); loadSummary() }}
      />
    </div>
  )
}
