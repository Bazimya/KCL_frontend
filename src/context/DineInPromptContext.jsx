import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../api/axios'
import { useTable } from './TableContext'
import { LAST_ORDER_CODE_KEY, isOrderActive } from '../utils/orderStages'

const DineInPromptContext = createContext(null)

// How long "Not now" keeps the scan-prompt from reappearing. Only applies
// to the "please scan" prompt, never to the live order-tracking one (a
// customer dismissing a nudge to scan shouldn't also hide their own order's
// status later) - and it's moot the moment they actually scan a table,
// since trigger() already skips entirely once scannedTable is set.
const SNOOZE_MS = 30 * 60 * 1000 // 30 minutes
const SNOOZE_KEY = 'kcl_dinein_prompt_snooze_until'

// Coffee and food are "taken at a table" - everywhere a customer reaches
// that menu (the Home page's Coffee/Food sections, or the dedicated /coffee
// and /food pages), we nudge them to scan their table's QR code so the shop
// knows to serve them, UNLESS they already have an order in progress
// (scanned or not), in which case we show its live tracking instead.
// Machines, Coffee Training, and everything else never calls trigger().
export const DineInPromptProvider = ({ children }) => {
  const { scannedTable } = useTable()
  const { pathname } = useLocation()
  const [state, setState] = useState({ open: false, mode: 'scan', order: null })
  const checking = useRef(false)
  // Home has both a Coffee and a Food section that can each call trigger()
  // on the same visit (one on mount, since Coffee is the first thing on the
  // page; one on scrolling into Food) - only the first one on any given
  // page should actually open the modal. Navigating to a new page (a new
  // pathname) resets this, so landing on /coffee after /food still prompts.
  const shownForPath = useRef(false)
  useEffect(() => { shownForPath.current = false }, [pathname])

  const trigger = useCallback(async () => {
    if (checking.current || shownForPath.current) return
    // Already mid-order at a scanned table - nothing to nudge them about.
    if (scannedTable) return

    checking.current = true
    try {
      const code = localStorage.getItem(LAST_ORDER_CODE_KEY)
      if (code) {
        try {
          const { data } = await api.get(`/orders/track/${code}`)
          if (isOrderActive(data)) {
            setState({ open: true, mode: 'tracking', order: data })
            shownForPath.current = true
            return
          }
        } catch { /* order not found / expired - fall through to the scan prompt */ }
      }
      // Only the "please scan" prompt respects the snooze - a live order to
      // track (handled above) always gets through.
      const snoozeUntil = Number(localStorage.getItem(SNOOZE_KEY) || 0)
      if (Date.now() < snoozeUntil) return
      setState({ open: true, mode: 'scan', order: null })
      shownForPath.current = true
    } finally {
      checking.current = false
    }
  }, [scannedTable])

  const close = useCallback(() => setState((s) => ({ ...s, open: false })), [])

  // "Not now" - dismiss AND snooze for a while, rather than just closing
  // for this one page visit.
  const snooze = useCallback(() => {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS))
    setState((s) => ({ ...s, open: false }))
  }, [])

  return (
    <DineInPromptContext.Provider value={{ ...state, trigger, close, snooze }}>
      {children}
    </DineInPromptContext.Provider>
  )
}

export const useDineInPrompt = () => useContext(DineInPromptContext)
export default DineInPromptContext
