import { MapPin, Home, Coffee } from 'lucide-react'

// Shown at checkout the moment a customer with coffee/food in their cart
// hasn't scanned a table yet - rather than letting them self-report a
// table from a list, we make them pick one of two honest paths: scan the
// real table they're sitting at, or admit they're ordering from home.
export default function DineLocationModal({ open, onHome, onScan }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-espresso-950/60 backdrop-blur-sm animate-fadeUp">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-soft w-full sm:max-w-md overflow-hidden">
        <div className="bg-coffee-gradient text-cream-light px-6 py-6">
          <span className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-3">
            <Coffee size={24} className="text-gold" />
          </span>
          <h3 className="font-display text-xl font-bold">Where are you right now?</h3>
          <p className="text-cream-light/70 text-sm mt-1">This decides how your order gets to you.</p>
        </div>

        <div className="p-6 flex flex-col gap-3">
          <button onClick={onScan} className="flex items-start gap-3 p-4 rounded-xl border-2 border-gold bg-gold/5 text-left hover:bg-gold/10 transition">
            <MapPin size={20} className="text-gold-dark shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-espresso-900">I'm at Kigali Coffee Lab</p>
              <p className="text-xs text-espresso-500 mt-0.5">Scan the QR code on your table so we bring it straight to you.</p>
            </div>
          </button>
          <button onClick={onHome} className="flex items-start gap-3 p-4 rounded-xl border-2 border-espresso-100 text-left hover:bg-espresso-50 transition">
            <Home size={20} className="text-espresso-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-espresso-900">I'm ordering from home</p>
              <p className="text-xs text-espresso-500 mt-0.5">No table needed - collect it at the counter, or we'll call to confirm.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
