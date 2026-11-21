import { useId, useState } from 'react'
import { Activity, ArrowLeftRight, ArrowUpRight, BatteryCharging, Cable, Check, CircuitBoard, GitBranch, Hand, ListOrdered, Maximize2, Network, Pause, Play, Radio, SlidersHorizontal, Sun, Waves, Zap, type LucideIcon } from 'lucide-react'
import { usePrefersReducedMotion } from '../lib/motionPreference'
import { Eyebrow, Reveal } from './UI'
import type { NodeKey } from '../lib/content'

type ComponentInfo = { label: string; sub: string; name: string; group: string; description: string; icon: LucideIcon; x: number; y: number; w: number; h: number }
const nodes: Record<NodeKey, ComponentInfo> = {
  pv: { label: 'Solar PV array', sub: 'ORAYAH LUMEN', name: 'Solar photovoltaic array', group: 'Generation', icon: Sun, x: 24, y: 201, w: 151, h: 60, description: 'Solar cells convert sunlight into DC electricity. Their available power varies with irradiance, temperature, and operating point.' },
  boost: { label: 'Boost converter', sub: 'DC–DC conversion', name: 'PV boost converter', group: 'Power conversion', icon: Zap, x: 229, y: 201, w: 165, h: 60, description: 'The boost stage raises the PV voltage for the proposed DC bus. P&O MPPT adjusts its operating point; bus regulation and protection must be coordinated in the final design.' },
  mppt: { label: 'P&O MPPT', sub: 'Operating-point control', name: 'Maximum power point tracking', group: 'Generation control', icon: Activity, x: 229, y: 333, w: 165, h: 60, description: 'Perturb and Observe is a control algorithm, not a series power component. It adjusts the converter duty request to seek the maximum available PV power.' },
  bus: { label: 'Common DC bus', sub: '400V DC design target', name: 'The common 400V DC bus', group: 'Shared energy backbone', icon: GitBranch, x: 464, y: 194, w: 169, h: 74, description: 'A shared DC backbone links conditioned solar generation, managed battery storage, and the proposed distribution stages. 400V is a design target, not a measured prototype result.' },
  storageInterface: { label: 'Storage interface', sub: 'Bidirectional · proposed', name: 'Bidirectional storage interface', group: 'Storage coupling', icon: ArrowLeftRight, x: 464, y: 333, w: 169, h: 60, description: 'A suitably rated bidirectional converter is proposed between the battery and the DC bus. Voltage matching, isolation, switching, and protection are engineering requirements to validate—not a confirmed direct battery connection.' },
  battery: { label: 'Battery + BMS', sub: 'ORAYAH TAMID', name: 'Battery storage and protection', group: 'Storage', icon: BatteryCharging, x: 703, y: 333, w: 166, h: 60, description: 'The initial scope uses battery storage with monitoring, protection, and estimates of State of Charge and State of Health. Gravity storage and PCM thermal storage remain future research options.' },
  esp32: { label: 'ESP32 sensing', sub: 'Conditioned measurements', name: 'ESP32-based monitoring', group: 'Measurement layer', icon: Radio, x: 229, y: 38, w: 165, h: 60, description: 'Suitable isolated or conditioned sensor interfaces collect voltage, current, temperature, and power data. Dashed lines show information flow, not direct wiring from high-voltage equipment to an ESP32.' },
  iems: { label: 'ORAYAH GRID', sub: 'Supervisory IEMS', name: 'Intelligent Energy Management System', group: 'Energy intelligence', icon: Network, x: 464, y: 38, w: 169, h: 60, description: 'The proposed IEMS combines telemetry, predictive forecasts, and community priorities to coordinate generation, storage requests, and adaptive load schedules. Supervisory decisions do not replace local hardware protection.' },
  schedule: { label: 'Load scheduling', sub: 'Community priority rules', name: 'Priority-based load scheduling', group: 'Demand response', icon: ListOrdered, x: 938, y: 38, w: 164, h: 60, description: 'The scheduling layer proposes which loads to serve or defer when energy is limited. Its commands are logical setpoints: switching hardware, interlocks, and service priorities require a site-specific design.' },
  inverter: { label: 'AC inverter', sub: 'Single-phase · proposed', name: 'Single-phase inverter', group: 'AC conversion', icon: Waves, x: 703, y: 155, w: 166, h: 60, description: 'A proposed single-phase inverter converts energy from the common DC bus to a 230V AC distribution target. Filtering, earthing, isolation, and protection must be designed for the installation.' },
  dcConverter: { label: 'DC–DC stage', sub: 'Step-down · proposed', name: 'Low-voltage DC conversion', group: 'DC conversion', icon: SlidersHorizontal, x: 703, y: 244, w: 166, h: 60, description: 'A regulated step-down conversion stage is required for the proposed 48V DC branch. The 48V distribution is not a direct tap from the 400V bus; converter topology and isolation remain to be validated.' },
  acLoads: { label: 'AC distribution', sub: '230V AC · community loads', name: 'Community AC distribution', group: 'Proposed distribution', icon: Cable, x: 938, y: 155, w: 164, h: 60, description: 'The proposed 230V AC branch serves compatible community circuits through the inverter and appropriate distribution protection. The IEMS can request allocation according to agreed load priorities.' },
  dcLoads: { label: 'DC distribution', sub: '48V DC · compatible loads', name: 'Community DC distribution', group: 'Proposed distribution', icon: CircuitBoard, x: 938, y: 244, w: 164, h: 60, description: 'The proposed 48V DC branch supports suitable low-voltage loads after regulated conversion. Load compatibility, wiring, and protective devices require validation before implementation.' },
}
type Layer = 'energy' | 'monitoring' | 'control'
const layers: { key: Layer; name: string; color: string }[] = [ { key: 'energy', name: 'Energy flow', color: '#46795a' }, { key: 'monitoring', name: 'Monitoring', color: '#467c9b' }, { key: 'control', name: 'Control', color: '#aa7c3e' } ]
const paths: { d: string; type: Layer; bidirectional?: boolean }[] = [
  { d: 'M175 231 H226', type: 'energy' }, { d: 'M394 231 H461', type: 'energy' },
  { d: 'M633 231 H663 V185 H700', type: 'energy' }, { d: 'M663 231 V274 H700', type: 'energy' },
  { d: 'M869 185 H935', type: 'energy' }, { d: 'M869 274 H935', type: 'energy' },
  { d: 'M548 271 V330', type: 'energy', bidirectional: true }, { d: 'M636 363 H700', type: 'energy', bidirectional: true },
  { d: 'M417 231 V132 H289 V101', type: 'monitoring' }, { d: 'M816 333 V317 H444 V119 H344 V101', type: 'monitoring' }, { d: 'M394 67 H461', type: 'monitoring' },
  { d: 'M633 67 H935', type: 'control' }, { d: 'M1019 98 V152', type: 'control' }, { d: 'M1102 67 H1118 V274 H1105', type: 'control' },
  { d: 'M312 333 V264', type: 'control' }, { d: 'M492 98 V153 H367 V198', type: 'control' }, { d: 'M602 98 V132 H683 V317 H609 V330', type: 'control' },
]
type DiagramProps = { selected: NodeKey; onSelect: (node: NodeKey) => void; onExpand?: () => void }

export function Diagram({ selected, onSelect, onExpand }: DiagramProps) {
  const [visible, setVisible] = useState<Record<Layer, boolean>>({ energy: true, monitoring: true, control: true })
  const [paused, setPaused] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const chosen = nodes[selected]
  return <div className="diagram-board">
    <div className="diagram-topbar"><div className="diagram-map-title"><Network size={18}/><strong>Ecosystem map</strong><span className="concept-tag">Proposed design</span></div><div className="diagram-tools"><button className="diagram-tool" onClick={() => setPaused(!paused)} aria-label={paused ? 'Resume flow animation' : 'Pause flow animation'} title={paused ? 'Resume animation' : 'Pause animation'} disabled={!!reducedMotion}>{paused ? <Play size={15}/> : <Pause size={15}/>}</button>{onExpand && <button className="diagram-tool" onClick={onExpand} aria-label="Expand architecture diagram" title="Expand diagram"><Maximize2 size={16}/></button>}</div></div>
    <div className="diagram-legend"><span className="little-label">VIEW LAYERS</span>{layers.map(layer => <button key={layer.key} className={`layer-button ${visible[layer.key] ? 'layer-on' : ''}`} onClick={() => setVisible(v => ({ ...v, [layer.key]: !v[layer.key] }))} aria-pressed={visible[layer.key]}><span className={`layer-sample ${layer.key}`} style={{ borderColor: layer.color }}/>{layer.name}{visible[layer.key] && <Check size={11}/>}</button>)}</div>
    <div className="diagram-scroll" tabIndex={0} role="region" aria-label="Interactive microgrid map; scroll horizontally on small screens">
      <svg className="diagram-svg" viewBox="0 0 1140 432" aria-label="Proposed ORAYAH system architecture. Select any component for its technical description.">
        <defs><pattern id={`dots-${id}`} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".85" fill="#c4d2c5"/></pattern>{layers.map(l => <marker key={l.key} id={`${l.key}-${id}`} viewBox="0 0 8 8" refX="6.5" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="m0 0 8 4-8 4 2-4Z" fill={l.color}/></marker>)}</defs>
        <rect width="1140" height="432" fill="#f7f9f5"/><rect width="1140" height="432" fill={`url(#dots-${id})`}/>
        <text x="25" y="39" className="svg-lane-label">01 / INTELLIGENCE</text><text x="25" y="178" className="svg-lane-label">02 / POWER PATH</text><text x="25" y="328" className="svg-lane-label">03 / SUPPORT</text>
        {paths.map((p, i) => { const l = layers.find(t => t.key === p.type)!; return <g key={i} opacity={visible[p.type] ? 1 : 0} className="diagram-edge"><path d={p.d} fill="none" stroke={l.color} strokeWidth={p.type === 'energy' ? 2.1 : 1.6} strokeDasharray={p.type === 'monitoring' ? '6 4' : p.type === 'control' ? '2 4' : undefined} strokeLinejoin="round" markerEnd={`url(#${p.type}-${id})`} markerStart={p.bidirectional ? `url(#${p.type}-${id})` : undefined}/>{visible[p.type] && !paused && !reducedMotion && p.type === 'energy' && <path d="m-4-3 5 3-5 3" stroke={l.color} strokeWidth="2" fill="none"><animateMotion dur={`${3+i%3}s`} repeatCount="indefinite" path={p.d} rotate="auto"/></path>}</g> })}
        {(Object.entries(nodes) as [NodeKey, ComponentInfo][]).map(([key, n]) => { const active = key === selected; const Icon = n.icon; return <g key={key} className={`diagram-node ${active ? 'node-selected' : ''}`} role="button" tabIndex={0} aria-label={`Inspect ${n.name}`} aria-pressed={active} onClick={() => onSelect(key)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(key) } }}>
          <title>{n.name} — select to inspect</title><rect x={n.x} y={n.y} width={n.w} height={n.h} rx="6" className="node-box"/><Icon x={n.x+12} y={n.y+n.h/2-17} width="17" height="17" strokeWidth="1.6" className="node-icon"/><text x={n.x+36} y={n.y+n.h/2-4} className="node-title">{n.label}</text><text x={n.x+13} y={n.y+n.h/2+15} className="node-subtitle">{n.sub}</text>
        </g> })}
      </svg>
    </div>
    <div className="diagram-mobile-hint"><Hand size={13}/>Swipe to explore · Tap a component</div>
    <div className="node-inspector" aria-live="polite" aria-atomic="true"><span className="inspector-icon"><chosen.icon size={24} strokeWidth={1.5}/></span><div><span className="little-label">COMPONENT INSIGHT <span>/</span> {chosen.group}</span><h4>{chosen.name}</h4><p>{chosen.description}</p></div></div>
    <div className="diagram-caption"><span><span className="small-dot"/>Select any component to inspect</span><span>Logical architecture · not a wiring diagram</span></div>
  </div>
}

const technologyLayers: {name:string; image:string; alt:string; items:NodeKey[]}[] = [
  {name:'Hardware',image:'/images/tamid.webp',alt:'Industrial storage cabinets illustrating the physical energy layer',items:['boost','storageInterface','battery','inverter','dcConverter']},
  {name:'Software & control',image:'/images/grid.webp',alt:'Controller circuitry illustrating the supervisory intelligence layer',items:['mppt','iems','schedule','esp32']},
]
export function Architecture({onInspect}:{onInspect:(node:NodeKey)=>void}) {
  const [layer,setLayer]=useState(0)
  const [selected,setSelected]=useState<NodeKey>('boost')
  const current=technologyLayers[layer], item=nodes[selected]
  return <section id="architecture" aria-label="Technology & Innovation" className="architecture-section section-space"><div className="page-shell">
    <Reveal><div className="section-heading"><div><Eyebrow>Technology & innovation</Eyebrow><h2>Inside the microgrid.</h2></div><p>Explore the power electronics and control logic behind the proposed ecosystem.</p></div></Reveal>
    <div className="tech-explorer"><div className="tech-image"><img key={current.image} src={current.image} alt={current.alt} loading="lazy" decoding="async"/><span className="little-label">ENGINEERING STUDY &nbsp; / &nbsp; 0{layer+1}</span></div><div className="tech-inspection">
      <div className="tech-layers" role="group" aria-label="Technology layer">{technologyLayers.map((l,i)=><button key={l.name} aria-pressed={i===layer} onClick={()=>{setLayer(i);setSelected(l.items[0])}}>{l.name}</button>)}</div>
      <div className="tech-parts" role="group" aria-label="Inspect a technology">{current.items.map(key=><button key={key} aria-pressed={selected===key} onClick={()=>setSelected(key)}>{nodes[key].label}</button>)}</div>
      <div className="tech-explanation" aria-live="polite"><item.icon size={27} strokeWidth={1.3}/><span className="little-label">{item.group}</span><h3>{item.name}</h3><p>{item.description}</p></div>
      <button className="text-link" onClick={()=>onInspect(selected)}>Locate in the energy-flow map <ArrowUpRight size={15}/></button>
    </div></div><p className="engineering-note">Proposed technologies. Equipment ratings, isolation, software behavior, and protection require engineering validation.</p>
  </div></section>
}
