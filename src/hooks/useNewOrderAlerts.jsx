import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Bell } from 'lucide-react'
import api from '../api/axios'
import { formatRWF } from '../utils/format'

export const NEW_ORDERS_EVENT = 'kcl:new-orders'
const POLL_MS = 8000

// Two short tones synthesised on the spot (no audio file to ship or fail to
// load). Browsers only allow sound after the user has clicked somewhere on
// the page once - before that the popup still shows, silently.
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
  } catch { /* audio blocked until the first click - the popup still shows */ }
}

const notificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window

// Watches for brand-new orders on EVERY admin page (it lives in AdminLayout),
// not just the Orders page: sound + popup, a "(2) New orders" tab title, and
// a desktop notification when the admin tab is in the background (if staff
// allowed it). Other components (the Orders list, sidebar counts) refresh by
// listening for NEW_ORDERS_EVENT.
export default function useNewOrderAlerts(enabled) {
  const navigate = useNavigate()
  const lastSeenRef = useRef(null)
  const unseenRef = useRef(0)
  const baseTitleRef = useRef(typeof document !== 'undefined' ? document.title : '')
  const [permission, setPermission] = useState(notificationsSupported() ? Notification.permission : 'unsupported')

  const requestPermission = useCallback(async () => {
    if (!notificationsSupported()) return
    try { setPermission(await Notification.requestPermission()) } catch { /* ignored */ }
  }, [])

  // Clear the "(N) New orders" tab title once staff look at the tab again.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        unseenRef.current = 0
        document.title = baseTitleRef.current
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      document.title = baseTitleRef.current
    }
  }, [])

  useEffect(() => {
    if (!enabled) return undefined
    let stopped = false

    const poll = async () => {
      try {
        const { data } = await api.get('/orders', { params: { period: 'today', limit: 5, page: 1 } })
        if (stopped) return
        const items = data.items || []
        // First poll only learns what "already seen" means - no alert for
        // orders that existed before staff opened the panel.
        if (lastSeenRef.current === null) {
          lastSeenRef.current = items[0] ? new Date(items[0].createdAt).getTime() : 0
          return
        }
        const newOnes = items.filter((o) => new Date(o.createdAt).getTime() > lastSeenRef.current)
        if (!newOnes.length) return
        lastSeenRef.current = new Date(items[0].createdAt).getTime()

        playNewOrderSound()
        window.dispatchEvent(new CustomEvent(NEW_ORDERS_EVENT, { detail: { orders: newOnes } }))

        if (document.visibilityState !== 'visible') {
          unseenRef.current += newOnes.length
          document.title = `(${unseenRef.current}) New order${unseenRef.current > 1 ? 's' : ''} · ${baseTitleRef.current}`
          if (notificationsSupported() && Notification.permission === 'granted') {
            newOnes.forEach((o) => {
              const n = new Notification('New order at Kigali Coffee Lab', {
                body: `${o.orderCode} · ${formatRWF(o.paymentIntent?.amount)}`,
                tag: `kcl-order-${o.orderCode}`,
              })
              n.onclick = () => { window.focus(); navigate('/admin/orders', { state: { openOrder: o } }); n.close() }
            })
          }
        }

        // Oldest first, so several arrivals stack in the order they happened.
        newOnes.slice().reverse().forEach((o) => {
          toast.custom((t) => (
            <div
              onClick={() => { navigate('/admin/orders', { state: { openOrder: o } }); toast.dismiss(t.id) }}
              className="cursor-pointer bg-white rounded-2xl shadow-soft border-2 border-gold p-4 flex items-center gap-3 max-w-sm animate-fadeUp"
            >
              <span className="w-10 h-10 rounded-full bg-gold/15 text-gold-dark flex items-center justify-center shrink-0">
                <Bell size={18} />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-espresso-900">New order placed!</p>
                <p className="text-sm text-espresso-500 truncate">{o.orderCode} · {formatRWF(o.paymentIntent?.amount)} · tap to open</p>
              </div>
            </div>
          ), { duration: 10000, position: 'top-right' })
        })
      } catch { /* a missed poll just tries again next interval */ }
    }

    poll()
    const interval = setInterval(poll, POLL_MS)
    return () => { stopped = true; clearInterval(interval) }
  }, [enabled, navigate])

  return { permission, requestPermission }
}
