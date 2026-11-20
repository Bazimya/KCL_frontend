import { useEffect, useRef, useState } from 'react'
import {
  Eye, Search, CheckCircle2, XCircle, Clock3, Bell, Check,
  Sun, CalendarMinus, CalendarDays, CalendarRange, Calendar, Infinity as InfinityIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api, { fileUrl } from '../../api/axios'
import Loader from '../../components/Loader'
import Modal from '../../components/admin/Modal'
import Pagination from '../../components/Pagination'
import StatCard from '../../components/admin/StatCard'
import { formatRWF, formatDate } from '../../utils/format'

// One card per period, in the order they read left-to-right - each one
// doubles as a filter button for the orders below. "Today" is where this
// page opens by default, since that's almost always what staff want to
// see first when they land here.
const PERIODS = [
  { key: 'today', label: 'Today', icon: Sun, accent: 'bg-gold-dark' },
  { key: 'yesterday', label: 'Yesterday', icon: CalendarMinus, accent: 'bg-espresso-700' },
  { key: 'week', label: 'This Week', icon: CalendarDays, accent: 'bg-espresso-700' },
  { key: 'month', label: 'This Month', icon: Calendar, accent: 'bg-espresso-700' },
  { key: 'year', label: 'This Year', icon: CalendarRange, accent: 'bg-espresso-700' },
  { key: 'lifetime', label: 'Lifetime', icon: InfinityIcon, accent: 'bg-espresso-900' },
]

// Coffee/food orders (dine-in or pickup) go through a prep-focused flow;
// machine orders (always `delivery`) go through a shipping-focused one -
// see backend/utils/orderStages.js, which this mirrors exactly.
const STAGE_SETS = {
  dine_in: ['Order Placed', 'Preparing', 'Ready for Pickup', 'Served'],
  pickup: ['Order Placed', 'Preparing', 'Ready for Pickup', 'Served'],
  delivery: ['Order Placed', 'Pending', 'Confirmed', 'Dispatched', 'Delivered'],
}
const ALL_STATUSES = ['Order Placed', 'Preparing', 'Ready for Pickup', 'Served', 'Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled']
const statusColors = {
  'Order Placed': 'bg-espresso-100 text-espresso-700',
  'Preparing': 'bg-yellow-100 text-yellow-800',
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Ready for Pickup': 'bg-blue-100 text-blue-800',
  'Confirmed': 'bg-blue-100 text-blue-800',
  'Dispatched': 'bg-purple-100 text-purple-800',
  'Served': 'bg-green-100 text-green-800',
  'Delivered': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800',
}
// The card's left-edge/ring colour, one per status - a glance down the
// grid tells staff what's still cooking vs. ready vs. done, no clicking
// needed.
const borderColors = {
  'Order Placed': 'border-espresso-200',
  'Preparing': 'border-yellow-400',
  'Pending': 'border-yellow-400',
  'Ready for Pickup': 'border-blue-400',
  'Confirmed': 'border-blue-400',
  'Dispatched': 'border-purple-400',
  'Served': 'border-green-400',
  'Delivered': 'border-green-400',
  'Cancelled': 'border-red-300',
}
const FINISHED_STATUSES = ['Served', 'Delivered', 'Cancelled']
const ORDER_TYPE_LABELS = { dine_in: 'Dine-in', pickup: 'Pickup', delivery: 'Delivery' }

// A quick visual tell for the two statuses that matter most at a glance -
// everything else just keeps its plain badge.
const statusIcon = (status) => {
  if (status === 'Served' || status === 'Delivered') return <CheckCircle2 size={15} className="text-green-600 shrink-0" />
  if (status === 'Cancelled') return <XCircle size={15} className="text-red-600 shrink-0" />
  return <Clock3 size={15} className="text-espresso-300 shrink-0" />
}

// Two short, pleasant tones synthesised on the spot (no audio file to
// ship or fail to load) - just enough to make a new order impossible to
// miss without being jarring.
const playNewOrderSound = () => {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    const ctx = new Ctx()
    const now = ctx.currentTime
    ;[880, 1318.5].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const start = now + i * 0.16
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.4)
    })
  } catch { /* browser blocked audio before any user interaction - fine, the toast still shows */ }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState({ items: [], total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('today')
  const [page, setPage] = useState(1)
  const [viewOrder, setViewOrder] = useState(null)
  const [proofUrl, setProofUrl] = useState(null)
  const [proofError, setProofError] = useState(false)
  const [stats, setStats] = useState(null)

  // { orderId, status } while the "how many minutes until ready?" prompt is open
  const [etaPrompt, setEtaPrompt] = useState(null)
  const [etaValue, setEtaValue] = useState('15')

  const loadStats = () => { api.get('/orders/stats').then((r) => setStats(r.data)).catch(() => {}) }

  const load = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (filter) params.status = filter
      if (search) params.search = search
      if (period) params.period = period
      const { data } = await api.get('/orders', { params })
      setOrders(data)
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [filter, search, period, page])
  useEffect(() => { setPage(1) }, [filter, search, period])
  useEffect(() => { loadStats() }, [])
  useEffect(() => {
    let active = true
    let objectUrl
    setProofUrl(null)
    setProofError(false)
    if (!viewOrder?.proofOfPayment) return undefined

    api.get(`/orders/${viewOrder._id}/proof`, { responseType: 'blob' })
      .then(({ data }) => {
        objectUrl = URL.createObjectURL(data)
        if (active) setProofUrl(objectUrl)
        else URL.revokeObjectURL(objectUrl)
      })
      .catch(() => {
        if (active) {
          setProofError(true)
          toast.error('Could not load payment proof')
        }
      })

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [viewOrder?._id, viewOrder?.proofOfPayment])

  // Polls for brand-new orders regardless of whatever filter/period staff
  // currently have selected (a new order is always "today", so this
  // always looks there) - the first successful poll just learns what
  // "already seen" means and stays quiet; only orders that arrive AFTER
  // that trigger the sound + popup.
  const lastSeenRef = useRef(null)
  const initializedRef = useRef(false)
  useEffect(() => {
    const poll = async () => {
      try {
        const { data } = await api.get('/orders', { params: { period: 'today', limit: 5, page: 1 } })
        const items = data.items || []
        if (!initializedRef.current) {
          lastSeenRef.current = items[0] ? new Date(items[0].createdAt).getTime() : 0
          initializedRef.current = true
          return
        }
        const newOnes = items.filter((o) => new Date(o.createdAt).getTime() > lastSeenRef.current)
        if (newOnes.length > 0) {
          lastSeenRef.current = new Date(items[0].createdAt).getTime()
          playNewOrderSound()
          // Oldest-first, so if several arrived at once the toasts stack
          // in the order they actually happened.
          newOnes.slice().reverse().forEach((o) => {
            toast.custom((t) => (
              <div
                onClick={() => { setViewOrder(o); toast.dismiss(t.id) }}
                className="cursor-pointer bg-white rounded-2xl shadow-soft border-2 border-gold p-4 flex items-center gap-3 max-w-sm animate-fadeUp"
              >
                <span className="w-10 h-10 rounded-full bg-gold/15 text-gold-dark flex items-center justify-center shrink-0">
                  <Bell size={18} />
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-espresso-900">New order placed!</p>
                  <p className="text-sm text-espresso-500 truncate">{o.orderCode} · {formatRWF(o.paymentIntent?.amount)}</p>
                </div>
              </div>
            ), { duration: 10000, position: 'top-right' })
          })
          load()
          loadStats()
        }
      } catch { /* a missed poll just tries again next interval */ }
    }
    poll()
    const interval = setInterval(poll, 8000)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const togglePeriod = (key) => setPeriod((p) => (p === key ? '' : key))

  const applyStatus = async (id, status, etaMinutes) => {
    try {
      const body = { status }
      if (etaMinutes) body.etaMinutes = Number(etaMinutes)
      const { data } = await api.put(`/orders/${id}`, body)
      toast.success('Order status updated')
      load()
      loadStats()
      if (viewOrder?._id === id) setViewOrder((o) => ({ ...o, ...data }))
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not update order')
    }
  }

  const updateStatus = (order, status) => {
    // Moving to "Preparing" needs an ETA so the customer's tracking screen
    // can show a live countdown - ask for it before applying the change.
    if (status === 'Preparing') {
      setEtaValue('15')
      setEtaPrompt({ orderId: order._id, status })
      return
    }
    applyStatus(order._id, status)
  }

  const confirmEtaPrompt = () => {
    if (!etaPrompt) return
    const minutes = Number(etaValue)
    if (!minutes || minutes <= 0) return toast.error('Enter how many minutes until this order is ready')
    applyStatus(etaPrompt.orderId, etaPrompt.status, minutes)
    setEtaPrompt(null)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="section-title">Orders</h1>
          <p className="text-espresso-500 text-sm mt-1">Track, confirm and manage customer orders.</p>
        </div>
      </div>

      {/* Each card is also a filter toggle for the orders below - click it
          again (or "Lifetime") to clear back to everything. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {PERIODS.map((p) => (
          <StatCard
            key={p.key}
            icon={p.icon}
            label={p.label}
            value={stats ? stats[p.key] : '—'}
            accent={p.accent}
            active={period === p.key}
            onClick={() => togglePeriod(p.key)}
          />
        ))}
      </div>

      <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-300" />
          <input className="input !pl-10" placeholder="Search by order number, phone, name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input sm:!w-56" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          <optgroup label="Dine-in / Pickup">
            {STAGE_SETS.dine_in.map((s) => <option key={s} value={s}>{s}</option>)}
          </optgroup>
          <optgroup label="Delivery (coffee machines)">
            {STAGE_SETS.delivery.map((s) => <option key={s} value={s}>{s}</option>)}
          </optgroup>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? <Loader /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.items.map((o) => {
              const allowed = STAGE_SETS[o.orderType] || ALL_STATUSES
              const options = allowed.includes(o.orderStatus) ? allowed : [...allowed, o.orderStatus]
              const finished = FINISHED_STATUSES.includes(o.orderStatus)
              const served = o.orderStatus === 'Served' || o.orderStatus === 'Delivered'
              const cancelled = o.orderStatus === 'Cancelled'

              return (
                <div
                  key={o._id}
                  className={`relative card p-4 border-2 transition-colors ${borderColors[o.orderStatus] || 'border-espresso-200'} ${!finished ? 'animate-heartbeat' : ''}`}
                >
                  {(served || cancelled) && (
                    <span className={`absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-soft ${served ? 'bg-green-500' : 'bg-red-500'}`}>
                      {served ? <Check size={15} /> : <XCircle size={15} />}
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-espresso-400">{o.orderCode}</p>
                      <p className="font-bold text-espresso-900 truncate">{o.customerName || o.orderby?.username || 'Guest'}</p>
                      <p className="text-xs text-espresso-400 truncate">{o.contact}</p>
                    </div>
                    <button onClick={() => setViewOrder(o)} className="p-2 rounded-lg hover:bg-espresso-100 text-espresso-500 shrink-0" aria-label="View order details">
                      <Eye size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-espresso-600">
                      {ORDER_TYPE_LABELS[o.orderType] || o.orderType}
                      {o.table && <span className="text-espresso-400"> · {o.table.label}</span>}
                    </span>
                    <span className="font-bold text-espresso-900">{formatRWF(o.paymentIntent?.amount)}</span>
                  </div>
                  <p className="text-xs text-espresso-400 mb-3">{o.paymentMethod} · {formatDate(o.createdAt)}</p>

                  <div className="flex items-center gap-1.5 pt-3 border-t border-espresso-50">
                    {statusIcon(o.orderStatus)}
                    <select
                      value={o.orderStatus}
                      onChange={(e) => updateStatus(o, e.target.value)}
                      className={`badge border-0 outline-none cursor-pointer ${statusColors[o.orderStatus] || ''}`}
                    >
                      {[...options, 'Cancelled'].filter((s, i, arr) => arr.indexOf(s) === i).map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )
            })}
            {orders.items.length === 0 && (
              <div className="card p-10 text-center text-espresso-400 sm:col-span-2 lg:col-span-3">No orders found.</div>
            )}
          </div>
          <Pagination page={orders.page} pages={orders.pages} onChange={setPage} />
        </>
      )}

      <Modal open={!!etaPrompt} onClose={() => setEtaPrompt(null)} title="How long until it's ready?">
        <p className="text-sm text-espresso-500 mb-4">
          The customer's tracking screen will show a live countdown from this.
        </p>
        <label className="label">Minutes</label>
        <input
          type="number"
          min={1}
          className="input"
          value={etaValue}
          onChange={(e) => setEtaValue(e.target.value)}
          autoFocus
        />
        <button onClick={confirmEtaPrompt} className="btn-primary w-full mt-4">Set &amp; Start Preparing</button>
      </Modal>

      <Modal open={!!viewOrder} onClose={() => setViewOrder(null)} title="Order Details" wide>
        {viewOrder && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <p><span className="font-semibold text-espresso-700">Customer:</span> {viewOrder.customerName || viewOrder.orderby?.username || 'Guest'}</p>
              <p><span className="font-semibold text-espresso-700">Contact:</span> {viewOrder.contact}</p>
              <p><span className="font-semibold text-espresso-700">Order type:</span> {ORDER_TYPE_LABELS[viewOrder.orderType] || viewOrder.orderType}</p>
              {viewOrder.table && <p><span className="font-semibold text-espresso-700">Table:</span> {viewOrder.table.label}</p>}
              {viewOrder.address && <p><span className="font-semibold text-espresso-700">Address:</span> {viewOrder.address}</p>}
              <p><span className="font-semibold text-espresso-700">Payment Method:</span> {viewOrder.paymentMethod}</p>
              <p><span className="font-semibold text-espresso-700">Call Confirmed:</span> {viewOrder.callConfirmed ? 'Yes' : 'No'}</p>
              {viewOrder.etaMinutes && (
                <p><span className="font-semibold text-espresso-700">ETA set:</span> {viewOrder.etaMinutes} min at {formatDate(viewOrder.etaSetAt)}</p>
              )}
            </div>
            {viewOrder.notes && <p className="text-sm"><span className="font-semibold text-espresso-700">Notes:</span> {viewOrder.notes}</p>}

            <div>
              <p className="font-semibold text-espresso-700 mb-2 text-sm">Items</p>
              <div className="space-y-2">
                {viewOrder.products?.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm bg-espresso-50 rounded-xl p-2">
                    <img src={fileUrl(p.image)} className="w-10 h-10 rounded-lg object-cover" />
                    <span className="flex-1">{p.title}</span>
                    <span>x{p.quantity}</span>
                    <span className="font-semibold">{formatRWF(p.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {viewOrder.proofOfPayment ? (
              <div>
                <p className="font-semibold text-espresso-700 mb-2 text-sm">Proof of Payment</p>
                {proofUrl
                  ? <img src={proofUrl} className="rounded-xl max-h-72 border border-espresso-100" />
                  : <p className="text-sm text-espresso-400">{proofError ? 'Payment proof could not be loaded.' : 'Loading proof...'}</p>}
              </div>
            ) : (
              <p className="text-sm text-espresso-400 italic">No proof of payment uploaded yet.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
