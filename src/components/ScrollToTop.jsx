import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// A fresh page load always starts scrolled to the top - but a single-page
// app's client-side navigation doesn't do that by default (the browser
// just keeps wherever the previous page had scrolled to). This makes every
// route change behave like a real new page: scrolled to top, every time.
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
