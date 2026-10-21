import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

// A few different calming lines so it doesn't feel like a broken robot
// repeating the same sentence if the wait runs long - picked once per
// mount (not re-randomised every second) so it doesn't flicker.
const CALMING_MESSAGES = [
  "Please be patient, we're on our way!",
  "Almost there - thanks for your patience!",
  "Still coming right up, hang tight!",
]

// Live countdown from etaSetAt + etaMinutes, ticking every second on the
// client - staff only set the ETA once, the customer's screen does the
// rest without any extra network traffic. Once the ETA passes, this
// doesn't just freeze at zero: it counts back UP (how long overtime),
// turns red, and swaps to a calming message instead of a bare number.
export default function EtaCountdown({ etaSetAt, etaMinutes }) {
  const [diff, setDiff] = useState(0) // seconds remaining (>0) or overtime (<0)
  const [message] = useState(() => CALMING_MESSAGES[Math.floor(Math.random() * CALMING_MESSAGES.length)])

  useEffect(() => {
    const targetMs = new Date(etaSetAt).getTime() + etaMinutes * 60000
    const tick = () => setDiff(Math.round((targetMs - Date.now()) / 1000))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [etaSetAt, etaMinutes])

  const overdue = diff < 0
  const abs = Math.abs(diff)
  const mm = String(Math.floor(abs / 60)).padStart(2, '0')
  const ss = String(abs % 60).padStart(2, '0')

  return (
    <div className={`mt-3 p-4 rounded-xl border flex items-center gap-3 transition-colors ${overdue ? 'bg-red-50 border-red-200' : 'bg-gold/10 border-gold/30'}`}>
      <Clock size={22} className={overdue ? 'text-red-600' : 'text-gold-dark'} />
      <div>
        <p className={`text-xs font-semibold ${overdue ? 'text-red-600' : 'text-espresso-500'}`}>
          {overdue ? message : 'Ready in about'}
        </p>
        <p className={`font-mono font-extrabold text-2xl ${overdue ? 'text-red-600' : 'text-espresso-900'}`}>{mm}:{ss}</p>
      </div>
    </div>
  )
}
