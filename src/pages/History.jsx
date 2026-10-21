import { useEffect, useState } from 'react'
import { BookOpen, Images, Expand } from 'lucide-react'
import api, { fileUrl } from '../api/axios'
import Loader from '../components/Loader'
import Modal from '../components/admin/Modal'
import PhotoLightbox from '../components/PhotoLightbox'

const SHORT_LENGTH = 220

// Every photo for a story, cover first then gallery in order - this is
// the one consistent photo set the lightbox browses, whichever photo
// (cover, on the card, or any gallery thumbnail inside "Read more") the
// customer actually clicked to get there.
const photosFor = (story) => [story.coverImage, ...(story.gallery || [])]

export default function History() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [openStory, setOpenStory] = useState(null)
  // { photos, index } while the full-screen lightbox is open
  const [lightbox, setLightbox] = useState(null)

  const openLightbox = (story, index) => setLightbox({ photos: photosFor(story), index })
  const navigateLightbox = (delta) => setLightbox((lb) => {
    if (!lb) return lb
    const next = (lb.index + delta + lb.photos.length) % lb.photos.length
    return { ...lb, index: next }
  })

  useEffect(() => {
    api.get('/staff-stories').then((r) => setStories(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader label="Loading our story..." />

  return (
    <div>
      <section className="bg-coffee-gradient text-cream-light py-16">
        <div className="container-app text-center max-w-2xl mx-auto">
          <span className="badge bg-gold/20 text-gold border border-gold/30 mb-4">Our People</span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold">History</h1>
          <p className="mt-4 text-cream-light/80 text-lg">The people behind every cup at Kigali Coffee Lab.</p>
        </div>
      </section>

      <section className="container-app py-16 space-y-10">
        {stories.length === 0 && (
          <p className="text-center text-espresso-400 py-10">No stories published yet.</p>
        )}
        {stories.map((s, i) => {
          const isLong = s.story.length > SHORT_LENGTH
          const excerpt = isLong ? `${s.story.slice(0, SHORT_LENGTH)}...` : s.story
          const reversed = i % 2 === 1
          return (
            <div key={s._id} className={`card p-6 md:p-8 grid md:grid-cols-5 gap-8 items-center ${reversed ? 'md:[&>*:first-child]:order-2' : ''}`}>
              <div className="md:col-span-2">
                <button onClick={() => openLightbox(s, 0)} className="relative w-full block group" aria-label={`View photos of ${s.employeeName}`}>
                  <img src={fileUrl(s.coverImage)} alt={s.employeeName} className="w-full aspect-square object-cover rounded-2xl" />
                  <span className="absolute inset-0 rounded-2xl bg-espresso-950/0 group-hover:bg-espresso-950/20 transition-colors flex items-center justify-center">
                    <Expand size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </button>
                {s.gallery?.length > 0 && (
                  <button onClick={() => openLightbox(s, 1)} className="flex items-center gap-1 mt-2 text-xs text-espresso-400 hover:text-gold-dark">
                    <Images size={13} /> {s.gallery.length} more photo{s.gallery.length === 1 ? '' : 's'}
                  </button>
                )}
              </div>
              <div className="md:col-span-3">
                <h3 className="font-display text-2xl font-bold text-espresso-900">{s.employeeName}</h3>
                {s.roleTitle && <p className="text-gold-dark font-semibold text-sm mt-1">{s.roleTitle}</p>}
                <p className="text-espresso-600 leading-relaxed mt-3 whitespace-pre-line">{excerpt}</p>
                {isLong && (
                  <button onClick={() => setOpenStory(s)} className="btn-outline mt-4 !py-2 text-sm">
                    <BookOpen size={15} /> Read more
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </section>

      <Modal open={!!openStory} onClose={() => setOpenStory(null)} title={openStory?.employeeName} wide>
        {openStory && (
          <div>
            <button onClick={() => openLightbox(openStory, 0)} className="relative w-full block group" aria-label="View full-size photo">
              <img src={fileUrl(openStory.coverImage)} alt={openStory.employeeName} className="w-full max-h-80 object-cover rounded-xl mb-4" />
              <span className="absolute inset-0 mb-4 rounded-xl bg-espresso-950/0 group-hover:bg-espresso-950/20 transition-colors flex items-center justify-center">
                <Expand size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </button>
            {openStory.roleTitle && <p className="text-gold-dark font-semibold text-sm mb-2">{openStory.roleTitle}</p>}
            <p className="text-espresso-600 leading-relaxed whitespace-pre-line">{openStory.story}</p>
            {openStory.gallery?.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-5">
                {openStory.gallery.map((g, i) => (
                  <button key={i} onClick={() => openLightbox(openStory, i + 1)} className="relative block group">
                    <img src={fileUrl(g)} className="w-full aspect-square object-cover rounded-lg" />
                    <span className="absolute inset-0 rounded-lg bg-espresso-950/0 group-hover:bg-espresso-950/20 transition-colors flex items-center justify-center">
                      <Expand size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      <PhotoLightbox
        photos={lightbox?.photos}
        index={lightbox?.index}
        onClose={() => setLightbox(null)}
        onNavigate={navigateLightbox}
      />
    </div>
  )
}
