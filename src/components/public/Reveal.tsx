'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  className?: string
  delayMs?: number
}

// Fades + slides content up the first time it scrolls into view. The
// motion-reduce override below forces the final (visible, untranslated)
// state via CSS regardless of JS/IntersectionObserver state, so reduced-
// motion users never depend on the animation to see the content.
export function Reveal({ children, className, delayMs = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: isVisible ? `${delayMs}ms` : '0ms' }}
      className={`motion-reduce:opacity-100! motion-reduce:translate-y-0! transition-all duration-700 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className ?? ''}`}
    >
      {children}
    </div>
  )
}
