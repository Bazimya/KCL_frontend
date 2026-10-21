import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Users, Globe, Store, Award } from 'lucide-react'
import api from '../api/axios'
import Loader from '../components/Loader'
import useCountdown from '../hooks/useCountdown'
import { trainingCourses, courseLevels } from '../data/courseContent'
import { formatDate } from '../utils/format'

function SessionCountdown({ session }) {
  const countdown = useCountdown(session?.endDate)
  if (!session) {
    return (
      <div className="card p-5 bg-espresso-50 border-espresso-100 text-center">
        <p className="text-sm text-espresso-500">No open cohort right now for this track. Check back soon.</p>
      </div>
    )
  }
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="font-bold text-espresso-900">{session.title}</p>
          {(session.startDate || session.endDate) && (
            <p className="text-xs text-espresso-400 mt-0.5">
              {session.startDate && `Starts ${formatDate(session.startDate)}`}
              {session.startDate && session.endDate && ' · '}
              {session.endDate && `Applications close ${formatDate(session.endDate)}`}
            </p>
          )}
        </div>
        <span className="badge bg-green-100 text-green-700 flex items-center gap-1">
          <Users size={11} /> {session.seatsLeft} seat{session.seatsLeft === 1 ? '' : 's'} left
        </span>
      </div>
      {session.description && <p className="text-sm text-espresso-600 mt-3">{session.description}</p>}

      {countdown && !countdown.expired && (
        <div className="mt-4 p-3 rounded-xl bg-gold/10 border border-gold/30 flex items-center gap-3">
          <Clock size={20} className="text-gold-dark shrink-0" />
          <div>
            <p className="text-xs text-espresso-500 font-semibold">Applications close in</p>
            <p className="font-mono font-extrabold text-lg text-espresso-900">{countdown.label}</p>
          </div>
        </div>
      )}

      <Link
        to={`/course/training/apply?sessionId=${session._id}`}
        className="btn-primary w-full mt-4 justify-center"
      >
        Apply Now <ArrowRight size={16} />
      </Link>
    </div>
  )
}

export default function TrainingCourseDetail() {
  const { courseType } = useParams()
  const content = trainingCourses[courseType]
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeLevel, setActiveLevel] = useState(courseLevels[0])

  useEffect(() => {
    api.get('/training/active-sessions').then((r) => setSessions(r.data)).finally(() => setLoading(false))
  }, [])

  if (!content) return <Navigate to="/course/training" replace />

  const courseSessions = sessions.filter((s) => s.courseType === courseType)
  const sessionForLevel = (level) => courseSessions.find((s) => s.level === level)
  const localSession = courseSessions[0]

  return (
    <div>
      <section className="bg-coffee-gradient text-cream-light py-14">
        <div className="container-app">
          <Link to="/course/training" className="inline-flex items-center gap-1 text-cream-light/70 hover:text-cream-light text-sm font-semibold mb-4">
            <ChevronLeft size={16} /> Back to Coffee Training
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl md:text-4xl font-extrabold">{content.title}</h1>
            <span className={`badge ${content.isGlobalCertificate ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-white/10 text-cream-light border border-white/20'} flex items-center gap-1`}>
              {content.isGlobalCertificate ? <Globe size={12} /> : <Store size={12} />}
              {content.isGlobalCertificate ? 'Global Certification' : 'Local Training'}
            </span>
          </div>
          <p className="mt-3 text-cream-light/80 max-w-2xl">{content.certNote}</p>
        </div>
      </section>

      <section className="container-app py-14 grid md:grid-cols-5 gap-10">
        <div className="md:col-span-3">
          <p className="text-xl font-semibold text-espresso-900 leading-relaxed">{content.intro}</p>
          {content.body && <p className="mt-4 text-espresso-600 leading-relaxed">{content.body}</p>}

          {content.points && (
            <div className="mt-6 space-y-3">
              {content.points.map((p, i) => (
                <div key={i} className="flex items-start gap-3 card p-3">
                  <span className="text-xl shrink-0">{p.emoji}</span>
                  <p className="text-espresso-700 font-medium">{p.text}</p>
                </div>
              ))}
            </div>
          )}

          {content.levelsTable && (
            <div className="mt-6 card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-espresso-50 text-espresso-500 text-xs uppercase">
                  <tr><th className="text-left px-4 py-3">Level</th><th className="text-left px-4 py-3">What visitors learn</th></tr>
                </thead>
                <tbody>
                  {content.levelsTable.map((row, i) => (
                    <tr key={i} className="border-t border-espresso-100">
                      <td className="px-4 py-3 font-semibold text-espresso-800 whitespace-nowrap">{row.level}</td>
                      <td className="px-4 py-3 text-espresso-600">{row.learn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {content.journey && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {content.journey.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="badge bg-espresso-900 text-cream-light">{step}</span>
                  {i < content.journey.length - 1 && <ChevronRight size={14} className="text-espresso-300" />}
                </div>
              ))}
            </div>
          )}

          {content.idea && (
            <div className="mt-8 p-5 rounded-xl bg-espresso-50 border border-espresso-100">
              <p className="font-display text-lg font-bold text-espresso-900">{content.idea}</p>
            </div>
          )}
          {content.closing && <p className="mt-4 text-espresso-600">{content.closing}</p>}
        </div>

        {/* Sessions / apply panel */}
        <div className="md:col-span-2">
          <h3 className="font-display font-bold text-lg text-espresso-900 mb-3 flex items-center gap-2">
            <Award size={18} className="text-gold-dark" /> {content.isGlobalCertificate ? 'Certification Cohorts' : 'Open Cohort'}
          </h3>

          {loading ? <Loader /> : content.isGlobalCertificate ? (
            <div>
              <div className="flex gap-2 mb-4">
                {courseLevels.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setActiveLevel(lvl)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                      activeLevel === lvl ? 'bg-espresso-900 text-cream-light' : 'bg-espresso-100 text-espresso-600'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <SessionCountdown session={sessionForLevel(activeLevel)} />
            </div>
          ) : (
            <SessionCountdown session={localSession} />
          )}
        </div>
      </section>
    </div>
  )
}
