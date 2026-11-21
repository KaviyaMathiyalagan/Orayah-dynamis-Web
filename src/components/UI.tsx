import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '../lib/motionPreference'
import { ArrowUpRight, X } from 'lucide-react'

export function Brand({ compact = false }: { compact?: boolean }) {
  return <span className={`brand ${compact ? 'brand-compact' : ''}`}>
    <svg className="brand-mark" viewBox="0 0 48 45" fill="none" aria-hidden="true"><path d="M1 39 18.8 6h9.7L10.7 39H1Z" fill="currentColor"/><path d="m23.1 20.4 5.2-9.6L44 39H33.1l-10-18.6Z" fill="currentColor"/><path d="M16.4 39 22 28.6h4.3L32 39H16.4Z" fill="currentColor"/></svg>
    <span className="brand-type"><strong>ORAYAH</strong><small>DYNAMIS</small></span>
  </span>
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <div className={`eyebrow ${light ? 'eyebrow-light' : ''}`}><span className="eyebrow-line" />{children}</div>
}

export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reducedMotion = usePrefersReducedMotion()
  return <motion.div className={className} initial={reducedMotion ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.07 }} transition={{ duration: 0.58, delay, ease: [0.2, 0.6, 0.2, 1] }}>{children}</motion.div>
}

export function RoundArrow({ size = 18 }: { size?: number }) {
  return <span className="round-arrow" aria-hidden="true"><ArrowUpRight size={size} strokeWidth={1.6} /></span>
}

export function Modal({ title, children, onClose, className = '' }: { title: string; children: ReactNode; onClose: () => void; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current
    const oldOverflow = document.body.style.overflow
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    return () => { dialog?.close(); document.body.style.overflow = oldOverflow }
  }, [])
  return createPortal(<dialog ref={ref} aria-labelledby={titleId} className={`modal ${className}`} onCancel={e => { e.preventDefault(); onClose() }} onClick={e => { if (e.target === ref.current) { const r = ref.current!.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose() } }}>
    <h2 className="sr-only" id={titleId}>{title}</h2>
    <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog" autoFocus><X size={20}/></button>
    {children}
  </dialog>, document.body)
}
