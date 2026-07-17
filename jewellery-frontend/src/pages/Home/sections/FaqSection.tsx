import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { RevealText } from '@/components/common/RevealText'
import type { FaqItem } from '@/types/domain'

const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Is this real gold?',
    answer:
      'Our pieces are crafted from high-grade base metals finished with genuine gold, rose gold, or rhodium plating. They deliver the look and shine of fine jewellery without the price tag or weight of solid precious metal.',
  },
  {
    id: 'faq-2',
    question: 'Will it tarnish or fade?',
    answer:
      'Every piece is finished with multiple protective plating layers designed to resist tarnishing under normal wear. With basic care (see our Jewellery Care guide) most pieces retain their shine for years.',
  },
  {
    id: 'faq-3',
    question: "What's your return policy?",
    answer:
      'We offer a 15-day easy return window on unworn pieces in their original packaging. Personalised and bridal-customised pieces are final sale unless defective.',
  },
  {
    id: 'faq-4',
    question: 'Is the jewellery hypoallergenic?',
    answer:
      'Most of our collection is nickel-free and suitable for sensitive skin. Product pages note any specific sensitivities so you can shop with confidence.',
  },
  {
    id: 'faq-5',
    question: 'How should I store my jewellery?',
    answer:
      'Keep pieces in a dry, airtight pouch away from direct sunlight and moisture. Avoid contact with perfume, lotion, and water to extend the life of the plating.',
  },
  {
    id: 'faq-6',
    question: 'Do you offer customisation for bridal orders?',
    answer:
      'Yes — our Bridal Edit team offers colour-matching, sizing, and light customisation on select sets. Reach out via Contact Us at least three weeks ahead of your event.',
  },
]

export function FaqSection() {
  return (
    <section className="section-padding bg-ivory">
      <div className="mx-auto max-w-3xl">
        <div className="mb-14 flex flex-col items-center text-center">
          <RevealText as="span" className="eyebrow">
            Good to Know
          </RevealText>
          <RevealText as="h2" delay={0.1} className="mt-4 text-4xl text-ink md:text-5xl">
            Frequently Asked Questions
          </RevealText>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
