import { useEffect, useState } from 'react'
import { Plus, Search, CheckCircle2, XCircle, Clock, Power } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Loader from '../../components/Loader'
import Modal from '../../components/admin/Modal'
import Pagination from '../../components/Pagination'
import { formatDate } from '../../utils/format'

const COURSE_TYPES = [
  { value: 'barista', label: 'Barista (Local)' },
  { value: 'cupping', label: 'Cupping / Sensory (Global Cert)' },
  { value: 'roasting', label: 'Roasting (Global Cert)' },
  { value: 'cva', label: 'CVA (Global Cert)' },
]
const COURSE_LEVELS = ['Foundation', 'Intermediate', 'Professional']
const GLOBAL_CERT_COURSES = ['cupping', 'roasting', 'cva']

const emptySessionForm = { courseType: 'barista', level: '', title: '', description: '', startDate: '', endDate: '', capacity: 20, active: true }

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
}

export default function AdminTraining() {
  const [sessions, setSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [courseFilter, setCourseFilter] = useState('')
  const [sessionModalOpen, setSessionModalOpen] = useState(false)
  const [sessionForm, setSessionForm] = useState(emptySessionForm)
  const [savingSession, setSavingSession] = useState(false)

  const [applications, setApplications] = useState({ items: [], total: 0, page: 1, pages: 1 })
  const [loadingApps, setLoadingApps] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [appCourseFilter, setAppCourseFilter] = useState('')
  const [page, setPage] = useState(1)

  const loadSessions = async () => {
    setLoadingSessions(true)
    try {
      const params = {}
      if (courseFilter) params.courseType = courseFilter
      const { data } = await api.get('/training/sessions', { params })
      setSessions(data)
    } finally { setLoadingSessions(false) }
  }

  const loadApplications = async () => {
    setLoadingApps(true)
    try {
      const params = { page, limit: 8 }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (appCourseFilter) params.courseType = appCourseFilter
      const { data } = await api.get('/training/applications', { params })
      setApplications(data)
    } finally { setLoadingApps(false) }
  }

  useEffect(() => { loadSessions() }, [courseFilter])
  useEffect(() => { loadApplications() }, [page, search, statusFilter, appCourseFilter])
  useEffect(() => { setPage(1) }, [search, statusFilter, appCourseFilter])

  const isGlobalCert = GLOBAL_CERT_COURSES.includes(sessionForm.courseType)

  const createSession = async (e) => {
    e.preventDefault()
    setSavingSession(true)
    try {
      await api.post('/training/sessions', sessionForm)
      toast.success('Training cohort published')
      setSessionModalOpen(false)
      setSessionForm(emptySessionForm)
      loadSessions()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not create cohort')
    } finally { setSavingSession(false) }
  }

  const toggleSessionActive = async (s) => {
    try {
      await api.put(`/training/sessions/${s._id}`, { active: !s.active })
      toast.success(s.active ? 'Cohort closed' : 'Cohort opened')
      loadSessions()
    } catch { toast.error('Could not update cohort') }
  }

  const updateApplicationStatus = async (id, status) => {
    try {
      await api.put(`/training/applications/${id}`, { status })
      toast.success('Application updated')
      loadApplications()
    } catch { toast.error('Could not update application') }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="section-title">Coffee Training</h1>
          <p className="text-espresso-500 text-sm mt-1">
            Publish cohorts for Barista, Cupping, Roasting and CVA, and review applications.
          </p>
        </div>
        <button onClick={() => setSessionModalOpen(true)} className="btn-primary"><Plus size={18} /> New Cohort</button>
      </div>

      {/* Sessions */}
      <div className="flex items-center gap-3 mb-4">
        <select className="input !w-64" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="">All courses</option>
          {COURSE_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
      {loadingSessions ? <Loader /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {sessions.map((s) => (
            <div key={s._id} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1.5">
                  <span className="badge bg-espresso-100 text-espresso-600 capitalize">{s.courseType}</span>
                  {s.level && <span className="badge bg-gold/15 text-gold-dark">{s.level}</span>}
                </div>
                <button onClick={() => toggleSessionActive(s)} className="p-1.5 rounded-lg hover:bg-espresso-100 text-espresso-500" title={s.active ? 'Close cohort' : 'Reopen cohort'}>
                  <Power size={14} />
                </button>
              </div>
              <p className="font-bold text-espresso-900">{s.title}</p>
              <p className="text-sm text-espresso-500 mt-1 line-clamp-2">{s.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className={`badge ${s.active ? 'bg-green-100 text-green-700' : 'bg-espresso-100 text-espresso-500'}`}>
                  {s.active ? 'Open' : 'Closed'}
                </span>
                <span className="text-xs text-espresso-400">{s.seatsTaken}/{s.capacity} seats</span>
              </div>
            </div>
          ))}
          {sessions.length === 0 && <p className="text-espresso-400 col-span-full text-center py-10">No cohorts published yet.</p>}
        </div>
      )}

      {/* Applications */}
      <h2 className="font-display font-bold text-xl text-espresso-900 mb-4">Applications</h2>
      <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-300" />
          <input className="input !pl-10" placeholder="Search by name, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input sm:!w-52" value={appCourseFilter} onChange={(e) => setAppCourseFilter(e.target.value)}>
          <option value="">All courses</option>
          {COURSE_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select className="input sm:!w-48" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </div>

      {loadingApps ? <Loader /> : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-espresso-50 text-espresso-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Applicant</th>
                  <th className="text-left px-4 py-3">Contact</th>
                  <th className="text-left px-4 py-3">Location</th>
                  <th className="text-left px-4 py-3">Cohort</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Applied</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.items.map((a) => (
                  <tr key={a._id} className="border-t border-espresso-100 hover:bg-espresso-50/50">
                    <td className="px-4 py-3 font-semibold text-espresso-800">{a.fullName}<p className="text-xs font-normal text-espresso-400">{a.gender}</p></td>
                    <td className="px-4 py-3 text-espresso-500">{a.phone}<p className="text-xs">{a.email}</p></td>
                    <td className="px-4 py-3 text-espresso-500">{[a.district, a.sector].filter(Boolean).join(', ') || 'n/a'}</td>
                    <td className="px-4 py-3 text-espresso-500">
                      {a.session?.title}
                      <p className="text-xs capitalize">{a.session?.courseType} {a.session?.level}</p>
                    </td>
                    <td className="px-4 py-3"><span className={`badge ${statusColors[a.status]}`}>{a.status}</span></td>
                    <td className="px-4 py-3 text-espresso-400">{formatDate(a.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => updateApplicationStatus(a._id, 'Approved')} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Approve"><CheckCircle2 size={16} /></button>
                        <button onClick={() => updateApplicationStatus(a._id, 'Rejected')} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Reject"><XCircle size={16} /></button>
                        <button onClick={() => updateApplicationStatus(a._id, 'Pending')} className="p-1.5 rounded-lg hover:bg-espresso-100 text-espresso-500" title="Mark pending"><Clock size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {applications.items.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-espresso-400">No applications found.</td></tr>}
              </tbody>
            </table>
          </div>
          <Pagination page={applications.page} pages={applications.pages} onChange={setPage} />
        </>
      )}

      <Modal open={sessionModalOpen} onClose={() => setSessionModalOpen(false)} title="Publish Training Cohort">
        <form onSubmit={createSession} className="space-y-4">
          <div>
            <label className="label">Course</label>
            <select className="input" value={sessionForm.courseType} onChange={(e) => setSessionForm({ ...sessionForm, courseType: e.target.value, level: '' })}>
              {COURSE_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          {isGlobalCert && (
            <div>
              <label className="label">Certification Level</label>
              <select required className="input" value={sessionForm.level} onChange={(e) => setSessionForm({ ...sessionForm, level: e.target.value })}>
                <option value="">Select a level</option>
                {COURSE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Title (e.g. "2026 Cohort 1")</label>
            <input required className="input" value={sessionForm.title} onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={sessionForm.description} onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input" value={sessionForm.startDate} onChange={(e) => setSessionForm({ ...sessionForm, startDate: e.target.value })} />
            </div>
            <div>
              <label className="label">End Date (applications close)</label>
              <input type="date" className="input" value={sessionForm.endDate} onChange={(e) => setSessionForm({ ...sessionForm, endDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Trainees Needed (capacity)</label>
            <input type="number" className="input" value={sessionForm.capacity} onChange={(e) => setSessionForm({ ...sessionForm, capacity: e.target.value })} />
          </div>
          <p className="text-xs text-espresso-400">Publishing a new active cohort automatically closes any other open cohort for the same course and level.</p>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setSessionModalOpen(false)} className="btn-outline">Cancel</button>
            <button disabled={savingSession} className="btn-primary">{savingSession ? 'Publishing...' : 'Publish Cohort'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
