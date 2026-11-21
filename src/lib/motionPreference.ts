import { useSyncExternalStore } from 'react'

const preference = '(prefers-reduced-motion: reduce)'
function subscribe(notify: () => void) {
  const media = window.matchMedia(preference)
  media.addEventListener('change', notify)
  return () => media.removeEventListener('change', notify)
}
const current = () => window.matchMedia(preference).matches
const server = () => true

/** Respond to accessibility preference changes without requiring a page reload. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, current, server)
}
