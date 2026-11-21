import { Eyebrow, Reveal } from './UI'

const researchAreas = ['Power Systems', 'Inverters', 'Renewable Energy Systems', 'Power Quality']

export function Mentor() {
  return <section id="mentor" aria-labelledby="mentor-heading" className="section-space border-t border-[#dce4d9] bg-white">
    <div className="page-shell">
      <Reveal><div className="section-heading"><div><Eyebrow>Our Mentor</Eyebrow><h2 id="mentor-heading">Guided By</h2></div></div></Reveal>
      <div className="grid items-center gap-9 md:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)] md:gap-[6vw]">
        <Reveal>
          <figure className="group relative mx-auto w-full max-w-[360px] border border-[#bfcfbc] bg-[#f4f6f4] p-2.5 sm:p-3.5 md:mx-0">
            <span aria-hidden="true" className="absolute -top-px -left-px h-9 w-9 border-t-2 border-l-2 border-forest"/>
            <div className="aspect-[276/354] overflow-hidden border border-[#d6e0d2] bg-white"><img src="/images/mentor/dr-e-latha-mercy.png" width={276} height={354} alt="Portrait of Dr. E. Latha Mercy" loading="lazy" decoding="async" className="h-full w-full object-contain transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.015]"/></div>
            <span aria-hidden="true" className="absolute -right-px -bottom-px h-9 w-9 border-r-2 border-b-2 border-[#84a57a]"/>
          </figure>
        </Reveal>
        <Reveal className="min-w-0 max-w-2xl" delay={.08}>
          <h3 className="text-[clamp(1.8rem,3vw,3.5rem)] leading-[1.12] font-medium tracking-[-.055em] text-charcoal">Dr. E. Latha Mercy</h3>
          <p className="mt-2 text-sm font-semibold text-forest">Project Mentor</p>
          <div className="mt-6 border-l-2 border-[#92ad86] pl-4 text-[13px] leading-6 text-[#586a58] sm:text-sm">
            <p className="font-semibold text-charcoal">Professor and Head</p>
            <p>Department of Electrical and Electronics Engineering (EEE)</p>
            <p>Government College of Technology, Coimbatore</p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-[#dbe4d8] py-5">
            <dl><dt className="little-label text-[#627760]">Qualifications</dt><dd className="mt-1.5 text-base font-medium text-charcoal">B.E., M.E., Ph.D.</dd></dl>
            <p className="inline-flex items-center gap-2 rounded-sm bg-[#edf3e9] px-3 py-2 text-xs font-medium text-forest"><strong className="text-xl leading-none font-semibold tracking-tight">38+</strong> Years of Experience</p>
          </div>
          <h4 className="little-label mt-6 text-[#627760]">Research areas</h4>
          <ul className="mt-3 flex flex-wrap gap-2">{researchAreas.map(area => <li key={area} className="rounded-sm border border-[#d5e0d1] px-3 py-1.5 text-xs text-[#425c44]">{area}</li>)}</ul>
        </Reveal>
      </div>
    </div>
  </section>
}
