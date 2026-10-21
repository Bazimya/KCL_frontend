import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { coffeeTherapy as c } from '../data/courseContent'

export default function CoffeeTherapy() {
  return (
    <div>
      <section className="bg-coffee-gradient text-cream-light py-16">
        <div className="container-app text-center max-w-2xl mx-auto">
          <span className="badge bg-gold/20 text-gold border border-gold/30 mb-4">Course</span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold">{c.title} ☕</h1>
          <p className="mt-4 text-cream-light/80 text-lg">{c.tagline}</p>
        </div>
      </section>

      <section className="container-app py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-xl font-semibold text-espresso-900 leading-relaxed">{c.intro}</p>
          <p className="mt-4 text-espresso-600 leading-relaxed">{c.body}</p>
          <div className="mt-6 space-y-3">
            {c.points.map((p, i) => (
              <div key={i} className="flex items-center gap-3 card p-3">
                <span className="text-2xl">{p.emoji}</span>
                <p className="text-espresso-700 font-medium">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2.5rem] bg-coffee-gradient aspect-square flex items-center justify-center">
          <Sparkles size={120} className="text-gold" />
        </div>
      </section>

      <section className="bg-espresso-50 py-16">
        <div className="container-app max-w-2xl text-center">
          <p className="font-display text-2xl font-bold text-espresso-900">"{c.idea}"</p>
          <p className="mt-4 text-espresso-600">{c.closing}</p>
          <Link to="/book-table" className="btn-primary mt-6 inline-flex">
            Reserve a Table <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
