import { lazy, Suspense, useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, ArrowRight, ArrowUpRight, BatteryMedium, Box, Cpu, Orbit, Pause, Play, RotateCcw, PanelsTopLeft } from 'lucide-react'
import { usePrefersReducedMotion } from '../lib/motionPreference'
import type { SystemKey } from '../lib/content'
import type { SceneMotion } from './hero/EcosystemScene'
import '../styles/hero-stage.css'

const EcosystemScene = lazy(() => import('./hero/EcosystemScene'))
gsap.registerPlugin(ScrollTrigger)
const divisions = [
  { key: 'lumen' as SystemKey, name: 'LUMEN', role: 'Generation', icon: PanelsTopLeft },
  { key: 'tamid' as SystemKey, name: 'TAMID', role: 'Storage', icon: BatteryMedium },
  { key: 'grid' as SystemKey, name: 'GRID', role: 'Intelligence', icon: Cpu },
]

export function Hero({ onSystem }: { onSystem: (key: SystemKey) => void }) {
  const hero = useRef<HTMLDivElement>(null)
  const copy = useRef<HTMLDivElement>(null)
  const wash = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLDivElement>(null)
  const state = useRef<SceneMotion>({ x: 0, y: 0, scroll: 0, orbit: 0, tilt: 0, dragging: false })
  const drag = useRef({ x: 0, y: 0, orbit: 0, tilt: 0 })
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(true)
  const [compact, setCompact] = useState(() => window.innerWidth <= 760)
  const reduced = usePrefersReducedMotion()
  const onReady = useCallback(() => setReady(true), [])
  const onError = useCallback(() => setError(true), [])
  const renderOne = () => stage.current?.dispatchEvent(new Event('model-change'))
  useEffect(() => {
    const mq = window.matchMedia('(max-width:760px)')
    const resize = () => setCompact(mq.matches)
    mq.addEventListener('change', resize)
    let intersecting = true
    const sync = () => setVisible(intersecting && !document.hidden)
    const observer = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; sync() })
    if (hero.current) observer.observe(hero.current)
    document.addEventListener('visibilitychange', sync)
    return () => { observer.disconnect(); mq.removeEventListener('change', resize); document.removeEventListener('visibilitychange', sync) }
  }, [])
  useEffect(() => {
    if (reduced || !hero.current) return
    const movement = state.current
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: hero.current, start: 'top top', end: 'bottom top', scrub: .65 } })
      tl.to(movement, { scroll: 1, duration: 1, ease: 'none', onUpdate: renderOne }, 0)
      tl.fromTo('.od-context-landscape img', { scale: 1.04, yPercent: 0 }, { scale: 1.16, yPercent: 8, duration: 1, ease: 'none' }, 0)
      tl.to(copy.current, { y: -46, opacity: 0, duration: .75, ease: 'none' }, .06)
      tl.to(wash.current, { opacity: 1, duration: .39, ease: 'power1.in' }, .58)
    }, hero)
    return () => { ctx.revert(); movement.scroll = 0 }
  }, [reduced])
  const reset = () => { state.current.orbit = 0; state.current.tilt = 0; state.current.x = 0; state.current.y = 0; renderOne() }
  function pointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0 || error) return
    state.current.dragging = true
    drag.current = { x: e.clientX, y: e.clientY, orbit: state.current.orbit, tilt: state.current.tilt }
    e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.classList.add('is-dragging')
  }
  function pointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!state.current.dragging) return
    state.current.orbit = drag.current.orbit - (e.clientX-drag.current.x)*.008
    state.current.tilt = Math.max(-.16, Math.min(.46, drag.current.tilt+(e.clientY-drag.current.y)*.003))
    renderOne()
  }
  function pointerUp(e: PointerEvent<HTMLDivElement>) {
    state.current.dragging = false; e.currentTarget.classList.remove('is-dragging')
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }
  function keyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowLeft') state.current.orbit -= .15
    else if (e.key === 'ArrowRight') state.current.orbit += .15
    else if (e.key === 'ArrowUp') state.current.tilt = Math.min(.46,state.current.tilt+.06)
    else if (e.key === 'ArrowDown') state.current.tilt = Math.max(-.16,state.current.tilt-.06)
    else if (e.key === 'Home') reset()
    else return
    e.preventDefault(); renderOne()
  }
  return <div id="home" className="od-hero" ref={hero} aria-label="ORAYAH DYNAMIS — The Community Energy Ecosystem"
    onPointerMove={e => { if (reduced || paused || e.pointerType === 'touch' || state.current.dragging) return; const r = e.currentTarget.getBoundingClientRect(); state.current.x = (e.clientX-r.left)/r.width*2-1; state.current.y = (e.clientY-r.top)/r.height*2-1 }}
    onPointerLeave={() => { state.current.x=0; state.current.y=0 }}>
    <div className="od-atmosphere" aria-hidden="true"/>
    <picture className="od-context-landscape" aria-hidden="true"><source media="(max-width:760px)" srcSet="/images/energy-valley-small.webp"/><img src="/images/energy-valley.webp" alt="" decoding="async" fetchPriority="high"/></picture>
    <div className="od-hero-frame">
      <div className="od-scene-topline"><span className="od-scene-ref ml-auto"><Box size={12} strokeWidth={1.4}/> FIG. 01 &nbsp;/&nbsp; ECOSYSTEM MODEL</span></div>
      <div className="od-body"><div ref={copy} className="od-copy"><motion.div initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65, ease: [.18,.65,.25,1] }}>
        <div className="od-eyebrow"><span className="od-eyebrow-line"/>The Community Energy Ecosystem</div>
        <h1 aria-label="Generate.Store.Connect.Empower">{['Generate.Store.', 'Connect.Empower'].map((line, index) => <span key={line} className="od-headline-mask" aria-hidden="true"><motion.span initial={reduced ? false : { y: '102%' }} animate={{ y: 0 }} transition={{ duration: .8, delay: index * .085, ease: [.19, 1, .3, 1] }}>{line}</motion.span></span>)}</h1>
        <p className="od-description">ORAYAH is a decentralized smart energy ecosystem integrating renewable generation, hybrid energy storage and AI-driven intelligent energy management through a common DC microgrid. It enables communities to generate, store, share and efficiently utilize clean energy through predictive and adaptive control.</p>
        <div className="od-actions"><a className="od-primary" href="#challenge">The reliability problem <ArrowRight size={15}/></a><a className="od-secondary" href="#solution">Discover our solution <ArrowUpRight size={14}/></a></div>
      </motion.div></div></div>
      <div ref={stage} className="od-stage" role="group" tabIndex={error ? -1 : 0} aria-label="Interactive 3D concept model of the ORAYAH energy ecosystem" aria-describedby="od-model-instructions" aria-busy={!ready && !error} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onKeyDown={keyDown}>
        <span id="od-model-instructions" className="sr-only">A scale model of solar arrays, battery cabinets, a central GRID hub, and community buildings. Illuminated paths illustrate energy flow, not physical wiring. Drag to orbit. Use arrow keys to rotate the model, or Home to reset the view.</span>
        {!error && <Suspense fallback={null}><EcosystemScene motionState={state} label={label} compact={compact} reduced={reduced} paused={paused} visible={visible} onReady={onReady} onError={onError}/></Suspense>}
        {!compact && !error && <div ref={label} className="od-label-anchor" style={{visibility:ready?'visible':'hidden'}} aria-hidden="true"><div className="od-core-callout"><svg width="86" height="102" viewBox="0 0 86 102"><circle cx="4" cy="97" r="2.8" fill="#d6ead2"/><path d="M4 96 49 15H84" fill="none" stroke="#c6dac0" strokeWidth=".8"/></svg><span>03 / ORAYAH GRID<small>Intelligent energy hub</small></span></div></div>}
        <AnimatePresence>{!ready && !error && <motion.div className="od-loader" role="status" exit={{opacity:0}} transition={{duration:.3}}><div className="od-loader-symbol"><Box size={25} strokeWidth={1}/></div><span>Initializing ecosystem</span><div className="od-loader-track"/></motion.div>}</AnimatePresence>
        {error && <div className="od-unavailable"><Box size={30} strokeWidth={1}/><small>3D viewer unavailable</small><p>This interactive model requires WebGL 2. Explore the accessible system map instead.</p><a href="#flow-map">Open system architecture ↗</a></div>}
      </div>
      {ready && !error && <div className="od-view-tools"><span className="od-orbit-hint"><Orbit size={14} strokeWidth={1.5}/><span>Drag to rotate</span></span><i className="od-tool-divider"/>{!reduced && <button aria-label={paused ? 'Resume 3D animation' : 'Pause 3D animation'} title={paused ? 'Resume motion' : 'Pause motion'} aria-pressed={paused} onClick={()=>setPaused(p=>!p)}>{paused ? <Play/> : <Pause/>}</button>}<button aria-label="Reset 3D view" title="Reset view" onClick={reset}><RotateCcw/></button></div>}
      <div className="od-index" aria-label="Explore the three technology divisions">{divisions.map((d,i)=><button className="od-division" key={d.key} onClick={()=>onSystem(d.key)} aria-label={`Explore ORAYAH ${d.name} — ${d.role}`}><span className="od-division-icon"><d.icon size={22}/></span><span className="od-division-copy"><small><em>0{i+1} /</em> {d.role}</small><strong><span>ORAYAH </span>{d.name} <ArrowUpRight size={13}/></strong></span></button>)}<a className="od-scroll" href="#challenge"><span>Scroll to explore</span><i><ArrowDown size={14}/></i></a></div>
    </div>
    <div className="od-transition" ref={wash} aria-hidden="true"/>
  </div>
}
