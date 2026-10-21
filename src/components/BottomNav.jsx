import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutGrid, Coffee, Cpu, Sparkles, Grid3x3, X,
  UtensilsCrossed, BookOpen, Search, CalendarClock,
} from 'lucide-react'

// Default 4 + "More": the things a customer actually comes here to do most
// often, plus an expandable button (mirrors the admin panel's own overflow
// pattern) for everything else, so the bar never gets crowded.
const primary = [
  { to: '/', label: 'Menu', icon: LayoutGrid, end: true },
  { to: '/coffee', label: 'Coffee', icon: Coffee },
  { to: '/course', label: 'Course', icon: Sparkles },
  { to: '/shop', label: 'Machine', icon: Cpu },
]

const overflow = [
  { to: '/food', label: 'Food', icon: UtensilsCrossed },
  { to: '/history', label: 'History', icon: BookOpen },
  { to: '/track', label: 'Track Order', icon: Search },
  { to: '/book-table', label: 'Reserve Table', icon: CalendarClock },
]

// A persistent, mobile-app-style bottom tab bar for the things a customer
// actually comes here to do. Shown only on small/phone-sized viewports
// (`lg:hidden`) - on desktop the same destinations live in the top Navbar.
export default function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-espresso-900/95 backdrop-blur border-t border-espresso-800 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-lg mx-auto grid grid-cols-5">
          {primary.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMoreOpen(false)}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
                  isActive ? 'text-gold' : 'text-cream-light/60 hover:text-cream-light'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-gold/15' : ''}`}>
                    <Icon size={19} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${moreOpen ? 'text-gold' : 'text-cream-light/60'}`}
          >
            <span className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${moreOpen ? 'bg-gold/15' : ''}`}>
              {moreOpen ? <X size={19} /> : <Grid3x3 size={19} />}
            </span>
            More
          </button>
        </div>
      </nav>

      {/* Overflow items animate upward from the "More" button when opened.
          Anchored above the AdminFab button (also bottom-20 right-4) so the
          two never overlap. */}
      <div className={`lg:hidden fixed bottom-36 right-3 z-40 flex flex-col items-end gap-2 ${moreOpen ? '' : 'pointer-events-none'}`}>
        {[...overflow].reverse().map((i, idx) => (
          <NavLink
            key={i.to}
            to={i.to}
            onClick={() => setMoreOpen(false)}
            className="flex items-center gap-2 bg-espresso-900 text-cream-light pl-4 pr-3 py-2.5 rounded-full shadow-soft text-sm font-semibold transition-all duration-300 ease-out"
            style={{
              opacity: moreOpen ? 1 : 0,
              transform: moreOpen ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.9)',
              transitionDelay: moreOpen ? `${idx * 45}ms` : '0ms',
            }}
          >
            {i.label} <i.icon size={16} />
          </NavLink>
        ))}
      </div>
    </>
  )
}
