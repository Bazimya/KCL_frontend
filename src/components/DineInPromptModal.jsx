import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { QrCode, X, Clock, Hash, ArrowRight, Camera } from 'lucide-react'
import { useDineInPrompt } from '../context/DineInPromptContext'
import { stagesFor } from '../utils/orderStages'
import EtaCountdown from './EtaCountdown'
import QrScannerModal from './QrScannerModal'

export default function DineInPromptModal() {
  const { open, mode, order, close, snooze } = useDineInPrompt()
  const [scannerOpen, setScannerOpen] = useState(false)
  const navigate = useNavigate()
  if (!open) return null

  const steps = order ? stagesFor(order.orderType) : []
  const doneIndex = order ? steps.indexOf(order.orderStatus) : -1
  const showCountdown = order?.orderStatus === 'Preparing' && order?.etaMinutes && order?.etaSetAt

  const handleScanned = (tablePath) => {
    setScannerOpen(false)
    close()
    navigate(tablePath)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-espresso-950/60 backdrop-blur-sm animate-fadeUp" onClick={close}>
        <div
          className="bg-white rounded-t-3xl sm:rounded-2xl shadow-soft w-full sm:max-w-md max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-coffee-gradient text-cream-light rounded-t-3xl sm:rounded-t-2xl px-6 py-6 relative">
            <button onClick={close} className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
              <X size={16} />
            </button>
            {mode === 'scan' ? (
              <>
                <span className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-3">
                  <QrCode size={24} className="text-gold" />
                </span>
                <h3 className="font-display text-xl font-bold">At Kigali Coffee Lab right now?</h3>
                <p className="text-cream-light/70 text-sm mt-1">Scan your table's QR code so we know to serve you.</p>
              </>
            ) : (
              <>
                <span className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-3">
                  <Clock size={24} className="text-gold" />
                </span>
                <h3 className="font-display text-xl font-bold">Your order is on its way</h3>
                <p className="text-cream-light/70 text-sm mt-1 flex items-center gap-1">
                  <Hash size={13} /> {order.orderCode}
                </p>
              </>
            )}
          </div>

          <div className="p-6">
            {mode === 'scan' ? (
              <>
                <p className="text-espresso-600 text-sm leading-relaxed">
                  Look for the QR code sticker on your table and scan it with your phone's camera.
                  Everything you order will come straight to that table, and nobody else can
                  order there until you're served.
                </p>
                <div className="flex flex-col gap-2 mt-5">
                  <button onClick={() => setScannerOpen(true)} className="btn-primary w-full justify-center">
                    <Camera size={18} /> Scan QR Code Now
                  </button>
                  <Link to="/book-table" onClick={close} className="btn-outline w-full justify-center">
                    Reserve a table instead <ArrowRight size={16} />
                  </Link>
                  <button onClick={snooze} className="text-sm font-semibold text-espresso-400 hover:text-espresso-600 mt-1">
                    Not now
                  </button>
                </div>
              </>
            ) : (
              <>
                {showCountdown && <EtaCountdown etaSetAt={order.etaSetAt} etaMinutes={order.etaMinutes} />}

                <div className="space-y-0 mt-5">
                  {steps.map((label, index) => {
                    const done = index <= doneIndex
                    const isLast = index === steps.length - 1
                    return (
                      <div key={label} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${done ? 'bg-espresso-900 text-cream-light' : 'bg-espresso-100 text-espresso-400'}`}>
                            {done ? '✓' : index + 1}
                          </div>
                          {!isLast && <div className={`w-0.5 flex-1 min-h-[20px] ${done ? 'bg-espresso-900' : 'bg-espresso-100'}`} />}
                        </div>
                        <p className={`text-sm font-semibold pb-4 ${done ? 'text-espresso-900' : 'text-espresso-400'}`}>{label}</p>
                      </div>
                    )
                  })}
                </div>

                <Link to="/track" onClick={close} className="btn-primary w-full justify-center mt-2">
                  View Full Tracking <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <QrScannerModal open={scannerOpen} onClose={() => setScannerOpen(false)} onScanned={handleScanned} />
    </>
  )
}
