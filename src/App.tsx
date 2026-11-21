import { useEffect, useRef, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from './lib/motionPreference'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Applications, Footer, ProblemDetails, Process, Solution, Sustainability, SystemDetails, Systems, Team } from './components/Sections'
import { Architecture, Diagram } from './components/Architecture'
import { ModelPlate } from './components/ModelPlate'
import { Mentor } from './components/Mentor'
import { Eyebrow, Modal } from './components/UI'
import { goTo, systems, type NodeKey, type SystemKey } from './lib/content'

type OpenDialog = { kind: 'system'; key: SystemKey } | { kind: 'architecture' } | null

function App() {
  const chapters = useRef<HTMLElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const [dialog, setDialog] = useState<OpenDialog>(null)
  const [node, setNode] = useState<NodeKey>('pv')
  const [step, setStep] = useState(0)
  const openSystem = (key: SystemKey) => setDialog({ kind: 'system', key })
  const close = () => setDialog(null)
  useEffect(() => {
    const root = chapters.current
    if (reducedMotion || !root) return
    gsap.registerPlugin(ScrollTrigger)
    const sequence = gsap.context(() => {
      // Keep native scrolling and deep links; only the visual layers travel.
      root.querySelectorAll<HTMLElement>('[data-camera-layer]').forEach(layer => {
        gsap.fromTo(layer, { scale: 1.17, yPercent: -3 }, {
          scale: 1.055, yPercent: 2, ease: 'none',
          scrollTrigger: { trigger: layer.parentElement, start: 'top bottom', end: 'bottom top', scrub: .75 },
        })
      })
      root.querySelectorAll<HTMLElement>('.systems-grid, #team .portrait-series').forEach(series => {
        const frames = series.querySelectorAll<HTMLElement>('.system-card, .portrait-frame')
        const reveal = gsap.timeline({ scrollTrigger: { trigger: series, start: 'top 94%', once: true } })
        reveal.fromTo(frames, { '--shutter': 1, clipPath: 'inset(0% 0% 14% 0%)' }, {
          '--shutter': 0, clipPath: 'inset(0% 0% 0% 0%)', stagger: .085, duration: .82,
          ease: 'power3.inOut', clearProps: 'clipPath,--shutter',
        })
        reveal.fromTo(Array.from(frames, frame => frame.querySelector('img')), { scale: 1.12 }, {
          scale: 1, stagger: .085, duration: 1.12, ease: 'power3.out', clearProps: 'transform',
        }, 0)
      })
      root.querySelectorAll<HTMLElement>('.section-heading h2, #solution-title, #challenge-title').forEach(title => {
        gsap.fromTo(title, { y: 18, clipPath: 'inset(0% 0% 58% 0%)' }, {
          y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: .7, ease: 'power3.out',
          clearProps: 'transform,clipPath', scrollTrigger: { trigger: title.parentElement, start: 'top 94%', once: true },
        })
      })
    }, root)
    return () => sequence.revert()
  }, [reducedMotion])
  const selectStep = (index: number) => {
    const stages: NodeKey[] = ['pv','mppt','battery','esp32','iems','schedule','acLoads']
    setStep(index); setNode(stages[index])
  }
  useEffect(() => {
    const known = ['home', 'challenge', 'solution', 'process', 'flow-map', 'systems', 'architecture', 'applications', 'sustainability', 'team', 'mentor', 'contact']
    const hash = window.location.hash.slice(1)
    const destination = hash === 'about' ? 'solution' : hash
    if (known.includes(destination)) {
      const timer = window.setTimeout(() => document.getElementById(destination)?.scrollIntoView({ behavior: 'instant' }), 100)
      return () => window.clearTimeout(timer)
    }
  }, [])

  return <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-white text-charcoal">
      <a className="skip-link" href="#challenge">Skip to the reliability problem</a>
      <Header/>
      <main ref={chapters}>
        <Hero onSystem={openSystem}/>
        <ProblemDetails/>
        <Solution visual={<ModelPlate view="ecosystem"/>}/>
        <Process step={step} setStep={selectStep} flow={<Diagram selected={node} onSelect={setNode} onExpand={() => setDialog({ kind: 'architecture' })}/>}/>
        <Systems onSelect={openSystem}/>
        <Architecture onInspect={key => { setNode(key); goTo('flow-map') }}/>
        <Applications onPriority={() => { selectStep(6); goTo('process') }}/>
        <Sustainability/>
        <Team/>
        <Mentor/>
      </main>
      <Footer/>
      {dialog?.kind === 'system' && <Modal title={`ORAYAH ${dialog.key.toUpperCase()} technology division`} onClose={close} className="system-modal"><SystemDetails systemKey={dialog.key} visual={<ModelPlate view={dialog.key}/>} onArchitecture={() => { setNode(systems.find(s => s.key === dialog.key)!.node); close(); goTo('flow-map') }}/></Modal>}
      {dialog?.kind === 'architecture' && <Modal title="Expanded system architecture" onClose={close} className="architecture-modal"><div className="expanded-map-heading"><Eyebrow>ORAYAH DYNAMIS</Eyebrow><h3>System architecture</h3></div><Diagram selected={node} onSelect={setNode}/></Modal>}
    </div>
  </MotionConfig>
}

export default App
