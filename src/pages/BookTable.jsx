import { useEffect, useState } from 'react'
import { CalendarClock, Users, CheckCircle2, Armchair, User, Phone, Timer, Calendar, Clock, StickyNote } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import Loader from '../components/Loader'

const emptyForm = { customerName: '', customerPhone: '', partySize: 2, startDate: '', startTime: '', durationMinutes: 60, notes: '' }

export default function BookTable() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(null)

  useEffect(() => {
    api.get('/tables').then((r) => setTables(r.data || [])).finally(() => setLoading(false))
  }, [])

  const toggleTable = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (!selectedIds.length) return toast.error('Please choose at least one table')
    if (!form.customerName || !form.customerPhone || !form.startDate || !form.startTime) {
      return toast.error('Please fill in your name, phone, and the reservation date/time')
    }
    setSubmitting(true)
    try {
      const startTime = new Date(`${form.startDate}T${form.startTime}`).toISOString()
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
      toast.error(err.response?.data?.msg || 'Could not book that table')
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
        <p className="text-espresso-400 text-sm mt-2">Just show up and scan the table's QR code when you arrive.</p>
      </div>
    )
  }

  const today = new Date().toISOString().slice(0, 10)

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
              <input type="date" name="startDate" min={today} className="input" value={form.startDate} onChange={handleChange} required />
            </div>
            <div>
              <label className="label flex items-center gap-1"><Clock size={14} /> Time</label>
              <input type="time" name="startTime" className="input" value={form.startTime} onChange={handleChange} required />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-display font-bold text-lg mb-3">Choose Table(s)</h3>
          <p className="text-xs text-espresso-400 mb-3">Select more than one if your group needs extra seating.</p>
          {loading ? <Loader /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {tables.map((t) => (
                <button
                  key={t._id}
                  type="button"
                  onClick={() => toggleTable(t._id)}
                  className={`p-3 rounded-xl border-2 text-sm font-semibold transition flex items-center gap-2 ${
                    selectedIds.includes(t._id) ? 'border-gold bg-gold/5 text-espresso-900' : 'border-espresso-100 text-espresso-600'
                  }`}
                >
                  <Armchair size={16} />
                  <span>
                    {t.label}
                    <span className="block text-xs font-normal text-espresso-400">seats {t.capacity}</span>
                  </span>
                </button>
              ))}
            </div>
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
