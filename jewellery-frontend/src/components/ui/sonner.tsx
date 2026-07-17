import type { ComponentProps } from 'react'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            'group toast rounded-2xl border border-gold/30 bg-ink text-ivory shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] font-sans px-2',
          title: 'font-serif text-base',
          description: 'text-ivory/70',
          actionButton: 'bg-gold text-ink',
          cancelButton: 'bg-ivory/10 text-ivory',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
