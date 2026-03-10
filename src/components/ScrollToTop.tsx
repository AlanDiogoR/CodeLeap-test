import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SCROLL_THRESHOLD = 500

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    function handleScroll() {
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        setVisible(window.scrollY > SCROLL_THRESHOLD)
        rafRef.current = null
      })
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 flex size-12 items-center justify-center rounded-full bg-primary text-inverse shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
          aria-label="Scroll to top of page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
