import { Bell, Search, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { AuthStore } from '@/store/authStore'

const C = {
  white:        '#FFFFFF',
  border:       '#E2E8F0',
  text:         '#0F172A',
  muted:        '#64748B',
  primaryLight: '#EFF6FF',
  primaryText:  '#1D4ED8',
  bg:           '#F8FAFC',
}

interface Props {
  pageTitle: string
}

export function Topbar({ pageTitle }: Props) {
  const navigate  = useNavigate()
  const user      = useAuthStore((s: AuthStore) => s.user)
  const clearAuth = useAuthStore((s: AuthStore) => s.clearAuth)

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <header style={{
      height: 64, background: C.white, borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
      position: 'sticky', top: 0, zIndex: 50, flexShrink: 0,
    }}>
      {/* Título */}
      <h1 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text, flex: 1 }}>
        {pageTitle}
      </h1>

      {/* Buscador */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={14} style={{ position: 'absolute', left: 10, color: C.muted, pointerEvents: 'none' }} />
        <input
          placeholder="Buscar..."
          style={{
            padding: '7px 12px 7px 32px', border: `1px solid ${C.border}`,
            borderRadius: 8, fontSize: 13, color: C.text,
            background: C.bg, outline: 'none', width: 200, fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Notificaciones */}
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex', padding: 6, borderRadius: 8 }}>
        <Bell size={18} />
      </button>

      {/* Usuario */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 14, borderLeft: `1px solid ${C.border}` }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: C.primaryLight,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 600, color: C.primaryText, flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ lineHeight: 1.25 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: C.text }}>{user?.name ?? '—'}</p>
          <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{user?.role ?? '—'}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex', padding: 6, marginLeft: 2 }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}