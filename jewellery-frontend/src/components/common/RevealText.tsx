import { type ElementType, type ReactNode } from 'react'
import { motion, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

interface RevealTextProps {
  children: ReactNode
  as?: ElementType
  className?: string
  delay?: number
  once?: boolean
  /** Split into words and stagger each one (best for headlines). */
  splitWords?: boolean
}

const container: Variants = {
  hidden: {},
  visible: (delay: number) => ({
    transition: { staggerChildren: 0.06, delayChildren: delay },
  }),
}

const wordVariants: Variants = {
  hidden: { y: '110%', opacity: 0 },
  visible: {
    y: '0%',
    opacity: 1,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
}

const blockVariants: Variants = {
  hidden: { y: 28, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
}

/**
 * Scroll-triggered text reveal. With `splitWords`, each word animates up
 * from behind a clipped mask with a stagger; otherwise the whole block
 * fades and rises together.
 */
export function RevealText({
  children,
  as: Tag = 'div',
  className,
  delay = 0,
  once = true,
  splitWords = false,
}: RevealTextProps) {
  if (splitWords && typeof children === 'string') {
    const words = children.split(' ')
    return (
      <motion.span
        className={cn('inline-block', className)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount: 0.4 }}
        variants={container}
        custom={delay}
      >
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="inline-block overflow-hidden pb-1 align-top">
            <motion.span variants={wordVariants} className="inline-block">
              {word}
              {index < words.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        ))}
      </motion.span>
    )
  }

  const MotionTag = motion.create(Tag as ElementType)

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.3 }}
      variants={blockVariants}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  )
}
