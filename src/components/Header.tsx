import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Brand } from './UI'

const chapters = [['The Reliability Problem','challenge'], ['Our solution','solution'], ['How it works','process'], ['Three core systems','systems'], ['Technology & innovation','architecture'], ['Real-world applications','applications'], ['Impact & sustainability','sustainability'], ['Our team','team']] as const
const links = [['The Reliability Problem','challenge'], ['Our solution','solution'], ['Systems','systems'], ['Technology','architecture'], ['Applications','applications'], ['Our team','team']] as const
export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('home')
  const [mobile, setMobile] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('main > section[id]'))
    const update = () => {
      setScrolled(window.scrollY > 54)
      let id='home'
      for(const section of sections) if(section.getBoundingClientRect().top <= 130) id = section.id
      setActive(id === 'process' ? 'solution' : id === 'sustainability' ? 'applications' : id)
    }
    update(); window.addEventListener('scroll',update,{passive:true})
    const outside = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setMobile(false) }
    const key = (e: KeyboardEvent) => { if(e.key==='Escape') { setMobile(false);if(window.innerWidth<1000 && ref.current?.contains(document.activeElement)) menuButton.current?.focus() } }
    document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key)
    return () => { window.removeEventListener('scroll',update);document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key) }
  }, [])
  return <header ref={ref} className={`site-header od-masthead ${scrolled || mobile ? 'is-solid' : ''}`} onBlur={e=>{if(e.relatedTarget&&!e.currentTarget.contains(e.relatedTarget as Node))setMobile(false)}}>
    <div className="page-shell header-inner"><a className="brand-home" href="#home" aria-label="ORAYAH DYNAMIS home" onClick={()=>setMobile(false)}><Brand/></a>
      <nav className="desktop-nav" aria-label="Main navigation">{links.map(([name,id])=><a key={id} href={`#${id}`} className={`nav-link ${active===id ? 'is-current' : ''}`} aria-current={active===id?'location':undefined}>{name}</a>)}</nav>
      <div className="header-actions"><button ref={menuButton} className="mobile-toggle" aria-label={mobile?'Close navigation':'Open navigation'} aria-expanded={mobile} aria-controls="mobile-navigation" onClick={()=>setMobile(!mobile)}>{mobile?<X size={21}/>:<Menu size={21}/>}</button></div>
    </div>
    <AnimatePresence>{mobile && <motion.nav id="mobile-navigation" aria-label="Mobile navigation" className="mobile-nav" initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} transition={{duration:.18}}>{chapters.map(([name,id],i)=><a key={id} href={`#${id}`} onClick={()=>setMobile(false)}><small>0{i+1}</small>{name}<ArrowUpRight size={15}/></a>)}</motion.nav>}</AnimatePresence>
  </header>
}
