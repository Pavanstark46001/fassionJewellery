import { useRef, type MouseEvent, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useAppDispatch } from '@/store/hooks'
import { setCursorVariant } from '@/store/uiSlice'
import { cn } from '@/lib/utils'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
}

/**
 * Wraps its child in a container that visually "pulls" toward the cursor
 * while the pointer is within `strength` px of its center, and resets with
 * a springy ease on leave. Purely presentational — pass a real
 * <button>/<Link> as the child for behaviour.
 */
export function MagneticButton({ children, className, strength = 40 }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.3 })
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.3 })

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = event.clientX - (rect.left + rect.width / 2)
    const relY = event.clientY - (rect.top + rect.height / 2)
    x.set((relX / rect.width) * strength)
    y.set((relY / rect.height) * strength)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
    dispatch(setCursorVariant('default'))
  }

  function handleMouseEnter() {
    dispatch(setCursorVariant('hover'))
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{ x: springX, y: springY }}
      className={cn('inline-block', className)}
      data-cursor="hover"
    >
      {children}
    </motion.div>
  )
}
