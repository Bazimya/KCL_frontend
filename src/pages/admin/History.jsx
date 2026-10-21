import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, EyeOff, Eye, Images, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api, { fileUrl } from '../../api/axios'
import Loader from '../../components/Loader'
import Modal from '../../components/admin/Modal'

const emptyForm = { employeeName: '', roleTitle: '', story: '', active: true, sortOrder: 0 }

export default function AdminHistory() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [coverFile, setCoverFile] = useState(null)
  const [galleryFiles, setGalleryFiles] = useState([])
  const [keepGallery, setKeepGallery] = useState([])
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/staff-stories', { params: { all: true } })
      setStories(data)
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null); setForm(emptyForm); setCoverFile(null); setGalleryFiles([]); setKeepGallery([])
    setModalOpen(true)
  }
  const openEdit = (s) => {
    setEditing(s)
    setForm({ employeeName: s.employeeName, roleTitle: s.roleTitle || '', story: s.story, active: s.active, sortOrder: s.sortOrder })
    setCoverFile(null); setGalleryFiles([]); setKeepGallery(s.gallery || [])
    setModalOpen(true)
  }

  const removeExistingGalleryPhoto = (path) => setKeepGallery((prev) => prev.filter((p) => p !== path))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (coverFile) fd.append('coverImage', coverFile)
      galleryFiles.forEach((f) => fd.append('gallery', f))

      if (editing) {
        fd.append('keepGallery', JSON.stringify(keepGallery))
        await api.put(`/staff-stories/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Story updated')
      } else {
        if (!coverFile) { toast.error('Please choose a cover photo'); setSaving(false); return }
        await api.post('/staff-stories', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Story published')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Save failed')
    } finally { setSaving(false) }
  }

  const toggleActive = async (s) => {
    try { await api.put(`/staff-stories/${s._id}`, { active: !s.active }); load() }
    catch { toast.error('Could not update') }
  }

  const remove = async (id) => {
    if (!confirm('Delete this story permanently?')) return
    try { await api.delete(`/staff-stories/${id}`); toast.success('Deleted'); load() }
    catch { toast.error('Could not delete') }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="section-title">History</h1>
          <p className="text-espresso-500 text-sm mt-1">Manage the employee stories shown on the public History page.</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={18} /> Add Story</button>
      </div>

      {loading ? <Loader /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((s) => (
            <div key={s._id} className="card p-4">
              <div className="flex gap-3">
                <img src={fileUrl(s.coverImage)} className="w-16 h-16 rounded-xl object-cover bg-espresso-50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-espresso-900 truncate">{s.employeeName}</p>
                    <span className={`badge text-[10px] shrink-0 ${s.active ? 'bg-green-100 text-green-700' : 'bg-espresso-100 text-espresso-500'}`}>
                      {s.active ? 'Live' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-xs text-espresso-400">{s.roleTitle}</p>
                  {s.gallery?.length > 0 && (
                    <p className="flex items-center gap-1 text-xs text-espresso-400 mt-1"><Images size={12} /> {s.gallery.length} photos</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => toggleActive(s)} className="p-1.5 rounded-lg hover:bg-espresso-100 text-espresso-500">
                  {s.active ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-espresso-100 text-espresso-500"><Pencil size={14} /></button>
                <button onClick={() => remove(s._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {stories.length === 0 && <p className="text-espresso-400 col-span-full text-center py-10">No stories yet.</p>}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Story' : 'Add Story'} wide>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Employee Name</label>
              <input required className="input" value={form.employeeName} onChange={(e) => setForm({ ...form, employeeName: e.target.value })} />
            </div>
            <div>
              <label className="label">Role / Title</label>
              <input className="input" value={form.roleTitle} onChange={(e) => setForm({ ...form, roleTitle: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Story</label>
            <textarea required className="input" rows={6} value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} />
          </div>
          <div>
            <label className="label">Cover Photo {editing && '(leave empty to keep current)'}</label>
            <input type="file" accept="image/*" className="input" onChange={(e) => setCoverFile(e.target.files[0])} />
          </div>

          {editing && keepGallery.length > 0 && (
            <div>
              <p className="label">Existing Gallery Photos</p>
              <div className="grid grid-cols-4 gap-2">
                {keepGallery.map((g) => (
                  <div key={g} className="relative">
                    <img src={fileUrl(g)} className="w-full aspect-square object-cover rounded-lg" />
                    <button type="button" onClick={() => removeExistingGalleryPhoto(g)} className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="label">Add Gallery Photos (up to 6)</label>
            <input type="file" accept="image/*" multiple className="input" onChange={(e) => setGalleryFiles(Array.from(e.target.files).slice(0, 6))} />
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" className="accent-espresso-800 w-4 h-4" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Visible on the public History page
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
            <button disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Story'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
