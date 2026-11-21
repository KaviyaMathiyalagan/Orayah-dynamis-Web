import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, Check, ChevronRight, CircleDot, Sun, Sunset } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { aboutItems, applications, benefits, processSteps, systems, type SystemKey } from '../lib/content'
import { Brand, Eyebrow, Reveal, RoundArrow } from './UI'
import { usePrefersReducedMotion } from '../lib/motionPreference'
import { TeamPortrait } from './TeamPortrait'
import '../styles/chapter-explorers.css'

export function Systems({ onSelect }: { onSelect: (key: SystemKey) => void }) {
  return <section id="systems" aria-label="Three Core Systems" className="systems-section"><div className="page-shell"><div className="section-heading systems-heading"><div><Eyebrow>Three core systems</Eyebrow><h2>Three systems. <span>One ecosystem.</span></h2></div><p>Distinct capabilities. Shared intelligence.<br/> Designed to work as one.</p></div>
    <div className="systems-grid">{systems.map((s, i) => <Reveal key={s.key} delay={i*.055}><button className={`system-card system-${s.key}`} onClick={() => onSelect(s.key)} aria-label={`Explore ORAYAH ${s.name}: ${s.title}`}>
      <img src={`/images/${s.key}-card.webp`} width="900" height="650" alt={s.imageAlt} loading="lazy" decoding="async"/><span className="system-image-shade"/><span className="system-card-top"><span className="division-label"><span>{s.number}</span><i/> {s.category}</span><span className="system-card-icon"><s.icon size={20} strokeWidth={1.45}/></span></span>
      <span className="system-card-bottom"><span className="card-brand-prefix">ORAYAH</span><span className="system-title">{s.name}</span><span className="card-description">{s.title}<RoundArrow size={16}/></span></span>
    </button></Reveal>)}</div><div className="systems-footnote"><span className="connection-symbol"><i/><i/><i/></span>Connected through a common DC microgrid</div></div></section>
}

export function SystemDetails({ systemKey, onArchitecture, visual }: { systemKey: SystemKey; onArchitecture: () => void; visual: ReactNode }) {
  const s = systems.find(v => v.key === systemKey)!
  return <><div className="system-study-heading"><Eyebrow>Division {s.number} / {s.category}</Eyebrow><h3>ORAYAH {s.name}</h3><p>{s.title}</p></div>{visual}
    <div className="system-detail-body"><span className="status-tag"><span className="small-dot"/>Proposed prototype scope</span><p className="detail-overview">{s.overview}</p><div className="detail-feature-list">{s.features.map(([name, text], i) => <div key={name}><span>0{i+1}</span><div><h4>{name}</h4><p>{text}</p></div></div>)}</div><aside className="detail-note"><CircleDot size={16}/><div><b>{s.key === 'tamid' ? 'Future research, not the initial prototype' : 'Design context'}</b><p>{s.note}</p></div></aside><button className="button button-forest" onClick={onArchitecture}>Locate in architecture <ArrowUpRight size={16}/></button></div></>
}

export function ProblemDetails() {
  return <section id="challenge" className="section-space bg-[#f4f6f4]" aria-labelledby="challenge-title"><div className="page-shell grid items-center gap-9 lg:grid-cols-[.9fr_1.1fr] lg:gap-[7vw]">
      <Reveal className="about-content"><Eyebrow>The Problem</Eyebrow><h2 id="challenge-title" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>The Reliability <span style={{ fontWeight: 'inherit' }}>Problem</span></h2>
        <p className="section-intro">Communities in rural and disaster-prone regions face unreliable electricity, with rural areas receiving an average of just <strong>22.6 hours of power per day</strong>. During Cyclone Michaung (2023), Chennai recorded <strong>530 mm of rainfall in three days</strong>, while power disruptions persisted across <strong>4% of Chennai, 5.6% of Tambaram and 7.85% of Tiruvallur feeder lines</strong> even two days later. Dependence on diesel backups and the lack of intelligent energy management threaten essential services such as clinics, schools and water pumps.</p>
        <p className="section-intro"><strong>The challenge:</strong> Ensuring reliable power through intelligent generation, storage and prioritization of essential community loads.</p>
      </Reveal>
      <Reveal className="about-photo-wrap"><img data-camera-layer className="about-photo" src="/images/community.webp" alt="A community of homes and shared services in a mountain valley" loading="lazy" decoding="async"/></Reveal>
    </div></section>
}

export function Solution({ visual }: { visual: ReactNode }) {
  const solution = aboutItems[2]
  return <section id="solution" className="relative isolate overflow-hidden bg-forest text-white" aria-label="Our Solution">
      <img data-camera-layer className="absolute inset-0 -z-20 h-full w-full object-cover object-[65%_56%]" src="/images/energy-valley.webp" srcSet="/images/energy-valley-small.webp 800w, /images/energy-valley.webp 1536w" sizes="100vw" loading="lazy" decoding="async" alt="An illustrative solar-powered community in a mountain valley"/>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-[#0c211aec] via-[#10281fc4] to-[#10281f36]"/>
      <div className="page-shell solution-study-layout py-16 sm:py-24 lg:py-28"><Reveal className="max-w-xl"><Eyebrow light>Our solution</Eyebrow><h2 id="solution-title" className="mt-5 text-[clamp(2.1rem,3.8vw,4.25rem)] leading-[1.1] font-medium tracking-[-.055em]">Make local energy<br/><span className="text-[#c5dfba]">work together.</span></h2>
        <p className="mt-5 max-w-[480px] text-base leading-7 text-white">ORAYAH DYNAMIS is a proposed community energy ecosystem that brings solar generation, battery storage, and intelligent management onto one DC microgrid.</p>
        <p className="mt-5 max-w-[480px] text-sm leading-[1.85] text-[#edf4e9]">{solution.text}</p>
        <a className="button button-sage mt-7" href="#process">See how it works <ArrowRight size={16}/></a>
      </Reveal>{visual}</div>
    </section>
}

export function Process({ step, setStep, flow }: { step: number; setStep: (index: number) => void; flow: ReactNode }) {
  const active = processSteps[step]
  function stepKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    let next = i
    if (e.key === 'ArrowRight') next = (i+1)%7
    else if (e.key === 'ArrowLeft') next = (i+6)%7
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = 6
    else return
    e.preventDefault(); setStep(next); document.getElementById(`step-tab-${next}`)?.focus()
  }
  return <section id="process" aria-label="How It Works" className="process-section section-space"><div className="page-shell"><Reveal><div className="section-heading"><div><Eyebrow>How it works</Eyebrow><h2>From sunlight to service.</h2></div><p>Seven connected stages.<br/> One coordinated energy cycle.</p></div></Reveal>
    <div id="flow-map" className="mb-9">{flow}<p className="engineering-note">Illustrative operating sequence. Voltage ratings are proposed design targets, not measured prototype outputs.</p></div>
    <div className="process-tab-scroll"><div className="process-tabs" role="tablist" aria-label="Energy operating stages">{processSteps.map((s, i) => <button role="tab" id={`step-tab-${i}`} key={s.name} aria-selected={step === i} aria-controls="process-panel" tabIndex={step === i ? 0 : -1} onClick={() => setStep(i)} onKeyDown={e => stepKey(e, i)} className={step === i ? 'active' : ''}><small>0{i+1}</small>{s.name}<ChevronRight size={13}/></button>)}</div></div>
    <div className="process-panel" id="process-panel" role="tabpanel" aria-labelledby={`step-tab-${step}`}><div className="process-image"><AnimatePresence initial={false}><motion.img key={active.image} src={active.image} loading="lazy" alt={active.alt} initial={{opacity:0,x:'5%',scale:1.1}} animate={{opacity:1,x:0,scale:1}} exit={{opacity:0,x:'-5%'}} transition={{duration:.65,ease:[.2,.65,.25,1]}}/></AnimatePresence><span className="process-number">0{step+1}<i> / 07</i></span></div><div className="process-content"><span className="process-division"><active.icon size={15}/>{active.division}</span><AnimatePresence mode="wait" initial={false}><motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: .22 }}><h3>{active.title}</h3><p>{active.text}</p><span className="process-chain">{active.detail}</span></motion.div></AnimatePresence><div className="process-bottom"><button className="text-link" onClick={() => setStep((step+1)%7)}>{step === 6 ? 'Restart the cycle' : 'Next stage'}<ArrowRight size={15}/></button><button className="icon-button" onClick={() => setStep((step+6)%7)} aria-label="Previous operating stage"><ArrowLeft size={16}/></button></div></div></div>
  </div></section>
}

const sectorStories = [
  {image:'/images/community.webp',alt:'Homes in a forested mountain community',heading:'Everyday life, after sunset.',text:'Stored solar energy could keep essential lights and communication devices available when daylight fades. Household priorities would be agreed locally.'},
  {image:'/images/sectors/healthcare.webp',alt:'A sign directing visitors to an after-hours clinic',heading:'Care does not end at dusk.',text:'A clinic could designate examination lighting and essential care circuits for priority service. Available capacity and qualified backup arrangements still determine continuity.'},
  {image:'/images/sectors/education.webp',alt:'A daylit classroom with rows of desks and a chalkboard',heading:'Keep learning connected.',text:'Classroom lighting and connectivity can be scheduled around school hours. Flexible equipment use could move to periods of stronger solar generation.'},
  {image:'/images/sectors/water.webp',alt:'A bank of water-treatment vessels and distribution pipes',heading:'Plan the next refill.',text:'A community could schedule pumping into storage tanks during solar-rich hours, while reserving priority for essential water needs during a shortfall.'},
  {image:'/images/sectors/business.webp',alt:'An artisan working with tools in a local workshop',heading:'Power for productive work.',text:'Shops and workshops could align flexible equipment use with available power, helping owners plan their working day without displacing critical services.'},
  {image:'/images/energy-valley.webp',alt:'An illustrative landscape of community buildings and renewable infrastructure',heading:'Shared power. Local priorities.',text:'Community centres, safety lighting, and communications can be considered together. The proposed scheduler follows local service priorities rather than a single rule for every load.'},
]
export function Applications({ onPriority }: { onPriority: () => void }) {
  const [limited, setLimited] = useState(false)
  const [sector,setSector]=useState(0)
  const [direction,setDirection]=useState(1)
  const swipe=useRef<{x:number;y:number}|null>(null)
  const reduced=usePrefersReducedMotion()
  const story=sectorStories[sector], application=applications[sector]
  const select=(index:number,travel:number)=>{setDirection(travel);setSector(index)}
  const move=(travel:number)=>select((sector+travel+applications.length)%applications.length,travel)
  return <section id="applications" aria-label="Real-World Applications" className="applications-section sector-section"><div className="sector-scene" role="region" aria-roledescription="carousel" aria-label="Community application stories"
    onPointerDown={e=>{if(e.pointerType==='touch'&&!(e.target as HTMLElement).closest('button,a'))swipe.current={x:e.clientX,y:e.clientY}}}
    onPointerCancel={()=>{swipe.current=null}}
    onPointerUp={e=>{const start=swipe.current;swipe.current=null;if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)move(dx<0?1:-1)}}>
    <div className="sector-image-plane" data-camera-layer><AnimatePresence initial={false} custom={direction}><motion.img key={story.image} className="sector-photo" src={story.image} alt={story.alt} loading="lazy" decoding="async" custom={direction}
      variants={{ arrival:(d:number)=>({clipPath:d>0?'inset(0% 0% 0% 100%)':'inset(0% 100% 0% 0%)',x:`${d*3}%`,scale:1.09,zIndex:2}), visible:{clipPath:'inset(0% 0% 0% 0%)',x:0,scale:1,zIndex:2}, departure:(d:number)=>({x:`${-d*4}%`,scale:1.06,zIndex:1}) }}
      initial={reduced?false:'arrival'} animate="visible" exit={reduced?{opacity:0}:'departure'} transition={{duration:reduced?0:.85,ease:[.7,0,.18,1]}}/></AnimatePresence></div>
    <div className="page-shell sector-story-shell"><Eyebrow light>Real-world applications</Eyebrow><h2>Power with a purpose.</h2><div className="sector-copy" aria-live="polite"><AnimatePresence mode="wait" initial={false}><motion.div key={sector} initial={{opacity:0,x:14}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} transition={{duration:.2}}><span className="little-label">0{sector+1} / {application.name}</span><h3>{story.heading}</h3><p>{story.text}</p></motion.div></AnimatePresence></div>
      <div className="sector-controls"><button aria-label="Previous community application" onClick={()=>move(-1)}><ArrowLeft size={16}/></button><span>0{sector+1} <i>/</i> 06</span><button aria-label="Next community application" onClick={()=>move(1)}><ArrowRight size={16}/></button></div>
    </div></div><div className="page-shell sector-scheduling">
    <div className="scenario-bar"><div><span className="little-label">EXPLORE A SCENARIO</span><span>Illustrative load scheduling</span></div><div className="scenario-switch" aria-label="Supply scenario"><button aria-pressed={!limited} className={!limited ? 'active' : ''} onClick={() => setLimited(false)}><Sun size={15}/>Balanced supply</button><button aria-pressed={limited} className={limited ? 'active' : ''} onClick={() => setLimited(true)}><Sunset size={15}/>Limited supply</button></div></div>
    <div className="application-grid" role="group" aria-label="Choose a community sector">{applications.map((a,i) => <article className={`application-item ${i===sector?'is-featured':''}`} key={a.name}><a.icon size={27} strokeWidth={1.35}/><h3><button aria-pressed={i===sector} onClick={()=>select(i,i>=sector?1:-1)}>{a.name}<ArrowUpRight size={13}/></button></h3><p>{a.text}</p><span className={`load-status ${limited ? 'limited' : ''}`}><i/>{limited ? a.limited : a.balanced}</span></article>)}</div>
    <div className="application-note"><p>Example policy only, not live data. Actual priorities depend on local needs and available capacity.</p><button className="text-link" onClick={onPriority}>How prioritization works<ArrowUpRight size={15}/></button></div>
  </div></section>
}

export function Sustainability() {
  return <section id="sustainability" aria-label="Impact & Sustainability" className="sustainability-section section-space"><div className="page-shell"><Reveal><div className="section-heading"><div><Eyebrow>Impact & sustainability</Eyebrow><h2>A longer view of energy.</h2></div><p>Environmental and social benefits the ecosystem is designed to pursue.</p></div></Reveal><div className="benefits-grid">{benefits.map((b, i) => <Reveal key={b.title} delay={i*.05}><article className="benefit"><div className="benefit-top"><span><b.icon size={25} strokeWidth={1.5}/></span><small>0{i+1}</small></div><h3>{b.title}</h3><p>{b.text}</p></article></Reveal>)}</div><p className="intent-note"><CircleDot size={14}/>Intended outcomes, not measured results. Impact will need to be evaluated through future prototypes and community trials.</p></div></section>
}

const team = [
  {driveId: 'r3', name: 'Wordson Jayakumar', role: 'Power Electronics Engineer', qualification: 'M.E', department: 'EEE', specialization: 'Power Electronics & Drives', institution: 'Government College of Technology', image: 'wordson-jayakumar', width: 1213, height: 1213},
  {driveId: 'r2', name: 'Kaviya S', role: 'Energy Storage Engineer', qualification: 'M.E', department: 'EEE', specialization: 'Power Electronics & Drives', institution: 'Government College of Technology', image: 'kaviya-s', width: 1095, height: 1437},
  {driveId: 'r1', name: 'Kaviya Mathiyalagan', role: 'Software & AI Engineer', qualification: 'B.E', department: 'CSE', institution: 'Sri Ramakrishna Institute of Technology', image: 'kaviya-mathiyalagan', width: 521, height: 642},
]

export function Team() {
  return <section id="team" className="section-space bg-[#f4f6f4]" aria-label="Our Team"><div className="page-shell">
    <Reveal><div className="section-heading"><div><Eyebrow>Our team</Eyebrow><h2>NEW CREATION BEZER</h2></div><p>Meet the team developing<br/>the Community Energy Ecosystem.</p></div></Reveal>
    <div className="portrait-series grid gap-x-6 gap-y-9 md:grid-cols-3">{team.map((person,index)=><Reveal key={person.driveId} delay={index*.07}>
      <figure className="group relative" data-drive-id={person.driveId}><TeamPortrait person={person}/>
        <figcaption className="mt-5 flex items-start justify-between gap-3 border-t border-[#c6d3c5] pt-4"><div><p className="little-label text-[#627760]">ORAYAH DYNAMIS</p><h3 className="mt-2 text-[clamp(1.25rem,1.8vw,2rem)] leading-tight font-medium tracking-[-.045em]" style={person.driveId === 'r1' ? { wordSpacing: '0.12em' } : undefined}>{person.name}</h3><p className="mt-2 text-[13px] text-[#586b59]">{person.role}</p></div><span aria-hidden="true" className="pt-1 font-mono text-[10px] tracking-widest text-[#71856d]">0{index+1}</span></figcaption>
      </figure>
    </Reveal>)}</div>
  </div></section>
}

export function Footer() {
  return <footer id="contact" className="site-footer"><div className="page-shell">
    <div className="footer-top"><a href="#home" aria-label="ORAYAH DYNAMIS home"><Brand/></a><p>Generate.Store.Connect.Empower</p><a href="#home" className="back-top">Back to top <ArrowUp size={15}/></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} ORAYAH DYNAMIS</span><nav aria-label="Footer navigation"><a href="#solution">Our solution</a><a href="#systems">Core systems</a><a href="#architecture">Technology</a><a href="#team">Our team</a></nav><span className="footer-concept"><Check size={12}/>Concept & prototype design</span></div></div></footer>
}
