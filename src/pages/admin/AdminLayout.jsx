import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Coffee, Package, ShoppingCart, Users, Settings, ArrowLeft,
  ShieldCheck, GraduationCap, LogOut, Grid3x3, X, Armchair, BookOpen, FileText, BellRing,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import useNewOrderAlerts, { NEW_ORDERS_EVENT } from '../../hooks/useNewOrderAlerts'

export default function AdminLayout() {
  const { isAdmin, can, logout } = useAuth()
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)
  const [counts, setCounts] = useState(null)

  const canOrders = isAdmin || can('manageOrders')
  const { permission: alertPermission, requestPermission } = useNewOrderAlerts(canOrders)

  useEffect(() => {
    const loadCounts = () => api.get('/dashboard/nav-counts').then((r) => setCounts(r.data)).catch(() => {})
    loadCounts()
    // Keep the sidebar badges current: on every new order, and every minute
    // for bookings/applications that arrive meanwhile.
    window.addEventListener(NEW_ORDERS_EVENT, loadCounts)
    const interval = setInterval(loadCounts, 60000)
    return () => { window.removeEventListener(NEW_ORDERS_EVENT, loadCounts); clearInterval(interval) }
  }, [])

  const items = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, perm: 'viewDashboard', end: true },
    { to: '/admin/products', label: 'Coffee Machines', icon: Package, perm: 'manageProducts', countKey: 'products' },
    { to: '/admin/drinks', label: 'Drinks Menu', icon: Coffee, perm: 'manageDrinks', countKey: 'drinks' },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart, perm: 'manageOrders', countKey: 'orders' },
    { to: '/admin/tables', label: 'Tables & Bookings', icon: Armchair, perm: 'manageTables', countKey: 'tables', badgeCountKey: 'bookings' },
    { to: '/admin/training', label: 'Coffee Training', icon: GraduationCap, perm: 'manageTrainings', countKey: 'trainingSessions', badgeCountKey: 'trainingApplications' },
    { to: '/admin/history', label: 'History', icon: BookOpen, perm: 'manageHistory', countKey: 'historyStories' },
    { to: '/admin/reports', label: 'Reports', icon: FileText, perm: 'manageReports' },
    { to: '/admin/users', label: 'Users & Roles', icon: Users, perm: 'manageUsers', countKey: 'users' },
    { to: '/admin/settings', label: 'Settings', icon: Settings, perm: 'manageSettings' },
  ].filter((i) => isAdmin || can(i.perm))

  // The 4 most-used sections sit directly on the bottom bar (phones); the
  // rest live behind the floating "more" button so the bar never crowds.
  const primary = items.slice(0, 4)
  const overflow = items.slice(4)

  // One badge per item: prefer the "needs attention" count (upcoming
  // bookings, pending applications) when there's something to act on,
  // otherwise fall back to the plain total so every item still shows
  // "how much lives here" at a glance.
  const resolveCount = (item) => {
    if (!counts) return null
    if (item.badgeCountKey && counts[item.badgeCountKey] > 0) return { value: counts[item.badgeCountKey], attention: true }
    if (item.countKey != null && counts[item.countKey] != null) return { value: counts[item.countKey], attention: false }
    return null
  }

  const CountBadge = ({ item, variant = 'sidebar' }) => {
    const c = resolveCount(item)
    if (c == null) return null
    const base = 'inline-flex items-center justify-center rounded-full font-bold shrink-0'
    if (variant === 'sidebar') {
      return (
        <span className={`${base} ml-auto min-w-[1.4rem] h-5 px-1.5 text-[11px] ${c.attention ? 'bg-gold text-espresso-900' : 'bg-white/10 text-cream-light/70'}`}>
          {c.value}
        </span>
      )
    }
    // Mobile bottom bar / overflow pills - a small dot-badge pinned to the corner
    return (
      <span className={`absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 text-[9px] ${base} ${c.attention ? 'bg-gold text-espresso-900' : 'bg-white/20 text-cream-light'}`}>
        {c.value}
      </span>
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
      isActive ? 'bg-gold text-espresso-900' : 'text-cream-light/80 hover:bg-white/10'
    }`

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop sidebar - sticky so it stays put while only the body
          scrolls; its own dark background never touches the white body. */}
      <aside className="hidden md:flex md:w-64 md:sticky md:top-0 md:h-screen md:overflow-y-auto bg-espresso-950 text-cream-light shrink-0 flex-col">
        <div className="p-5 flex items-center gap-2 border-b border-white/10">
          <img src="/logo.jpg" alt="KCL" className="w-9 h-9 rounded-full object-cover shrink-0" />
          <div>
            <p className="font-display font-bold leading-tight">KCL Admin</p>
            <p className="text-xs text-cream-light/50 flex items-center gap-1">
              <ShieldCheck size={12} /> {isAdmin ? 'Administrator' : 'Manager'}
            </p>
          </div>
        </div>
        <nav className="p-3 flex flex-col gap-1 flex-1">
          {items.map((i) => (
            <NavLink key={i.to} to={i.to} end={i.end} className={navLinkClass}>
              <i.icon size={17} /> {i.label}
              <CountBadge item={i} />
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          {canOrders && alertPermission === 'default' && (
            <button onClick={requestPermission} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gold hover:bg-white/10 text-left">
              <BellRing size={16} /> Turn on desktop order alerts
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-cream-light/70 hover:bg-white/10">
            <ArrowLeft size={16} /> Back to Store
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-300 hover:bg-red-500/10">
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar (branding + logout, since the sidebar is hidden here) */}
      <div className="md:hidden sticky top-0 z-30 bg-espresso-950 text-cream-light flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="KCL" className="w-8 h-8 rounded-full object-cover shrink-0" />
          <p className="font-display font-bold text-sm">KCL Admin</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-semibold text-red-300">
          <LogOut size={15} /> Log out
        </button>
      </div>

      <main className="flex-1 p-5 md:p-8 min-w-0 pb-24 md:pb-8 bg-white">
        <Outlet />
      </main>

      {/* Mobile bottom bar + expandable "more" button */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-espresso-900/95 backdrop-blur border-t border-espresso-800">
        <div className="grid grid-cols-5">
          {primary.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              end={i.end}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold ${
                  isActive ? 'text-gold' : 'text-cream-light/60'
                }`
              }
            >
              <span className="relative">
                <i.icon size={18} />
                <CountBadge item={i} variant="dot" />
              </span>
              {i.label.split(' ')[0]}
            </NavLink>
          ))}
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${moreOpen ? 'text-gold' : 'text-cream-light/60'}`}
          >
            {moreOpen ? <X size={18} /> : <Grid3x3 size={18} />}
            More
          </button>
        </div>
      </nav>

      {/* Overflow items animate upward from the "More" button when opened */}
      {overflow.length > 0 && (
        <div className={`md:hidden fixed bottom-16 right-3 z-40 flex flex-col items-end gap-2 ${moreOpen ? '' : 'pointer-events-none'}`}>
          {[...overflow].reverse().map((i, idx) => (
            <NavLink
              key={i.to}
              to={i.to}
              onClick={() => setMoreOpen(false)}
              className="relative flex items-center gap-2 bg-espresso-900 text-cream-light pl-4 pr-3 py-2.5 rounded-full shadow-soft text-sm font-semibold transition-all duration-300 ease-out"
              style={{
                opacity: moreOpen ? 1 : 0,
                transform: moreOpen ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.9)',
                transitionDelay: moreOpen ? `${idx * 45}ms` : '0ms',
              }}
            >
              {i.label} <i.icon size={16} />
              <CountBadge item={i} variant="dot" />
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}
