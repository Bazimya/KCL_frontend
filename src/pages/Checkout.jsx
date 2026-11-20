import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Truck, Smartphone, Hash, CheckCircle2, ArrowRight, MapPin, Armchair, Copy, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { useTable } from '../context/TableContext'
import { formatRWF } from '../utils/format'
import DineLocationModal from '../components/DineLocationModal'
import QrScannerModal from '../components/QrScannerModal'
import { rememberOrder } from '../utils/recentOrders'

export default function Checkout() {
  const { cart, total, clearCart } = useCart()
  const { settings } = useSettings()
  const { scannedTable, clearScannedTable } = useTable()
  const navigate = useNavigate()

  const hasMenuItems = cart.some((i) => i.itemType === 'menu')
  const hasMachineItems = cart.some((i) => i.itemType === 'machine')

  // Coffee/food can never be delivered - the customer either sits at a
  // table in the shop (dine_in, only once a real table has been scanned)
  // or orders ahead (e.g. from home) to collect later with no table
  // (pickup). A machine-only cart is delivery. There's no manual table
  // picker any more - scanning the table's QR code IS the only way to
  // attach one, so staff can trust it's genuinely where the customer is.
  const orderType = hasMachineItems && !hasMenuItems ? 'delivery' : scannedTable ? 'dine_in' : 'pickup'

  // Whether the customer has answered "are you at the shop or at home?"
  // yet for this checkout - sidesteps showing the location modal again the
  // instant a scan resolves (scannedTable becoming truthy counts as having
  // decided), and remembers an explicit "I'm ordering from home" too.
  const [locationDecided, setLocationDecided] = useState(!!scannedTable)
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)

  useEffect(() => {
    if (scannedTable) { setLocationDecided(true); return }
    if (hasMenuItems && !locationDecided) setLocationModalOpen(true)
  }, [hasMenuItems, scannedTable, locationDecided])

  const chooseHome = () => {
    setLocationDecided(true)
    setLocationModalOpen(false)
  }
  const chooseShop = () => {
    setLocationModalOpen(false)
    setScannerOpen(true)
  }
  const onTableScanned = (tablePath) => {
    setScannerOpen(false)
    navigate(tablePath) // TableScan.jsx resolves it and returns here with scannedTable set
  }

  const [form, setForm] = useState({ address: '', contact: '', email: '', customerName: '', notes: '' })
  const [method, setMethod] = useState(
    settings.payments?.cashEnabled ? 'Cash' : settings.payments?.momoPayEnabled ? 'MoMo Pay' : 'MoMo Code'
  )
  const [callConfirmed, setCallConfirmed] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)

  // Same fee the server adds (admin Settings -> Payment -> Delivery fee).
  const shippingFee = orderType === 'delivery' ? Number(settings.deliveryFee) || 0 : 0
  const grandTotal = total + shippingFee
  const needsProof = method === 'MoMo Pay' || method === 'MoMo Code'
  const paymentOptions = [
    settings.payments?.cashEnabled && { id: 'Cash', label: orderType === 'delivery' ? 'Cash on Delivery' : 'Cash', icon: Truck, desc: orderType === 'delivery' ? 'Pay in cash when your order arrives.' : 'Pay in cash at the counter.' },
    settings.payments?.momoPayEnabled && { id: 'MoMo Pay', label: 'MoMo Pay', icon: Smartphone, desc: `Send to ${settings.momoPayNumber}, then upload your proof.` },
    settings.payments?.momoCodeEnabled && { id: 'MoMo Code', label: 'MoMo Code', icon: Hash, desc: `Pay to merchant code ${settings.momoCode || '(not set)'}, then upload your proof.` },
  ].filter(Boolean)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submitOrder = async (e) => {
    e.preventDefault()
    if (!cart.length) return toast.error('Your cart is empty')
    if (orderType === 'dine_in' && !scannedTable) return toast.error('Please scan your table first')
    if (orderType === 'delivery' && !form.address) return toast.error('A delivery address is required')
    if (needsProof && !callConfirmed) return toast.error(`Please confirm you've sent the payment first`)

    setPlacing(true)
    try {
      const items = cart.map((i) => ({ itemType: i.itemType, itemId: i.itemId, quantity: i.qty }))
      const { data } = await api.post('/orders', {
        items,
        orderType: hasMenuItems ? (orderType === 'dine_in' ? 'dine_in' : 'pickup') : undefined,
        tableId: orderType === 'dine_in' ? scannedTable.id : undefined,
        address: orderType === 'delivery' ? form.address : undefined,
        contact: form.contact,
        email: form.email,
        notes: form.notes,
        customerName: form.customerName,
        customerPhone: form.contact,
        paymentMethod: method,
        callConfirmed,
      })
      clearCart()
      clearScannedTable()
      // TrackOrder.jsx picks this up on mount so "See My Order" lands
      // straight on this order's live status, no re-typing the code.
      localStorage.setItem('kcl_last_order_code', data.order.orderCode)
      rememberOrder(data.order)
      setPlacedOrder(data.order)
      toast.success('Order placed! ☕')
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not place order')
    } finally {
      setPlacing(false)
    }
  }

  // The success screen replaces a long form - start it at the top so the
  // order number is the first thing the customer sees.
  useEffect(() => {
    if (placedOrder) window.scrollTo({ top: 0, behavior: 'auto' })
  }, [placedOrder])

  if (placedOrder) {
    return <ProofUploadStep order={placedOrder} needsProof={needsProof} onDone={() => navigate('/track')} />
  }

  if (!cart.length) {
    return (
      <div className="container-app py-24 text-center">
        <h2 className="section-title">Nothing to check out yet</h2>
        <Link to="/coffee" className="btn-primary mt-6 inline-flex">Browse the menu <ArrowRight size={16} /></Link>
      </div>
    )
  }

  return (
    <div className="container-app py-10 max-w-3xl">
      <h1 className="section-title mb-8">Checkout</h1>

      <form onSubmit={submitOrder} className="space-y-8">
        <div className="card p-6">
          <h3 className="font-display font-bold text-lg mb-4">Your Details <span className="text-espresso-400 font-normal text-sm">(optional)</span></h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input name="customerName" className="input" placeholder="e.g. Aimable" value={form.customerName} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input name="contact" className="input" placeholder="07xx xxx xxx" value={form.contact} onChange={handleChange} />
            </div>
          </div>
        </div>

        {hasMenuItems && scannedTable && (
          // Scanning IS the table selection - nothing else to show here.
          <div className="card p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center shrink-0">
                <Armchair size={18} />
              </span>
              <div>
                <p className="text-xs text-espresso-500 font-semibold">Ordering at</p>
                <p className="font-bold text-espresso-900">{scannedTable.label}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { clearScannedTable(); setLocationDecided(false) }}
              className="text-xs font-semibold text-espresso-500 hover:text-espresso-900 underline"
            >
              Not your table?
            </button>
          </div>
        )}

        {hasMenuItems && !scannedTable && locationDecided && (
          <div className="card p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-espresso-100 text-espresso-600 flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </span>
              <div>
                <p className="text-xs text-espresso-500 font-semibold">Ordering from</p>
                <p className="font-bold text-espresso-900">Home (pickup)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLocationModalOpen(true)}
              className="text-xs font-semibold text-espresso-500 hover:text-espresso-900 underline"
            >
              Actually, I'm at the shop
            </button>
          </div>
        )}

        {orderType === 'delivery' && (
          <div className="card p-6">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><MapPin size={18} /> Delivery Address</h3>
            <textarea name="address" className="input" rows={2} placeholder="e.g. KG 11 Ave, Kimihurura, Kigali" value={form.address} onChange={handleChange} />
          </div>
        )}

        <div className="card p-6">
          <h3 className="font-display font-bold text-lg mb-4">Payment Method</h3>
          <div className="space-y-3">
            {paymentOptions.map((opt) => (
              <label key={opt.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${method === opt.id ? 'border-gold bg-gold/5' : 'border-espresso-100'}`}>
                <input type="radio" name="method" className="mt-1 accent-espresso-800" checked={method === opt.id} onChange={() => setMethod(opt.id)} />
                <opt.icon size={20} className="text-espresso-700 mt-0.5" />
                <div>
                  <p className="font-semibold text-espresso-900">{opt.label}</p>
                  <p className="text-sm text-espresso-500">{opt.desc}</p>
                </div>
              </label>
            ))}
            {paymentOptions.length === 0 && (
              <p className="text-sm text-espresso-400 italic">No payment methods are enabled yet. Ask an admin to enable one in Settings.</p>
            )}
          </div>

          {needsProof && (
            <div className="mt-5 p-4 rounded-xl bg-gold/10 border border-gold/30">
              <p className="font-semibold text-espresso-800 mb-2">
                {method === 'MoMo Pay' ? 'MoMo Pay Details' : 'MoMo Code Details'}
              </p>
              <div className="bg-white rounded-lg p-3 border border-espresso-100 inline-block">
                <p className="text-espresso-400 text-xs">{method === 'MoMo Pay' ? 'MoMo Pay Number' : 'Merchant Code'}</p>
                <p className="font-bold text-espresso-900 text-base">
                  {method === 'MoMo Pay' ? settings.momoPayNumber : settings.momoCode}
                </p>
              </div>
              <p className="text-sm text-espresso-500 mt-3">
                After you've paid, you'll be able to upload a screenshot or photo as proof of payment on the next screen.
              </p>
              <label className="flex items-center gap-2 mt-3 text-sm font-semibold text-espresso-800">
                <input type="checkbox" className="accent-espresso-800 w-4 h-4" checked={callConfirmed} onChange={(e) => setCallConfirmed(e.target.checked)} />
                I confirm I have sent / will send the payment for this order
              </label>
            </div>
          )}
        </div>

        <div className="card p-6 space-y-2">
          <div className="flex items-center justify-between text-espresso-600">
            <span>Subtotal</span><span>{formatRWF(total)}</span>
          </div>
          {orderType === 'delivery' && (
            <div className="flex items-center justify-between text-espresso-600">
              <span>Delivery fee</span><span>{shippingFee > 0 ? formatRWF(shippingFee) : 'Free'}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-espresso-100">
            <span className="font-bold text-espresso-900">Order Total</span>
            <span className="text-2xl font-extrabold text-espresso-900">{formatRWF(grandTotal)}</span>
          </div>
        </div>

        <button disabled={placing} className="btn-primary w-full !py-3.5 text-base">
          {placing ? 'Placing order...' : 'Place Order'} <ArrowRight size={18} />
        </button>
        <p className="text-xs text-espresso-400 text-center -mt-4">No account needed. You'll get an order ID to track it.</p>
      </form>

      <DineLocationModal open={locationModalOpen} onHome={chooseHome} onScan={chooseShop} />
      <QrScannerModal open={scannerOpen} onClose={() => { setScannerOpen(false); setLocationModalOpen(true) }} onScanned={onTableScanned} />
    </div>
  )
}

function ProofUploadStep({ order, needsProof, onDone }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(!needsProof)

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(order.orderCode)
      toast.success('Order number copied')
    } catch {
      toast('Please write the number down or take a screenshot', { icon: '📝' })
    }
  }

  const upload = async () => {
    if (!file) return toast.error('Please choose an image first')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('proof', file)
      await api.post(`/orders/track/${order.orderCode}/proof`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Proof of payment uploaded! We will confirm shortly.')
      setDone(true)
    } catch {
      toast.error('Upload failed, please try again')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container-app py-16 max-w-xl text-center">
      <CheckCircle2 size={56} className="mx-auto text-green-600 mb-4" />
      <h1 className="section-title">Order placed successfully!</h1>

      <div className="card p-5 mt-6 border-2 border-gold">
        <p className="text-xs font-bold uppercase tracking-wider text-espresso-500">Your order number</p>
        <p className="font-mono text-3xl font-extrabold text-espresso-900 mt-1 select-all">{order.orderCode}</p>
        <button type="button" onClick={copyCode} className="btn-outline !py-2 !px-4 text-sm mt-3">
          <Copy size={15} /> Copy number
        </button>
        <div className="flex items-start gap-2 text-left bg-gold/10 rounded-xl p-3 mt-4">
          <AlertTriangle size={18} className="text-gold-dark shrink-0 mt-0.5" />
          <p className="text-sm text-espresso-700">
            <strong>Keep this number safe.</strong> Take a screenshot or write it down: it's the only way to
            track your order, since no account is needed. Staff may also ask for it when you collect.
            It's also saved on this phone under <strong>Track My Order</strong>.
          </p>
        </div>
      </div>

      {!done ? (
        <div className="card p-6 mt-8 text-left">
          <h3 className="font-display font-bold text-lg mb-2">Upload Proof of Payment</h3>
          <p className="text-sm text-espresso-500 mb-4">
            After paying, attach a screenshot or photo of your payment confirmation.
          </p>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="input" />
          <button onClick={upload} disabled={uploading} className="btn-primary w-full mt-4">
            {uploading ? 'Uploading...' : 'Upload Proof'}
          </button>
          <button onClick={onDone} className="btn-ghost w-full mt-2 text-sm">I'll do this later, track my order</button>
        </div>
      ) : (
        <button onClick={onDone} className="btn-primary mt-8">See My Order</button>
      )}
    </div>
  )
}
