import { Link } from 'react-router-dom'
import { ArrowRight, Mountain, ChevronRight } from 'lucide-react'
import { coffeeExperience as c } from '../data/courseContent'

export default function CoffeeExperience() {
  return (
    <div>
      <section className="bg-coffee-gradient text-cream-light py-16">
        <div className="container-app text-center max-w-2xl mx-auto">
          <span className="badge bg-gold/20 text-gold border border-gold/30 mb-4">Course</span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold">{c.title} ☕</h1>
          <p className="mt-4 text-cream-light/80 text-lg">{c.tagline}</p>
        </div>
      </section>

      <section className="container-app py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center mb-14">
          <div>
            <p className="text-xl font-semibold text-espresso-900 leading-relaxed">{c.intro}</p>
            <p className="mt-4 text-espresso-600 leading-relaxed">{c.body}</p>
          </div>
          <div className="rounded-[2.5rem] bg-coffee-gradient aspect-square flex items-center justify-center">
            <Mountain size={120} className="text-gold" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {c.points.map((p, i) => (
            <div key={i} className="card p-5">
              <span className="text-3xl">{p.emoji}</span>
              <h3 className="font-bold text-espresso-900 mt-2">{p.title}</h3>
              <p className="text-sm text-espresso-500 mt-1">{p.text}</p>
            </div>
          ))}
        </div>

        {/* Journey strip */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-2">
          {c.journey.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="badge bg-espresso-900 text-cream-light">{step}</span>
              {i < c.journey.length - 1 && <ChevronRight size={16} className="text-espresso-300" />}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-espresso-50 py-16">
        <div className="container-app max-w-2xl text-center">
          <p className="font-display text-2xl font-bold text-espresso-900">"{c.idea}"</p>
          <Link to="/book-table" className="btn-primary mt-6 inline-flex">
            Plan Your Visit <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
