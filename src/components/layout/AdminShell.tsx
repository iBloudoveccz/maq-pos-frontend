import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar }  from './Topbar'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/sales':         'Ventas',
  '/products':      'Productos',
  '/inventory':     'Inventario',
  '/purchases':     'Compras',
  '/customers':     'Clientes',
  '/cash':          'Caja',
  '/billing':       'Facturación',
  '/users':         'Usuarios',
  '/configuration': 'Configuración',
}

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  const match = Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k))
  return match ? PAGE_TITLES[match] : 'Panel'
}

export function AdminShell() {
  const [collapsed, setCollapsed] = useState(false)
  const location  = useLocation()
  const sidebarW  = collapsed ? 64 : 240
  const pageTitle = getPageTitle(location.pathname)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div style={{
        marginLeft: sidebarW, flex: 1, display: 'flex',
        flexDirection: 'column', transition: 'margin-left 0.2s ease', minWidth: 0,
      }}>
        <Topbar pageTitle={pageTitle} />

        <main style={{ flex: 1, padding: 28, minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}