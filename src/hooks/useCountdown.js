import { useEffect, useState } from 'react'

// Ticks down to a target Date (or ISO string) every second and returns a
// breakdown plus a formatted string, or null once it's passed.
export default function useCountdown(target) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!target) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [target])

  if (!target) return null
  const targetMs = new Date(target).getTime()
  const diff = targetMs - now
  if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0, label: 'Closed' }

  const seconds = Math.floor((diff / 1000) % 60)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  const label = days > 0
    ? `${days}d ${hours}h ${minutes}m`
    : hours > 0
      ? `${hours}h ${minutes}m ${seconds}s`
      : `${minutes}m ${seconds}s`

  return { expired: false, days, hours, minutes, seconds, label }
}
