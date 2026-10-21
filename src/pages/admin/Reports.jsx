import { useEffect, useState } from 'react'
import {
  FileText, Download, Sun, CalendarMinus, CalendarDays,
  Calendar, CalendarRange, Infinity as InfinityIcon, CalendarSearch,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

const todayYMD = () => new Date().toISOString().slice(0, 10)

// Same periods as the Orders page's analytics cards, so a report always
// matches exactly what staff already see summarised there.
const PERIODS = [
  { key: 'today', label: 'Today', icon: Sun, accent: 'bg-gold-dark' },
  { key: 'yesterday', label: 'Yesterday', icon: CalendarMinus, accent: 'bg-espresso-700' },
  { key: 'week', label: 'This Week', icon: CalendarDays, accent: 'bg-espresso-700' },
  { key: 'month', label: 'This Month', icon: Calendar, accent: 'bg-espresso-700' },
  { key: 'year', label: 'This Year', icon: CalendarRange, accent: 'bg-espresso-700' },
  { key: 'lifetime', label: 'Lifetime', icon: InfinityIcon, accent: 'bg-espresso-900' },
]

export default function AdminReports() {
  const [downloadingKey, setDownloadingKey] = useState(null)
  const [customMode, setCustomMode] = useState('single') // 'single' | 'range'
  const [singleDate, setSingleDate] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  // Nothing to report before the first order ever placed, and nothing to
  // report after today - both date pickers below are bounded to that
  // real, meaningful range instead of letting staff pick an empty date.
  const [minDate, setMinDate] = useState('')
  const maxDate = todayYMD()

  useEffect(() => {
    api.get('/orders/stats').then((r) => {
      if (r.data.firstOrderDate) setMinDate(new Date(r.data.firstOrderDate).toISOString().slice(0, 10))
    }).catch(() => {})
  }, [])

  // The report comes back as a PDF file (binary), not JSON - fetch as a
  // blob and trigger a normal browser download via a throwaway link, same
  // pattern as the table QR sticker download. `key` just identifies which
  // button shows the loading state; `params` is whatever the backend
  // actually needs (period, or date, or from+to).
  const downloadReport = async (key, params, suffix) => {
    setDownloadingKey(key)
    try {
      const res = await api.get('/reports/orders', { params, responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `KCL-orders-report-${suffix}-${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('Report downloaded')
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not generate that report')
    } finally {
      setDownloadingKey(null)
    }
  }

  const downloadCustom = () => {
    if (customMode === 'single') {
      if (!singleDate) return toast.error('Pick a date first')
      downloadReport('custom', { date: singleDate }, singleDate)
    } else {
      if (!fromDate || !toDate) return toast.error('Pick both a start and end date')
      if (fromDate > toDate) return toast.error('Start date must be before end date')
      downloadReport('custom', { from: fromDate, to: toDate }, `${fromDate}_to_${toDate}`)
    }
  }

  return (
    <div>
      <h1 className="section-title">Reports</h1>
      <p className="text-espresso-500 mt-1 mb-6">
        Download a PDF report of orders and their analysis (by status, by order type, by payment method) for any period.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PERIODS.map((p) => (
          <div key={p.key} className="card p-5 flex items-center gap-4">
            <span className={`w-12 h-12 rounded-xl ${p.accent} text-cream-light flex items-center justify-center shrink-0`}>
              <p.icon size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-espresso-900">{p.label}</p>
              <p className="text-xs text-espresso-400">Orders report</p>
            </div>
            <button
              onClick={() => downloadReport(p.key, { period: p.key }, p.key)}
              disabled={downloadingKey === p.key}
              className="btn-outline !py-2 !px-3 text-sm shrink-0"
            >
              {downloadingKey === p.key ? '...' : <Download size={16} />}
            </button>
          </div>
        ))}
      </div>

      <div className="card p-5 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-12 h-12 rounded-xl bg-espresso-700 text-cream-light flex items-center justify-center shrink-0">
            <CalendarSearch size={22} />
          </span>
          <div>
            <p className="font-bold text-espresso-900">Custom Date</p>
            <p className="text-xs text-espresso-400">Pick exactly the day(s) you want, instead of a preset period.</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setCustomMode('single')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition ${customMode === 'single' ? 'border-gold bg-gold/5 text-espresso-900' : 'border-espresso-100 text-espresso-500'}`}
          >
            Single Date
          </button>
          <button
            type="button"
            onClick={() => setCustomMode('range')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition ${customMode === 'range' ? 'border-gold bg-gold/5 text-espresso-900' : 'border-espresso-100 text-espresso-500'}`}
          >
            Date Range
          </button>
        </div>

        {customMode === 'single' ? (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" min={minDate || undefined} max={maxDate} value={singleDate} onChange={(e) => setSingleDate(e.target.value)} />
            </div>
            <button onClick={downloadCustom} disabled={downloadingKey === 'custom'} className="btn-primary !py-2.5">
              <Download size={16} /> {downloadingKey === 'custom' ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="label">From</label>
              <input type="date" className="input" min={minDate || undefined} max={maxDate} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div>
              <label className="label">To</label>
              <input type="date" className="input" min={fromDate || minDate || undefined} max={maxDate} value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <button onClick={downloadCustom} disabled={downloadingKey === 'custom'} className="btn-primary !py-2.5">
              <Download size={16} /> {downloadingKey === 'custom' ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        )}
      </div>

      <div className="card p-5 mt-6 flex items-start gap-3">
        <FileText size={20} className="text-gold-dark shrink-0 mt-0.5" />
        <p className="text-sm text-espresso-500">
          Each report includes a summary (total orders, total revenue, average order value), a breakdown by
          status, by order type, and by payment method (cash, MoMo Pay, MoMo Code), and a list of the orders
          in that period - with each order's payment method shown - capped to the most recent 200 for very
          large periods, so the file stays a reasonable size.
        </p>
      </div>
    </div>
  )
}
