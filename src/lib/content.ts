import { Sun, BatteryCharging, Network, Activity, ScanLine, CalendarClock, ListOrdered, School, House, Cross, Droplets, Store, Landmark, Leaf, Blocks, UsersRound } from 'lucide-react'

export type SystemKey = 'lumen' | 'tamid' | 'grid'
export type AboutKey = 'vision' | 'challenge' | 'solution'
export type NodeKey = 'pv' | 'boost' | 'mppt' | 'bus' | 'storageInterface' | 'battery' | 'esp32' | 'iems' | 'schedule' | 'inverter' | 'dcConverter' | 'acLoads' | 'dcLoads'

export const systems = [
  {
    key: 'lumen' as SystemKey, number: '01', name: 'LUMEN', category: 'Generation', icon: Sun,
    title: 'Renewable energy generation', image: '/images/lumen.webp', imageAlt: 'Rows of photovoltaic panels below a mountain range',
    description: 'Capture sunlight. Make more of every available watt.',
    overview: 'ORAYAH LUMEN is the generation division of the ecosystem. It turns local sunlight into electrical energy and conditions it for the shared DC microgrid.',
    features: [ ['Solar photovoltaic generation', 'PV modules convert available sunlight into direct-current electricity.'], ['P&O maximum power point tracking', 'The Perturb and Observe algorithm adjusts the operating point to seek the maximum available solar power.'], ['Boost conversion', 'A DC–DC boost stage raises the PV voltage toward the common 400V DC bus design target.'] ],
    note: 'The 400V bus is a proposed design target. Converter sizing, operating range, and protection require engineering validation.', node: 'pv' as NodeKey,
  },
  {
    key: 'tamid' as SystemKey, number: '02', name: 'TAMID', category: 'Storage', icon: BatteryCharging,
    title: 'Intelligent energy storage', image: '/images/tamid.webp', imageAlt: 'Modular battery storage cabinets in a wooded landscape',
    description: 'Store surplus energy. Make it available when needed.',
    overview: 'ORAYAH TAMID provides the proposed prototype’s battery storage layer, balancing the timing of solar generation with a community’s electricity needs.',
    features: [ ['Battery energy storage', 'Surplus generation can charge batteries, with discharge scheduled when local supply is limited.'], ['Monitoring and protection', 'A battery management system monitors safe operating limits and coordinates charge and discharge permissions.'], ['SoC and SoH estimation', 'State of Charge indicates available charge; State of Health describes battery condition relative to its original capability.'] ],
    note: 'Future research only: gravity-based energy storage and Phase Change Material (PCM) thermal storage are not part of the initial battery prototype. PCM stores heat, not electricity.', node: 'battery' as NodeKey,
  },
  {
    key: 'grid' as SystemKey, number: '03', name: 'GRID', category: 'Intelligence', icon: Network,
    title: 'Intelligent energy management', image: '/images/grid.webp', imageAlt: 'Close-up of an energy management microcontroller and its circuit paths',
    description: 'Connect measurements, forecasts, and community priorities.',
    overview: 'ORAYAH GRID is the supervisory intelligence of the ecosystem. Its proposed Intelligent Energy Management System (IEMS) coordinates generation, storage, and demand.',
    features: [ ['Predict and schedule', 'Generation and demand forecasts inform adaptive battery and load schedules.'], ['Respond to demand', 'AI-assisted demand response is a proposed decision-support capability, with priority rules and protection limits kept explicit.'], ['Monitor and detect faults', 'ESP32-based telemetry provides voltage, current, temperature, and power data to help identify abnormal conditions.'] ],
    note: 'Forecasting and AI-assisted scheduling are proposed capabilities, not validated performance claims. Protective hardware remains independent of supervisory AI decisions.', node: 'iems' as NodeKey,
  },
]

export const aboutItems: { key: AboutKey; label: string; text: string }[] = [
  { key: 'vision', label: 'About ORAYAH', text: 'ORAYAH DYNAMIS is a proposed decentralized energy ecosystem. Local renewable generation, battery storage, and intelligent management share a common DC microgrid, so communities can plan how they generate, store, and use power.' },
  { key: 'challenge', label: 'The challenge', text: 'Sunlight and demand rarely follow the same schedule. An unreliable grid can leave essential services exposed, while unused solar energy and diesel backup add avoidable waste and dependence.' },
  { key: 'solution', label: 'Our solution', text: 'LUMEN captures solar energy, TAMID stores the surplus, and GRID coordinates the two with community demand. A shared DC bus connects the energy stages, while forecasts and agreed priority rules guide distribution.' },
]

export const processSteps = [
  { name: 'Generate', icon: Sun, title: 'It begins with sunlight.', text: 'Solar photovoltaic panels convert locally available sunlight into DC electricity. This is the renewable input to the ORAYAH ecosystem.', division: 'ORAYAH LUMEN', image: '/images/lumen.webp', alt: 'Solar panels capturing daylight', detail: 'Sunlight → DC electricity' },
  { name: 'Optimize', icon: Activity, title: 'Find the available power.', text: 'Perturb and Observe MPPT adjusts the PV operating point as sunlight changes. A boost converter conditions the output for the proposed 400V DC bus.', division: 'ORAYAH LUMEN', image: '/images/lumen.webp', alt: 'Photovoltaic generation array', detail: 'P&O tracking → boost conversion' },
  { name: 'Store', icon: BatteryCharging, title: 'Save energy for later.', text: 'When generation exceeds immediate demand, surplus power can charge the battery through a managed bidirectional interface. Battery protection limits take precedence over the schedule.', division: 'ORAYAH TAMID', image: '/images/tamid.webp', alt: 'Modular battery energy storage cabinets', detail: 'Surplus generation → battery storage' },
  { name: 'Monitor', icon: ScanLine, title: 'Give the system a clear picture.', text: 'ESP32-based monitoring collects voltage, current, temperature, and power measurements through suitable sensor interfaces. These measurements inform system-level decisions.', division: 'ORAYAH GRID', image: '/images/grid.webp', alt: 'Microcontroller used to illustrate system telemetry', detail: 'Sensor measurements → system telemetry' },
  { name: 'Predict', icon: Activity, title: 'Look beyond the present moment.', text: 'The proposed IEMS evaluates generation patterns, energy availability, and expected demand. Forecasts help anticipate a surplus or a shortfall rather than only reacting to it.', division: 'ORAYAH GRID', image: '/images/grid.webp', alt: 'Processing electronics for intelligent energy management', detail: 'Measured patterns → energy forecasts' },
  { name: 'Manage', icon: CalendarClock, title: 'Coordinate a shared resource.', text: 'Adaptive scheduling balances available solar power, battery condition, and community needs. The proposed IEMS requests charging, discharging, or flexible demand adjustments within safety limits.', division: 'ORAYAH GRID', image: '/images/tamid.webp', alt: 'Coordinated battery storage modules', detail: 'Forecasts + operating limits → schedule' },
  { name: 'Prioritize', icon: ListOrdered, title: 'Put essential needs first.', text: 'When energy is limited, community-defined rules give critical circuits priority. Flexible loads can be shifted in time while healthcare, safe water, and other essential services are protected where capacity permits.', division: 'ORAYAH GRID', image: '/images/community.webp', alt: 'Rural community served by local infrastructure', detail: 'Community priorities → load allocation' },
]

export const applications = [
  { name: 'Households', icon: House, text: 'Lighting, communication, and everyday household needs.', balanced: 'Normal scheduling', limited: 'Essential circuits first' },
  { name: 'Healthcare centres', icon: Cross, text: 'Priority circuits for clinics and essential care services.', balanced: 'Care circuits scheduled', limited: 'Critical care prioritized' },
  { name: 'Education', icon: School, text: 'Classroom lighting, learning equipment, and connectivity.', balanced: 'Learning loads scheduled', limited: 'Flexible loads shifted' },
  { name: 'Water pumping', icon: Droplets, text: 'Pumping schedules aligned with local water needs.', balanced: 'Pumping scheduled', limited: 'Essential pumping first' },
  { name: 'Small businesses', icon: Store, text: 'Productive energy for local shops and enterprises.', balanced: 'Business loads scheduled', limited: 'Flexible use deferred' },
  { name: 'Community services', icon: Landmark, text: 'Shared facilities, communications, and safety services.', balanced: 'Services scheduled', limited: 'Safety services first' },
]

export const benefits = [
  { icon: Leaf, title: 'Use more local renewables.', text: 'Better coordination is intended to improve solar energy use and reduce dependence on conventional grid electricity and diesel backup.' },
  { icon: Blocks, title: 'Build for a longer life.', text: 'A modular, repairable architecture is intended to simplify maintenance and allow generation and storage capacity to grow with community needs.' },
  { icon: UsersRound, title: 'Plan for interruptions.', text: 'Battery reserves and locally agreed priorities are intended to support essential services during limited supply, not guarantee uninterrupted power. Community ownership and peer-to-peer sharing remain longer-term possibilities.' },
]

export const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'hello@orayahdynamis.com'
export function goTo(id: string) {
  window.setTimeout(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
    window.history.replaceState(null, '', `#${id}`)
  }, 30)
}
