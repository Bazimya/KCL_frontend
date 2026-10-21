import { useEffect, useRef, useState } from 'react'
import { X, Camera, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

// Pulls a "/t/:qrToken" path out of whatever the camera decoded - the
// sticker encodes a full URL (e.g. https://kigalicoffeelab.com/t/abc123,
// or http://localhost:5173/t/abc123 in dev), but we only ever need the path
// to hand to React Router. Falls back to treating the raw text as a path
// if it isn't a full URL (e.g. a QR generated with just "/t/abc123" in it).
const extractTablePath = (decodedText) => {
  let path = decodedText
  try {
    path = new URL(decodedText).pathname
  } catch {
    // not a full URL - use the decoded text as-is
  }
  return /^\/t\/[^/?#]+$/.test(path) ? path : null
}

// A live, in-browser camera QR scanner (via html5-qrcode / the device's
// native camera, no app install needed). Used specifically for scanning a
// Kigali Coffee Lab table sticker - anything else decoded is rejected with
// a friendly message rather than silently navigating somewhere unexpected.
export default function QrScannerModal({ open, onClose, onScanned }) {
  const containerRef = useRef(null)
  const scannerRef = useRef(null)
  // Whether scanner.start() actually resolved - calling .stop() when it
  // never successfully started (no camera, permission denied, etc.) throws
  // "Cannot stop, scanner is not running or paused" instead of failing
  // quietly, which would otherwise crash this component on close.
  const runningRef = useRef(false)
  const [error, setError] = useState(null)
  const [starting, setStarting] = useState(true)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setError(null)
    setStarting(true)
    runningRef.current = false

    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (cancelled || !containerRef.current) return
      const scanner = new Html5Qrcode(containerRef.current.id, { verbose: false })
      scannerRef.current = scanner

      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          const path = extractTablePath(decodedText)
          if (!path) {
            toast.error("That doesn't look like a Kigali Coffee Lab table QR code")
            return
          }
          onScanned(path)
        },
        () => { /* per-frame "no QR found yet" - expected constantly, ignore */ }
      ).then(() => {
        if (cancelled) return
        runningRef.current = true
        setStarting(false)
      }).catch((err) => {
        if (cancelled) return
        setStarting(false)
        setError(
          String(err).toLowerCase().includes('permission')
            ? 'Camera access was denied. Please allow camera access and try again.'
            : 'Could not start the camera on this device.'
        )
      })
    })

    return () => {
      cancelled = true
      const scanner = scannerRef.current
      scannerRef.current = null
      if (scanner && runningRef.current) {
        runningRef.current = false
        scanner.stop().then(() => scanner.clear()).catch(() => {})
      }
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-espresso-950/90">
      <div className="bg-white rounded-2xl shadow-soft w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-espresso-100">
          <h3 className="font-display font-bold text-espresso-900 flex items-center gap-2">
            <Camera size={18} /> Scan Table QR Code
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-espresso-50 flex items-center justify-center text-espresso-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {error ? (
            <div className="py-6 text-center">
              <AlertTriangle size={36} className="mx-auto text-amber-500 mb-3" />
              <p className="text-sm text-espresso-600">{error}</p>
            </div>
          ) : (
            <>
              <div id="kcl-qr-scanner" ref={containerRef} className="rounded-xl overflow-hidden bg-espresso-950 aspect-square" />
              <p className="text-center text-xs text-espresso-400 mt-3">
                {starting ? 'Starting camera...' : 'Point your camera at the QR code on your table'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
