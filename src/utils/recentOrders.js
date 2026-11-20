// Orders placed or tracked on this device, so a guest who didn't save their
// order number can still find it again (same phone/browser only - it lives
// in this browser's storage and never leaves the device).
const KEY = 'kcl_recent_orders'
const MAX = 10
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000

export const getRecentOrders = () => {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]')
    const cutoff = Date.now() - MAX_AGE_MS
    return Array.isArray(list) ? list.filter((o) => o?.code && new Date(o.placedAt).getTime() > cutoff) : []
  } catch {
    return []
  }
}

export const rememberOrder = (order) => {
  if (!order?.orderCode) return
  try {
    const rest = getRecentOrders().filter((o) => o.code !== order.orderCode)
    const entry = {
      code: order.orderCode,
      placedAt: order.createdAt || new Date().toISOString(),
      orderType: order.orderType || null,
      total: order.paymentAmount ?? null,
    }
    localStorage.setItem(KEY, JSON.stringify([entry, ...rest].slice(0, MAX)))
  } catch { /* storage full or blocked - not critical */ }
}

export const forgetOrder = (code) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(getRecentOrders().filter((o) => o.code !== code)))
  } catch {}
}
