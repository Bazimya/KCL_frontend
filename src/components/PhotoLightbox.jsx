import { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { fileUrl } from '../api/axios'

// A full-screen photo viewer - click any photo (cover or gallery) and
// browse every photo in that set at will, not just a static thumbnail
// grid. `photos` is the full ordered list; `index` is which one is open
// right now (null/undefined = closed).
export default function PhotoLightbox({ photos, index, onClose, onNavigate }) {
  const open = index != null && photos?.length > 0
  const hasMultiple = photos?.length > 1

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasMultiple) onNavigate(-1)
      if (e.key === 'ArrowRight' && hasMultiple) onNavigate(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, hasMultiple, onClose, onNavigate])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] bg-espresso-950/95 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-cream-light flex items-center justify-center" aria-label="Close">
        <X size={20} />
      </button>

      {hasMultiple && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(-1) }}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-cream-light flex items-center justify-center"
          aria-label="Previous photo"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      <img
        src={fileUrl(photos[index])}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[92vw] object-contain rounded-xl shadow-soft"
      />

      {hasMultiple && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(1) }}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-cream-light flex items-center justify-center"
          aria-label="Next photo"
        >
          <ChevronRight size={22} />
        </button>
      )}

      {hasMultiple && (
        <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-cream-light/80 text-sm font-semibold bg-white/10 px-3 py-1 rounded-full">
          {index + 1} / {photos.length}
        </span>
      )}
    </div>
  )
}
