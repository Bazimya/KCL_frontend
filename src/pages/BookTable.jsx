import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, Users, CheckCircle2, Armchair, User, Phone, Timer, Calendar, Clock, StickyNote } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import Loader from '../components/Loader'

// Booking hours (Kigali time) - must match KCL_backend/utils/bookingRules.js.
// The server repeats them in every availability response and is the final word.
const DEFAULT_HOURS = { open: 7, close: 21 }
const pad = (n) => String(n).padStart(2, '0')
const toMinutes = (hhmm) => { const [h, m] = (hhmm || '').split(':').map(Number); return h * 60 + (m || 0) }
const formatClock = (mins) => {
  const h = Math.floor(mins / 60), m = mins % 60
  return `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`
}
// The shop is in Kigali (UTC+2, no daylight saving): the date and time a
// customer picks always mean Kigali time, whatever time zone their phone is in.
const kigaliDate = (ymd, hhmm) => new Date(`${ymd}T${hhmm}:00+02:00`)

const emptyForm = { customerName: '', customerPhone: '', partySize: 2, startDate: '', startTime: '', durationMinutes: 60, notes: '' }

export default function BookTable() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(null)
  // Which tables are free for the chosen date/time/length (null = not chosen yet)
  const [availability, setAvailability] = useState(null)
  const [checking, setChecking] = useState(false)
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(60)
  const [hours, setHours] = useState(DEFAULT_HOURS)

  useEffect(() => {
    api.get('/tables').then((r) => setTables(r.data || [])).finally(() => setLoading(false))
  }, [])

  const slotStart = form.startDate && form.startTime ? kigaliDate(form.startDate, form.startTime) : null
  const duration = Number(form.durationMinutes) || 60
  const latestStart = hours.close * 60 - duration
  const hoursProblem = form.startTime && (toMinutes(form.startTime) < hours.open * 60 || toMinutes(form.startTime) > latestStart)
    ? `We take bookings from ${formatClock(hours.open * 60)} to ${formatClock(hours.close * 60)}. For ${duration} minutes, please start between ${formatClock(hours.open * 60)} and ${formatClock(latestStart)}.`
    : null

  const checkAvailability = async () => {
    if (!slotStart || Number.isNaN(slotStart.getTime()) || hoursProblem) { setAvailability(null); return }
    setChecking(true)
    try {
      const { data } = await api.get('/tables/availability', {
        params: { start: slotStart.toISOString(), duration: Number(form.durationMinutes) || 60 },
      })
      const map = Object.fromEntries((data.tables || []).map((t) => [t._id, t]))
      setAvailability(map)
      if (data.rules?.maxAdvanceDays) setMaxAdvanceDays(data.rules.maxAdvanceDays)
      if (data.rules?.openingHour != null) setHours({ open: data.rules.openingHour, close: data.rules.closingHour })
      // Drop any picked table that turned out to be taken at this time.
      setSelectedIds((prev) => {
        const keep = prev.filter((id) => map[id]?.available)
        if (keep.length !== prev.length) toast('Some tables you picked are taken at that time, so we unselected them.', { icon: 'ℹ️' })
        return keep
      })
    } catch (err) {
      setAvailability(null)
      toast.error(err.response?.data?.msg || 'Could not check availability')
    } finally {
      setChecking(false)
    }
  }

  // Re-check whenever the date, time or length changes.
  useEffect(() => {
    if (!form.startDate || !form.startTime) { setAvailability(null); return undefined }
    const t = setTimeout(checkAvailability, 300)
    return () => clearTimeout(t)
  }, [form.startDate, form.startTime, form.durationMinutes]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTable = (id) => {
    if (availability && !availability[id]?.available) return
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const seatsChosen = useMemo(
    () => tables.filter((t) => selectedIds.includes(t._id)).reduce((sum, t) => sum + (t.capacity || 0), 0),
    [tables, selectedIds],
  )
  const partySize = Number(form.partySize) || 1

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (!selectedIds.length) return toast.error('Please choose at least one table')
    if (!form.customerName || !form.customerPhone || !form.startDate || !form.startTime) {
      return toast.error('Please fill in your name, phone, and the reservation date/time')
    }
    if (hoursProblem) return toast.error(hoursProblem)
    if (seatsChosen < partySize) {
      return toast.error(`Your tables seat ${seatsChosen}, but your party is ${partySize}. Please add another table.`)
    }
    setSubmitting(true)
    try {
      const startTime = kigaliDate(form.startDate, form.startTime).toISOString()
      const { data } = await api.post('/tables/bookings', {
        tableIds: selectedIds,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        partySize: Number(form.partySize) || 1,
        startTime,
        durationMinutes: Number(form.durationMinutes) || 60,
        notes: form.notes,
      })
      setDone(data)
      toast.success('Table reserved!')
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not book that table', { duration: 6000 })
      // Someone may have just taken a table - refresh what's free.
      if (err.response?.status === 409) checkAvailability()
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="container-app py-24 max-w-lg text-center">
        <CheckCircle2 size={56} className="mx-auto text-green-600 mb-4" />
        <h1 className="section-title">Table Reserved</h1>
        <p className="text-espresso-500 mt-3">
          {done.tables.map((t) => t.table.label).join(', ')} reserved for {done.customerName}, party of{' '}
          {done.partySize}, on {new Date(done.startTime).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}.
        </p>
        <p className="text-espresso-600 mt-2">Your booking reference is <strong className="font-mono">B-{done._id}</strong>.</p>
        <p className="text-espresso-400 text-sm mt-2">We've sent a confirmation text to {done.customerPhone}. Just show up and scan the table's QR code when you arrive.</p>
      </div>
    )
  }

  const today = new Date().toISOString().slice(0, 10)
  const lastDay = new Date(Date.now() + maxAdvanceDays * 864e5).toISOString().slice(0, 10)

  return (
    <div className="container-app py-10 max-w-2xl">
      <div className="mb-8 text-center">
        <span className="w-14 h-14 rounded-full bg-gold/15 text-gold-dark flex items-center justify-center mx-auto mb-3">
          <CalendarClock size={26} />
        </span>
        <h1 className="section-title">Reserve a Table</h1>
        <p className="text-espresso-500 mt-2">Book one or more tables ahead of time, no account needed.</p>
      </div>

      <form onSubmit={submit} className="card p-6 space-y-6">
        <div>
          <h3 className="font-display font-bold text-lg mb-3">Your Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-1"><User size={14} /> Name</label>
              <input name="customerName" className="input" value={form.customerName} onChange={handleChange} required />
            </div>
            <div>
              <label className="label flex items-center gap-1"><Phone size={14} /> Phone</label>
              <input name="customerPhone" className="input" placeholder="07xx xxx xxx" value={form.customerPhone} onChange={handleChange} required />
            </div>
            <div>
              <label className="label flex items-center gap-1"><Users size={14} /> Party Size</label>
              <input type="number" min={1} name="partySize" className="input" value={form.partySize} onChange={handleChange} />
            </div>
            <div>
              <label className="label flex items-center gap-1"><Timer size={14} /> Duration</label>
              <select name="durationMinutes" className="input" value={form.durationMinutes} onChange={handleChange}>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
                <option value={180}>3 hours</option>
              </select>
            </div>
            <div>
              <label className="label flex items-center gap-1"><Calendar size={14} /> Date</label>
              <input type="date" name="startDate" min={today} max={lastDay} className="input" value={form.startDate} onChange={handleChange} required />
            </div>
            <div>
              <label className="label flex items-center gap-1"><Clock size={14} /> Time</label>
              <input type="time" name="startTime" className="input" step={900}
                min={`${pad(hours.open)}:00`} max={`${pad(Math.floor(latestStart / 60))}:${pad(latestStart % 60)}`}
                value={form.startTime} onChange={handleChange} required />
              <p className={`text-xs mt-1 ${hoursProblem ? 'text-red-600 font-semibold' : 'text-espresso-400'}`}>
                {hoursProblem || `Open for bookings ${formatClock(hours.open * 60)} to ${formatClock(hours.close * 60)} (Kigali time)`}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-display font-bold text-lg mb-3">Choose Table(s)</h3>
          <p className="text-xs text-espresso-400 mb-3">
            {availability
              ? 'Tables already booked at your chosen time are greyed out. Select more than one if your group needs extra seating.'
              : hoursProblem ? 'Choose a time within our booking hours to see which tables are free.'
                : 'Pick a date and time first to see which tables are free.'}
          </p>
          {loading || checking ? <Loader label={checking ? 'Checking free tables...' : undefined} /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {tables.map((t) => {
                const info = availability?.[t._id]
                const taken = availability && !info?.available
                const selected = selectedIds.includes(t._id)
                return (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => toggleTable(t._id)}
                    disabled={!availability || taken}
                    aria-pressed={selected}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold transition flex items-center gap-2 text-left ${
                      taken ? 'border-espresso-100 bg-espresso-50 text-espresso-300 cursor-not-allowed'
                        : selected ? 'border-gold bg-gold/5 text-espresso-900'
                          : !availability ? 'border-espresso-100 text-espresso-400 cursor-not-allowed'
                            : 'border-espresso-100 text-espresso-600 hover:border-gold/50'
                    }`}
                  >
                    <Armchair size={16} className="shrink-0" />
                    <span>
                      {t.label}
                      <span className="block text-xs font-normal">
                        {taken ? (info?.reason === 'in_use' ? 'In use right now' : 'Booked at this time') : `seats ${t.capacity}`}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          )}
          {selectedIds.length > 0 && (
            <p className={`text-sm mt-3 font-semibold ${seatsChosen < partySize ? 'text-red-600' : 'text-green-700'}`}>
              {seatsChosen < partySize
                ? `These tables seat ${seatsChosen}, your party is ${partySize}. Add another table.`
                : `${seatsChosen} seats for your party of ${partySize}.`}
            </p>
          )}
        </div>

        <div>
          <label className="label flex items-center gap-1"><StickyNote size={14} /> Notes (optional)</label>
          <textarea name="notes" className="input" rows={2} value={form.notes} onChange={handleChange} />
        </div>

        <button disabled={submitting} className="btn-primary w-full !py-3">
          {submitting ? 'Reserving...' : 'Reserve Table'}
        </button>
      </form>
    </div>
  )
}
