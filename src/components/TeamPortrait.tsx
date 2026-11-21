import { useRef, useState, type ChangeEvent } from 'react'
import { ArrowUpRight, Download, ImagePlus, RotateCcw } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eyebrow, Modal } from './UI'
import { usePrefersReducedMotion } from '../lib/motionPreference'

type Member = { name: string; role: string; image: string; width: number; height: number; department: string; institution: string; qualification?: string; specialization?: string }

export function TeamPortrait({ person }: { person: Member }) {
  const original = `/images/team/${person.image}.webp`
  const key = `orayah.portraits.v1.${person.image}`
  const [saved, setSaved] = useState<string | null>(() => {
    try { const value = localStorage.getItem(key); return value?.startsWith('data:image/webp;base64,') ? value : null } catch { return null }
  })
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const profileTrigger = useRef<HTMLButtonElement>(null)
  const request = useRef(0)
  const reduced = usePrefersReducedMotion()
  const close = () => { request.current++; setOpen(false); setBusy(false) }
  async function choose(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 12 * 1024 * 1024) {
      setNotice('Choose a JPG, PNG, or WebP image no larger than 12 MB.'); return
    }
    const version = ++request.current
    const url = URL.createObjectURL(file)
    setBusy(true); setNotice('Preparing your portrait…')
    try {
      const image = new Image(); image.src = url; await image.decode()
      if (version !== request.current) return
      const ratio = Math.min(1, 2048 / Math.max(image.naturalWidth, image.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio)); canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio))
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Image conversion unavailable')
      ctx.imageSmoothingQuality = 'high'; ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      const result = canvas.toDataURL('image/webp', .95)
      if (!result.startsWith('data:image/webp;base64,')) throw new Error('WebP export unavailable')
      setDraft(result); setNotice('Preview ready. Save to apply this photo to this member only.')
    } catch { if (version === request.current) setNotice('This image could not be opened. Please choose another portrait.') }
    finally { URL.revokeObjectURL(url); if (version === request.current) setBusy(false) }
  }
  function save() {
    try {
      if (draft) localStorage.setItem(key, draft); else localStorage.removeItem(key)
      setSaved(draft); setNotice(draft ? 'Portrait saved in this browser.' : 'Original portrait restored.')
    } catch { setNotice('Browser storage is unavailable or full. Download the replacement below instead.') }
  }
  return <>
    <button ref={profileTrigger} type="button" className="absolute inset-0 z-10 w-full rounded-sm bg-transparent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest" aria-haspopup="dialog" aria-expanded={open} aria-label={`View profile of ${person.name}, ${person.role}`} onClick={() => { setDraft(saved); setNotice(''); setOpen(true) }}/>
    <div className="portrait-frame relative block aspect-[4/5] w-full overflow-hidden rounded-sm bg-[#e5e9e2]">
      <img src={saved || original} width={person.width} height={person.height} alt={`Professional portrait of ${person.name}`} loading="lazy" decoding="async" className="h-full w-full object-cover object-top transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.035] motion-safe:group-focus-within:scale-[1.035]"/>
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t from-[#10251d55] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"/>
      <span aria-hidden="true" className="absolute right-4 bottom-4 flex items-center justify-center gap-2 rounded-full border border-white/60 bg-[#183d30]/85 px-3 py-2 text-[10px] font-semibold tracking-wide text-white backdrop-blur-sm transition-all duration-300 sm:translate-y-1 sm:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">View profile <ArrowUpRight size={14} strokeWidth={1.5}/></span>
    </div>
    <AnimatePresence onExitComplete={() => requestAnimationFrame(() => profileTrigger.current?.focus({ preventScroll: true }))}>{open && <Modal key={person.image} title={`${person.name} — member profile`} onClose={close}>
      <motion.div className="grid sm:grid-cols-[.9fr_1.1fr]" initial={reduced ? false : {opacity:0,y:8}} animate={{opacity:1,y:0}} exit={reduced ? {opacity:1} : {opacity:0,y:5}} transition={{duration:reduced ? 0 : .2,ease:'easeOut'}}>
        <div className="relative h-[34svh] min-h-44 overflow-hidden bg-[#e6eae3] sm:h-full sm:min-h-[420px]">
          <motion.img key={draft || original} src={draft || original} alt={`Full portrait of ${person.name}`} className="absolute inset-0 h-full w-full object-contain" initial={reduced ? false : { opacity: .4 }} animate={{ opacity: 1 }} transition={{ duration: .25 }}/>
        </div>
        <div className="p-6 sm:py-10"><Eyebrow>NEW CREATION BEZER</Eyebrow><h3 className="mt-4 text-[28px] leading-tight font-medium tracking-[-.05em]">{person.name}</h3><p className="mt-2 text-sm font-medium text-[#44654b]">{person.role}</p>
          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-[#d4dfcf] pt-5">
            {person.qualification && <div><dt className="little-label text-[#657c62]">Qualification</dt><dd className="mt-1.5 text-sm">{person.qualification}</dd></div>}
            <div><dt className="little-label text-[#657c62]">Department</dt><dd className="mt-1.5 text-sm">{person.department}</dd></div>
            {person.specialization && <div className="col-span-2"><dt className="little-label text-[#657c62]">Specialization</dt><dd className="mt-1.5 text-sm leading-6">{person.specialization}</dd></div>}
            <div className="col-span-2"><dt className="little-label text-[#657c62]">Institution</dt><dd className="mt-1.5 text-sm leading-6">{person.institution}</dd></div>
          </dl>
          <details className="mt-6 border-t border-[#d4dfcf] pt-4"><summary className="cursor-pointer text-[11px] font-semibold text-[#526b50]">Portrait options</summary>
          <div className="pt-4"><p className="little-label text-[#61795b]">Individual portrait</p><p className="mt-2 text-xs leading-5 text-[#647360]">Choose a replacement to preview it. Saving changes only this member’s photo in this browser.</p>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" aria-label={`Replacement photo for ${person.name}`} hidden onChange={choose}/>
            <button type="button" className="button button-forest mt-4 w-full" disabled={busy} onClick={() => fileInput.current?.click()}><ImagePlus size={15}/>{busy ? 'Preparing photo…' : 'Replace photo'}</button>
            <p className="mt-2 text-center text-[10px] text-[#6b7767]">JPG, PNG or WebP · Up to 12 MB</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2"><button type="button" className="text-link disabled:opacity-40" disabled={busy || draft === saved} onClick={save}>Save portrait</button><button type="button" className="inline-flex items-center gap-1.5 text-[11px] text-[#586c53] disabled:opacity-40" disabled={busy || !draft} onClick={() => { setDraft(null); setNotice('Original portrait selected. Save to confirm.') }}><RotateCcw size={12}/>Restore original</button></div>
            <p role="status" className="mt-3 text-[11px] leading-5 text-[#496c41]">{notice}</p>
          </div>
          <details className="mt-4 border-t border-[#d4dfcf] pt-3 text-[11px] leading-5 text-[#60705c]"><summary className="cursor-pointer font-semibold text-[#3d5836]">Publish a replacement</summary><p className="mt-2">Download this portrait, replace <code className="break-all text-[10px]">public{original}</code> in the site project, then redeploy. The other portraits are unaffected.</p><a className="mt-2 inline-flex items-center gap-2 font-semibold text-forest" href={draft || original} download={`${person.image}.webp`}><Download size={13}/>Download portrait file</a></details>
          </details>
        </div>
      </motion.div>
    </Modal>}</AnimatePresence>
  </>
}
