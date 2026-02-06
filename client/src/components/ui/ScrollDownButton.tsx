import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function ScrollDownButton() {
  const scrollToNext = () => {
    const jumbotron = document.querySelector('.jumbotron') as HTMLElement | null
    if (!jumbotron) return

    // prefer the next element sibling that's an HTMLElement
    const next = jumbotron.nextElementSibling as HTMLElement | null

    if (next) {
      next.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    // fallback: find the next section after the jumbotron
    const sections = Array.from(document.querySelectorAll('section')) as HTMLElement[]
    const idx = sections.indexOf(jumbotron)
    if (idx >= 0 && sections[idx + 1]) {
      sections[idx + 1].scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <motion.button
      aria-label="Scroll down"
      onClick={scrollToNext}
      className="bg-black/50 hover:bg-primary/30 text-white p-4 rounded-full border-2 border-primary shadow-[0_0_20px_rgba(255,7,58,0.5)] hover:shadow-[0_0_30px_rgba(255,7,58,0.8)] transition-all cursor-pointer pointer-events-auto"
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: [0, 8, 0] }}
      transition={{ opacity: { delay: 1.7, duration: 0.2 }, y: { delay: 1.7, duration: 1.2, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' } }}
    >
      <ChevronDown className="w-7 h-7 text-primary" />
    </motion.button>
  )
}
