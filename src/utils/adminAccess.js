// Where a staff member should land in the admin panel. Mirrors the order of
// the admin sidebar (pages/admin/AdminLayout.jsx). A manager may not have
// every permission, so "/admin" (the Dashboard) isn't always allowed.
export const ADMIN_PAGES = [
  { path: '/admin', perm: 'viewDashboard' },
  { path: '/admin/orders', perm: 'manageOrders' },
  { path: '/admin/tables', perm: 'manageTables' },
  { path: '/admin/drinks', perm: 'manageDrinks' },
  { path: '/admin/products', perm: 'manageProducts' },
  { path: '/admin/training', perm: 'manageTrainings' },
  { path: '/admin/history', perm: 'manageHistory' },
  { path: '/admin/reports', perm: 'manageReports' },
  { path: '/admin/users', perm: 'manageUsers' },
  { path: '/admin/settings', perm: 'manageSettings' },
]

export const isStaffUser = (user) => !!user && (user.isAdmin || user.role === 'admin' || user.role === 'manager')

export const userCan = (user, perm) =>
  !!user && (user.isAdmin || user.role === 'admin' || !!(user.permissions && user.permissions[perm]))

// First admin page this user may open, or null if they have no permissions.
export const firstAllowedAdminPath = (user) => ADMIN_PAGES.find((p) => userCan(user, p.perm))?.path || null
