import { useEffect, useRef, useState } from 'react'

// Fades and slides content in when it scrolls into view
export function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setShow(true), io.disconnect()), { threshold: 0.15 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return <div ref={ref} style={{ transitionDelay: delay + 'ms' }} className={`transition duration-700 ease-out ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} ${className}`}>{children}</div>
}

// Returns a number that smoothly counts from its old value to the new one
export function useCountUp(target, ms = 700) {
  const [v, setV] = useState(target)
  const now = useRef(target) // the value currently shown
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { now.current = target; setV(target); return }
    const from = now.current
    const t0 = performance.now()
    let raf
    const tick = t => {
      const p = Math.min((t - t0) / ms, 1)
      now.current = from + (target - from) * (1 - Math.pow(1 - p, 3)) // ease-out
      setV(now.current)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}

// Shows a number with the count-up effect. "format" turns the number into text.
export function Num({ value, format }) {
  return <>{format(useCountUp(value))}</>
}
