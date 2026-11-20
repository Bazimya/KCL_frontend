// `onClick` makes the card an interactive filter/toggle (used by the Orders
// page's period cards); omit it anywhere else for a plain, read-only summary
// tile (used by the Dashboard). Icon + label sit on one row and the value gets
// the full card width underneath, so long labels and big RWF amounts wrap
// instead of spilling out of the card or being cut off with "...".
export default function StatCard({ icon: Icon, label, value, hint, accent = 'bg-espresso-900', onClick, active }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`card p-4 sm:p-5 flex flex-col gap-3 text-left w-full min-w-0 transition ${
        onClick ? 'hover:shadow-md cursor-pointer' : ''
      } ${active ? 'ring-2 ring-gold border-gold' : ''}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`w-9 h-9 rounded-lg ${accent} text-cream-light flex items-center justify-center shrink-0`}>
          <Icon size={18} />
        </span>
        <p className="text-espresso-500 text-xs sm:text-sm font-semibold leading-tight">{label}</p>
      </div>
      <div className="min-w-0">
        <p className="text-xl sm:text-2xl font-extrabold text-espresso-900 leading-tight [overflow-wrap:anywhere]">{value}</p>
        {hint && <p className="text-xs text-espresso-400 mt-1 leading-snug">{hint}</p>}
      </div>
    </Tag>
  )
}
