import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Armchair, Power, QrCode, CalendarClock, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Loader from '../../components/Loader'
import Modal from '../../components/admin/Modal'
import Pagination from '../../components/Pagination'
import { formatDateTimeFull } from '../../utils/format'

const emptyForm = { label: '', capacity: 4, active: true }

const bookingStatusColors = {
  Upcoming: 'bg-blue-100 text-blue-700',
  Active: 'bg-green-100 text-green-700',
  Completed: 'bg-espresso-100 text-espresso-500',
  Cancelled: 'bg-red-100 text-red-700',
}

// Tables & seats: the shop may have more physical tables than the app
// knows about, so guests can add one too (mid-checkout) - this is the
// full management view (edit/deactivate/delete/QR/bookings), staff-only.
export default function AdminTables() {
  const [tab, setTab] = useState('tables')
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [downloadingId, setDownloadingId] = useState(null)

  const [bookings, setBookings] = useState({ items: [], total: 0, page: 1, pages: 1 })
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [bookingSearch, setBookingSearch] = useState('')
  const [bookingStatus, setBookingStatus] = useState('')
  const [bookingPage, setBookingPage] = useState(1)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/tables', { params: { all: true } })
      setTables(data)
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const loadBookings = async () => {
    setLoadingBookings(true)
    try {
      const params = { page: bookingPage, limit: 8 }
      if (bookingSearch) params.search = bookingSearch
      if (bookingStatus) params.status = bookingStatus
      const { data } = await api.get('/tables/bookings', { params })
      setBookings(data)
    } finally { setLoadingBookings(false) }
  }
  useEffect(() => { if (tab === 'bookings') loadBookings() }, [tab, bookingPage, bookingSearch, bookingStatus])
  useEffect(() => { setBookingPage(1) }, [bookingSearch, bookingStatus])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (t) => { setEditing(t); setForm({ label: t.label, capacity: t.capacity, active: t.active }); setModalOpen(true) }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.label.trim()) return toast.error('Give the table a label, e.g. "Table 7"')
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/tables/${editing._id}`, form)
        toast.success('Table updated')
      } else {
        await api.post('/tables', form)
        toast.success('Table added')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not save table')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (t) => {
    try {
      await api.put(`/tables/${t._id}`, { active: !t.active })
      load()
    } catch { toast.error('Could not update table') }
  }

  const remove = async (t) => {
    if (!confirm(`Delete "${t.label}"? This cannot be undone.`)) return
    try {
      await api.delete(`/tables/${t._id}`)
      toast.success('Table deleted')
      load()
    } catch { toast.error('Could not delete table') }
  }

  // The sticker PNG comes back as binary - fetch as a blob, then trigger a
  // normal browser download via a throwaway link.
  const downloadQr = async (t) => {
    setDownloadingId(t._id)
    try {
      const res = await api.get(`/tables/${t._id}/qr`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `${t.label.replace(/\s+/g, '-')}-qr.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Could not generate QR code')
    } finally {
      setDownloadingId(null)
    }
  }

  const updateBookingStatus = async (id, status) => {
    try {
      await api.put(`/tables/bookings/${id}`, { status })
      toast.success('Booking updated')
      loadBookings()
    } catch { toast.error('Could not update booking') }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="section-title">Tables &amp; Bookings</h1>
          <p className="text-espresso-500 text-sm mt-1">
            Manage physical tables, print their QR stickers, and track reservations.
          </p>
        </div>
        {tab === 'tables' && <button onClick={openCreate} className="btn-primary"><Plus size={18} /> Add Table</button>}
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('tables')} className={`px-4 py-2 rounded-full text-sm font-semibold ${tab === 'tables' ? 'bg-espresso-900 text-cream-light' : 'bg-espresso-100 text-espresso-600'}`}>
          <Armchair size={14} className="inline mr-1.5 -mt-0.5" /> Tables
        </button>
        <button onClick={() => setTab('bookings')} className={`px-4 py-2 rounded-full text-sm font-semibold ${tab === 'bookings' ? 'bg-espresso-900 text-cream-light' : 'bg-espresso-100 text-espresso-600'}`}>
          <CalendarClock size={14} className="inline mr-1.5 -mt-0.5" /> Bookings
        </button>
      </div>

      {tab === 'tables' && (
        loading ? <Loader /> : tables.length === 0 ? (
          <div className="card p-10 text-center text-espresso-400">No tables yet. Add the first one.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((t) => (
              <div key={t._id} className={`card p-5 ${!t.active ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-11 h-11 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center">
                      <Armchair size={20} />
                    </span>
                    <div>
                      <p className="font-bold text-espresso-900">{t.label}</p>
                      <p className="text-xs text-espresso-400">Seats {t.capacity}</p>
                    </div>
                  </div>
                  <span className={`badge ${t.active ? 'bg-green-100 text-green-700' : 'bg-espresso-100 text-espresso-500'}`}>
                    {t.active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <button onClick={() => downloadQr(t)} disabled={downloadingId === t._id} className="btn-outline flex-1 min-w-[8rem] !py-2 text-sm">
                    <QrCode size={14} /> {downloadingId === t._id ? 'Generating...' : 'QR Code'}
                  </button>
                  <button onClick={() => openEdit(t)} className="btn-outline !py-2 !px-3" title="Edit"><Pencil size={14} /></button>
                  <button onClick={() => toggleActive(t)} className="btn-outline !py-2 !px-3" title={t.active ? 'Hide' : 'Activate'}><Power size={14} /></button>
                  <button onClick={() => remove(t)} className="btn-outline !py-2 !px-3 !border-red-200 !text-red-600 hover:!bg-red-50" title="Delete" aria-label="Delete table"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'bookings' && (
        <>
          <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-300" />
              <input className="input !pl-10" placeholder="Search by name or phone..." value={bookingSearch} onChange={(e) => setBookingSearch(e.target.value)} />
            </div>
            <select className="input sm:!w-48" value={bookingStatus} onChange={(e) => setBookingStatus(e.target.value)}>
              <option value="">All statuses</option>
              <option>Upcoming</option>
              <option>Active</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>

          {loadingBookings ? <Loader /> : (
            <>
              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-espresso-50 text-espresso-500 text-xs uppercase">
                    <tr>
                      <th className="text-left px-4 py-3">Customer</th>
                      <th className="text-left px-4 py-3">Tables</th>
                      <th className="text-left px-4 py-3">Party</th>
                      <th className="text-left px-4 py-3">When</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-right px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.items.map((b) => (
                      <tr key={b._id} className="border-t border-espresso-100 hover:bg-espresso-50/50">
                        <td className="px-4 py-3 font-semibold text-espresso-800">{b.customerName}<p className="text-xs font-normal text-espresso-400">{b.customerPhone}</p></td>
                        <td className="px-4 py-3 text-espresso-500">{b.tables.map((t) => t.table.label).join(', ')}</td>
                        <td className="px-4 py-3 text-espresso-500">{b.partySize}</td>
                        <td className="px-4 py-3 text-espresso-500">{formatDateTimeFull(b.startTime)} ({b.durationMinutes}min)</td>
                        <td className="px-4 py-3"><span className={`badge ${bookingStatusColors[b.status]}`}>{b.status}</span></td>
                        <td className="px-4 py-3 text-right">
                          <select
                            value={b.status}
                            onChange={(e) => updateBookingStatus(b._id, e.target.value)}
                            className="input !py-1.5 !px-2 text-xs !w-32"
                          >
                            <option>Upcoming</option>
                            <option>Active</option>
                            <option>Completed</option>
                            <option>Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {bookings.items.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-espresso-400">No bookings found.</td></tr>}
                  </tbody>
                </table>
              </div>
              <Pagination page={bookings.page} pages={bookings.pages} onChange={setBookingPage} />
            </>
          )}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Table' : 'Add Table'}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Label</label>
            <input className="input" placeholder='e.g. "Table 7" or "Patio 2"' value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          </div>
          <div>
            <label className="label">Seats</label>
            <input type="number" min={1} className="input" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-espresso-800">
            <input type="checkbox" className="accent-espresso-800 w-4 h-4" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Visible to customers at checkout
          </label>
          <button disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Table'}</button>
        </form>
      </Modal>
    </div>
  )
}
