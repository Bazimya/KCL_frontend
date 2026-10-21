import { useEffect, useRef } from 'react'

// Fires `onEnter` the first time the referenced element scrolls into view,
// then stops observing - used to nudge the dine-in QR prompt exactly once
// per page load as the customer scrolls into a coffee/food section.
export default function useInViewOnce(onEnter, { threshold = 0.3 } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onEnter()
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onEnter, threshold])

  return ref
}
