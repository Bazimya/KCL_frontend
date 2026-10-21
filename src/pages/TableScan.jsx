import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Armchair, AlertTriangle, ArrowRight, Clock, XCircle, Coffee, CalendarClock, ShieldAlert } from 'lucide-react'
import api from '../api/axios'
import Loader from '../components/Loader'
import { useTable } from '../context/TableContext'
import { useCart } from '../context/CartContext'
import useCountdown from '../hooks/useCountdown'
import { formatDateTimeFull } from '../utils/format'

// What a phone camera lands on after scanning the sticker on a table. This
// is the one place that decides, for THIS table, whether the customer:
//  - resumes tracking an order that's already in progress here (blocked
//    from starting a new one until it's Served/Cancelled), or
//  - has walked up within 30 minutes of a reservation (or during one) and
//    is blocked from ordering here at all, or
//  - gets warned a reservation starts within the hour but can still order, or
//  - just starts ordering, with this table silently attached.
export default function TableScan() {
  const { qrToken } = useParams()
  const navigate = useNavigate()
  const { setScannedTable } = useTable()
  const { cart } = useCart()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/tables/scan/${qrToken}`)
      .then((r) => setData(r.data))
      .catch((err) => setError(err.response?.data?.msg || 'This table QR code is not recognised.'))
      .finally(() => setLoading(false))
  }, [qrToken])

  const startOrdering = () => {
    setScannedTable({ id: data.table._id, label: data.table.label, qrToken })
    // Scanning mid-checkout (cart already has items) should return the
    // customer right back to finishing their order, not send them off to
    // browse the menu again.
    navigate(cart.length > 0 ? '/checkout' : '/coffee')
  }

  const trackExistingOrder = () => {
    localStorage.setItem('kcl_last_order_code', data.activeOrder.orderCode)
    navigate('/track')
  }

  const booking = data?.upcomingBooking
  const countdown = useCountdown(booking && !booking.isNow ? booking.startTime : null)

  if (loading) return <Loader label="Finding your table..." />

  if (error) {
    return (
      <div className="container-app py-24 max-w-md text-center">
        <XCircle size={56} className="mx-auto text-red-400 mb-4" />
        <h1 className="section-title">Table Not Found</h1>
        <p className="text-espresso-500 mt-3">{error}</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">Back to Home</Link>
      </div>
    )
  }

  const { table, activeOrder } = data

  return (
    <div className="container-app py-14 max-w-lg">
      <div className="text-center mb-8">
        <span className="w-16 h-16 rounded-full bg-gold/15 text-gold-dark flex items-center justify-center mx-auto mb-4">
          <Armchair size={30} />
        </span>
        <h1 className="section-title">{table.label}</h1>
        <p className="text-espresso-500 mt-1">Welcome to Kigali Coffee Lab</p>
      </div>

      {activeOrder ? (
        <div className="card p-6 text-center">
          <AlertTriangle size={32} className="mx-auto text-amber-500 mb-3" />
          <p className="font-bold text-espresso-900">This table already has an order in progress</p>
          <p className="text-sm text-espresso-500 mt-2">
            Order <span className="font-mono font-semibold">{activeOrder.orderCode}</span> is currently{' '}
            <span className="font-semibold">{activeOrder.orderStatus}</span>. Please wait until it's served
            before starting a new order here.
          </p>
          <button onClick={trackExistingOrder} className="btn-primary mt-5 w-full">
            Track This Order <ArrowRight size={18} />
          </button>
        </div>
      ) : booking?.blocked ? (
        // Within 30 minutes of a reservation, or it's already underway -
        // this table simply can't take a new order right now.
        <div className="space-y-4">
          <div className="card p-6 text-center border-red-200">
            <span className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={28} />
            </span>
            <p className="font-bold text-espresso-900 text-lg">
              {booking.isNow ? 'This table is reserved right now' : 'This table is about to be reserved'}
            </p>
            <p className="text-sm text-espresso-500 mt-2 leading-relaxed">
              Reserved for <span className="font-semibold text-espresso-700">{booking.customerName}</span>,
              party of {booking.partySize}, at {formatDateTimeFull(booking.startTime)}.
            </p>

            {!booking.isNow && countdown && !countdown.expired && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 inline-flex flex-col items-center">
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Table reserved in</p>
                <p className="font-mono font-extrabold text-2xl text-red-600 mt-0.5">{countdown.label}</p>
              </div>
            )}

            <p className="text-sm text-espresso-500 mt-4">
              Please choose a different table, or speak with a staff member for help.
            </p>
          </div>
          <Link to="/book-table" className="btn-outline w-full justify-center">
            Reserve a Table for Later <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {booking && (
            <div className="card p-5 bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3">
                <CalendarClock size={22} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-amber-900">This table is reserved soon</p>
                  <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                    Reserved for {booking.customerName}, party of {booking.partySize}, at{' '}
                    {formatDateTimeFull(booking.startTime)}. You're welcome to order now - just know you may
                    need to wrap up before then.
                  </p>
                  {countdown && !countdown.expired && (
                    <p className="text-sm font-semibold text-amber-800 mt-2">
                      Time until reserved: <span className="font-mono">{countdown.label}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="card p-6 text-center">
            <Coffee size={32} className="mx-auto text-gold-dark mb-3" />
            <p className="font-bold text-espresso-900">You're ordering at {table.label}</p>
            <p className="text-sm text-espresso-500 mt-2">
              Everything you order will be brought straight to this table.
            </p>
            <button onClick={startOrdering} className="btn-primary mt-5 w-full">
              Start Ordering <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
