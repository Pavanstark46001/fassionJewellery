import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useAppSelector } from '@/store/hooks'

/**
 * Custom magnetic cursor. Desktop (fine-pointer, hover-capable) only —
 * renders nothing on touch devices. Grows and gains a gold ring when
 * hovering anything with [data-cursor="hover"], shrinks to a dot on text.
 */
export function LuxuryCursor() {
  const [isSupported, setIsSupported] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const variant = useAppSelector((state) => state.ui.cursorVariant)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const springX = useSpring(x, { damping: 28, stiffness: 320, mass: 0.4 })
  const springY = useSpring(y, { damping: 28, stiffness: 320, mass: 0.4 })

  useEffect(() => {
    const supportsFinePointer = window.matchMedia('(pointer: fine) and (hover: hover)').matches
    setIsSupported(supportsFinePointer)
    if (!supportsFinePointer) return

    const root = document.documentElement
    root.classList.add('custom-cursor')

    let hasShown = false
    function handleMove(event: PointerEvent) {
      x.set(event.clientX - 12)
      y.set(event.clientY - 12)
      if (!hasShown) {
        hasShown = true
        setIsVisible(true)
      }
    }
    function handleLeave() {
      hasShown = false
      setIsVisible(false)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerleave', handleLeave)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerleave', handleLeave)
      root.classList.remove('custom-cursor')
    }
  }, [x, y])

  if (!isSupported) return null

  const isHover = variant === 'hover'
  const isText = variant === 'text'
  const isHidden = variant === 'hidden'

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference"
      style={{ x: springX, y: springY, opacity: isVisible && !isHidden ? 1 : 0 }}
    >
      <motion.div
        className="rounded-full border border-gold bg-gold/20"
        animate={{
          width: isHover ? 64 : isText ? 6 : 24,
          height: isHover ? 64 : isText ? 6 : 24,
          x: isHover ? -20 : isText ? 9 : 0,
          y: isHover ? -20 : isText ? 9 : 0,
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.div>
  )
}
