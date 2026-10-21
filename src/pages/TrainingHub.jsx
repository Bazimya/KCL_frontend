import { Link } from 'react-router-dom'
import { GraduationCap, Coffee, Flame, ClipboardList, ArrowRight, Globe, Store } from 'lucide-react'

const courses = [
  { type: 'barista', title: 'Barista Training', icon: Coffee, desc: 'Grinding, extraction, milk steaming and latte art, taught right here at the lab.', global: false },
  { type: 'cupping', title: 'Cupping / Sensory', icon: ClipboardList, desc: 'Professional sensory evaluation, toward a Q Grader-style certification pathway.', global: true },
  { type: 'roasting', title: 'Roasting', icon: Flame, desc: 'From green bean to golden roast, heat control, roast profiles, and cup evaluation.', global: true },
  { type: 'cva', title: 'Coffee Value Assessment', icon: Globe, desc: 'Origin, variety, processing and traceability alongside sensory evaluation.', global: true },
]

export default function TrainingHub() {
  return (
    <div>
      <section className="bg-coffee-gradient text-cream-light py-16">
        <div className="container-app text-center max-w-2xl mx-auto">
          <span className="badge bg-gold/20 text-gold border border-gold/30 mb-4">Course</span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold">Coffee Training</h1>
          <p className="mt-4 text-cream-light/80 text-lg">
            Four paths, one craft. Pick where you want to start.
          </p>
        </div>
      </section>

      <section className="container-app py-16 grid sm:grid-cols-2 gap-6">
        {courses.map((c) => (
          <Link key={c.type} to={`/course/training/${c.type}`} className="card p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <span className="w-14 h-14 rounded-2xl bg-gold/15 text-gold-dark flex items-center justify-center">
                <c.icon size={26} />
              </span>
              <span className={`badge ${c.global ? 'bg-espresso-900 text-cream-light' : 'bg-espresso-100 text-espresso-600'} flex items-center gap-1`}>
                {c.global ? <Globe size={11} /> : <Store size={11} />}
                {c.global ? 'Global Certification' : 'Local Training'}
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-espresso-900 mt-4">{c.title}</h3>
            <p className="text-sm text-espresso-500 mt-2">{c.desc}</p>
            <span className="inline-flex items-center gap-1 text-gold-dark font-semibold text-sm mt-4">
              Learn more <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </section>
    </div>
  )
}
