import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingCart, Truck,
  Archive, Users, Wallet, Receipt, UserCog,
  Settings, Store, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import type { AuthStore } from '@/store/authStore'
import { UserRole } from '@/types/enums'

const C = {
  primary:      '#2563EB',
  primaryLight: '#EFF6FF',
  primaryText:  '#1D4ED8',
  white:        '#FFFFFF',
  border:       '#E2E8F0',
  text:         '#0F172A',
  muted:        '#64748B',
}

const NAV = [
  { path: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { path: '/sales',      label: 'Ventas',      icon: ShoppingCart    },
  { path: '/products',   label: 'Productos',   icon: Package         },
  { path: '/inventory',  label: 'Inventario',  icon: Archive         },
  { path: '/purchases',  label: 'Compras',     icon: Truck           },
  { path: '/customers',  label: 'Clientes',    icon: Users           },
  { path: '/cash',       label: 'Caja',        icon: Wallet          },
  { path: '/billing',    label: 'Facturación', icon: Receipt         },
]

const ADMIN_NAV = [
  { path: '/users',         label: 'Usuarios',      icon: UserCog  },
  { path: '/configuration', label: 'Configuración', icon: Settings },
]

interface Props {
  collapsed: boolean
  onToggle:  () => void
}

export function Sidebar({ collapsed, onToggle }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const user    = useAuthStore((s: AuthStore) => s.user)
  const isAdmin  = user?.role === UserRole.ADMIN
  const w        = collapsed ? 64 : 240

  return (
    <aside style={{
      width: w, minHeight: '100vh', background: C.white,
      borderRight: `1px solid ${C.border}`, position: 'fixed',
      top: 0, left: 0, display: 'flex', flexDirection: 'column',
      transition: 'width 0.2s ease', zIndex: 100, overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        height: 64, display: 'flex', alignItems: 'center',
        padding: collapsed ? '0' : '0 18px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 10, borderBottom: `1px solid ${C.border}`, flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32, background: C.primary, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Store size={17} color="#fff" />
        </div>
        {!collapsed && (
          <span style={{ fontSize: 16, fontWeight: 600, color: C.text, letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
            MAQpos
          </span>
        )}
      </div>

      {/* Nav principal */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            active={location.pathname.startsWith(item.path)}
            collapsed={collapsed}
            onClick={() => navigate(item.path)}
          />
        ))}

        {/* Sección admin — solo visible para ADMIN */}
        {isAdmin && (
          <>
            <div style={{ margin: '10px 0', borderTop: `1px solid ${C.border}` }} />
            {!collapsed && (
              <p style={{
                fontSize: 11, fontWeight: 600, color: C.muted,
                textTransform: 'uppercase', letterSpacing: '0.07em',
                padding: '0 10px', margin: '0 0 6px',
              }}>
                Admin
              </p>
            )}
            {ADMIN_NAV.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                active={location.pathname.startsWith(item.path)}
                collapsed={collapsed}
                onClick={() => navigate(item.path)}
              />
            ))}
          </>
        )}
      </nav>

      {/* Toggle colapsar */}
      <div style={{ padding: '10px 8px', borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={onToggle}
          title={collapsed ? 'Expandir' : 'Contraer'}
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            width: '100%', padding: collapsed ? '9px 0' : '9px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: 'none', color: C.muted, border: 'none',
            borderRadius: 8, cursor: 'pointer', fontSize: 13,
            fontFamily: 'inherit',
          }}
        >
          {collapsed
            ? <ChevronRight size={17} />
            : <><ChevronLeft size={17} /><span>Contraer</span></>
          }
        </button>
      </div>
    </aside>
  )
}

// ── NavItem ──────────────────────────────────────────────────────────────────
interface NavItemProps {
  item:      { path: string; label: string; icon: React.ElementType }
  active:    boolean
  collapsed: boolean
  onClick:   () => void
}

function NavItem({ item, active, collapsed, onClick }: NavItemProps) {
  const Icon = item.icon
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 9,
        width: '100%', padding: collapsed ? '9px 0' : '9px 10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        background:   active ? C.primaryLight : 'none',
        color:        active ? C.primaryText  : C.muted,
        border:       'none',
        borderLeft:   active && !collapsed ? `2px solid ${C.primary}` : '2px solid transparent',
        borderRadius: 8, cursor: 'pointer', fontSize: 13,
        fontWeight: active ? 500 : 400, fontFamily: 'inherit',
        marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden',
        transition: 'background 0.12s, color 0.12s',
      }}
    >
      <Icon size={17} style={{ flexShrink: 0 }} />
      {!collapsed && item.label}
    </button>
  )
}