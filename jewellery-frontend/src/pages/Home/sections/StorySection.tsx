import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PARAGRAPHS = [
  'Every piece begins with a story.',
  'A sketch, a memory, a moment worth holding onto.',
  'Our artisans translate that story into gold-toned brilliance built to last.',
  'No compromise on shine. No compromise on soul.',
]

/**
 * Pinned storytelling section: the section sticks in the viewport while
 * paragraphs cross-fade in sequence, driven by a scrubbed GSAP ScrollTrigger
 * timeline. Falls back to a simple stacked, non-pinned layout for
 * prefers-reduced-motion users.
 */
export function StorySection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      const paragraphs = paragraphRefs.current.filter(Boolean) as HTMLParagraphElement[]
      gsap.set(paragraphs, { opacity: 0, y: 30 })
      gsap.set(paragraphs[0], { opacity: 1, y: 0 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${paragraphs.length * 500}`,
          scrub: 0.6,
          // Deliberately NOT using ScrollTrigger's `pin: true` here: it wraps
          // the pinned element in a "pin-spacer" div by mutating the DOM
          // directly, outside React's control. On a fast client-side route
          // change away from the homepage, React's own unmount can race
          // ScrollTrigger's revert of that wrapper, throwing "Failed to
          // execute 'removeChild': the node is not a child of this node" —
          // a well-known GSAP+React interaction issue (confirmed: neither
          // `pinType: 'transform'` nor timing changes fully avoided it here).
          // The "stays in view while scrolling past" effect is achieved with
          // plain CSS `position: sticky` on the inner wrapper below instead,
          // which requires no DOM mutation and has nothing to revert.
        },
      })

      paragraphs.forEach((paragraph, index) => {
        if (index === 0) return
        tl.to(paragraphs[index - 1], { opacity: 0, y: -30, duration: 0.4 }, index)
        tl.to(paragraph, { opacity: 1, y: 0, duration: 0.4 }, index)
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{ height: `calc(100vh + ${PARAGRAPHS.length * 500}px)` }}
      className="relative"
    >
      {/* Stays pinned to the top of the viewport via CSS alone (no GSAP DOM
          mutation) for as long as the taller section above is scrolled through,
          then releases naturally — see the effect's comment for why. */}
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-ink">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(201,169,97,0.14),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,10,10,0.2),rgba(10,10,10,0.85))]" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <span className="eyebrow text-gold">Our Craft</span>
          <div className="relative mt-8 h-40 md:h-32">
            {PARAGRAPHS.map((text, index) => (
              <p
                key={text}
                ref={(el) => {
                  paragraphRefs.current[index] = el
                }}
                className={`absolute inset-x-0 text-balance font-serif text-3xl italic leading-snug text-ivory transition-opacity duration-700 md:text-4xl ${
                  index === 0 ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
