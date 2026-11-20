// `onClick` makes the card an interactive filter/toggle (used by the Orders
// page's period cards); omit it anywhere else for the original plain,
// read-only summary tile (used by the Dashboard).
export default function StatCard({ icon: Icon, label, value, accent = 'bg-espresso-900', onClick, active }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`card p-5 flex items-center gap-4 text-left w-full transition ${
        onClick ? 'hover:shadow-md cursor-pointer' : ''
      } ${active ? 'ring-2 ring-gold border-gold' : ''}`}
    >
      <span className={`w-12 h-12 rounded-xl ${accent} text-cream-light flex items-center justify-center shrink-0`}>
        <Icon size={22} />
      </span>
      <div className="min-w-0">
        <p className="text-espresso-400 text-xs font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-xl font-extrabold text-espresso-900 truncate">{value}</p>
      </div>
    </Tag>
  )
}
