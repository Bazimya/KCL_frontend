import { Link } from 'react-router-dom'
import { Coffee, Mountain, GraduationCap, ArrowRight } from 'lucide-react'

const cards = [
  { to: '/course/therapy', title: 'Coffee Therapy', desc: 'Bring your own coffee, your friends, and your creativity.', icon: Coffee },
  { to: '/course/experience', title: 'Coffee Experience', desc: 'A journey from the coffee farm to your cup.', icon: Mountain },
  { to: '/course/training', title: 'Coffee Training', desc: 'Barista, Cupping, Roasting and CVA, local and global certification paths.', icon: GraduationCap },
]

export default function CourseHub() {
  return (
    <div>
      <section className="bg-coffee-gradient text-cream-light py-16">
        <div className="container-app text-center max-w-2xl mx-auto">
          <span className="badge bg-gold/20 text-gold border border-gold/30 mb-4">Course</span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold">Live It, Learn It, Love It</h1>
          <p className="mt-4 text-cream-light/80 text-lg">Three ways to go deeper with coffee at Kigali Coffee Lab.</p>
        </div>
      </section>

      <section className="container-app py-16 grid sm:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <Link
            key={c.to}
            to={c.to}
            className="card p-6 opacity-0 animate-fadeUp hover:shadow-xl transition-shadow duration-300"
            style={{ animationDelay: `${i * 120}ms`, animationFillMode: 'forwards' }}
          >
            <span className="w-14 h-14 rounded-2xl bg-gold/15 text-gold-dark flex items-center justify-center">
              <c.icon size={26} />
            </span>
            <h3 className="font-display text-xl font-bold text-espresso-900 mt-4">{c.title}</h3>
            <p className="text-sm text-espresso-500 mt-2">{c.desc}</p>
            <span className="inline-flex items-center gap-1 text-gold-dark font-semibold text-sm mt-4">
              Explore <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </section>
    </div>
  )
}
