import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleGuard }      from './RoleGuard'
import { AdminShell }     from '@/components/layout/AdminShell'
import { LoginPage }      from '@/features/auth/LoginPage'
import { DashboardPage }  from '@/features/dashboard/DashboardPage'
import { InventoryPage } from '@/features/inventory/InventoryPage'
import ProductsPage from '@/features/products/ProductsPage'

export const router = createBrowserRouter([
  // Pública
  {
    path: '/login',
    element: <LoginPage />,
  },
  // Raíz → dashboard
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  // Protegidas
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminShell />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          // Se irán agregando aquí módulo por módulo:
          { path: '/products',     element: <ProductsPage /> },
          { path: '/inventory', element: <InventoryPage /> },
          // { path: '/products/new', element: <ProductFormPage /> },
          // { path: '/products/:id', element: <ProductFormPage /> },
          // { path: '/sales',        element: <SalesPage /> },
          // { path: '/inventory',    element: <InventoryPage /> },
          // { path: '/purchases',    element: <PurchasesPage /> },
          // { path: '/customers',    element: <CustomersPage /> },
          // { path: '/billing',      element: <BillingPage /> },

          // Solo ADMIN
          {
            element: <RoleGuard allowedRoles={['ADMIN']} />,
            children: [
              // { path: '/users', element: <UsersPage /> },
            ],
          },
        ],
      },
    ],
  },
])