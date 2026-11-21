import { useState, type FormEvent } from 'react'
import { ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, Mail } from 'lucide-react'
import { contactEmail } from '../lib/content'
import { Eyebrow } from './UI'

export function ContactForm() {
  const [prepared, setPrepared] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [values, setValues] = useState({ name: '', email: '', organisation: '', interest: 'Engineering discussion', message: '' })
  const update = (key: keyof typeof values, value: string) => setValues(v => ({ ...v, [key]: value }))
  const subject = `${values.interest} — ORAYAH DYNAMIS`
  const body = `Hello ORAYAH team,\n\n${values.message.trim()}\n\n${values.name.trim()}${values.organisation.trim() ? `\n${values.organisation.trim()}` : ''}\n${values.email.trim()}`
  const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const message = e.currentTarget.elements.namedItem('message') as HTMLTextAreaElement
    if (!values.message.trim()) {
      message.setCustomValidity('Please include a message about your enquiry.')
      message.reportValidity()
      message.setCustomValidity('')
      return
    }
    setPrepared(true)
  }
  function download() {
    const raw = `To: ${contactEmail}\r\nSubject: ${subject}\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nX-Unsent: 1\r\n\r\n${body.replace(/\n/g, '\r\n')}`
    const url = URL.createObjectURL(new Blob([raw], { type: 'message/rfc822' })); const a = document.createElement('a'); a.href = url; a.download = 'ORAYAH-partnership-enquiry.eml'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  async function copy() { try { await navigator.clipboard.writeText(`To: ${contactEmail}\nSubject: ${subject}\n\n${body}`); setCopied(true); setTimeout(() => setCopied(false), 2500) } catch { setCopyFailed(true) } }
  return <div className="contact-form-wrap"><Eyebrow>Get in touch</Eyebrow>{!prepared ? <><h3>Start a conversation.</h3><p className="form-intro">Tell us where your interests meet community energy.</p><form onSubmit={submit}><div className="form-grid"><label>Your name <span>*</span><input autoComplete="name" name="name" required maxLength={100} value={values.name} onChange={e => update('name', e.target.value)} placeholder="Full name" pattern=".*\S.*"/></label><label>Email address <span>*</span><input autoComplete="email" name="email" type="email" required maxLength={160} value={values.email} onChange={e => update('email', e.target.value)} placeholder="you@organisation.com"/></label></div><label>Organisation <small>(optional)</small><input name="organisation" autoComplete="organization" maxLength={150} value={values.organisation} onChange={e => update('organisation', e.target.value)} placeholder="Company or institution"/></label><label>Area of interest<select name="interest" value={values.interest} onChange={e => update('interest', e.target.value)}>{['Engineering discussion','Research collaboration','Community partnership','General enquiry'].map(s => <option key={s}>{s}</option>)}</select></label><label>Your message <span>*</span><textarea name="message" required rows={4} maxLength={3000} value={values.message} onChange={e => update('message', e.target.value)} placeholder="How would you like to collaborate?"/></label><button className="button button-forest form-submit" type="submit">Prepare enquiry <ArrowRight size={16}/></button><p className="form-privacy"><Mail size={14}/>Creates a draft for your email app. No message is sent automatically.</p></form></> : <div className="draft-ready"><span className="draft-icon"><Mail size={25}/></span><h3>Your enquiry is ready.</h3><p>Review your draft, then open your email app to send it. Your enquiry has not been sent yet.</p><div className="draft-preview"><small>TO</small><b>{contactEmail}</b><small>SUBJECT</small><b>{subject}</b><div>{body}</div></div><a className="button button-forest form-submit" href={mailto}>Open email app<ArrowUpRight size={16}/></a><div className="draft-options"><button onClick={download}><ArrowDownToLine size={14}/>Download draft</button><button onClick={copy}>{copied ? <Check size={14}/> : <Copy size={14}/>}<span aria-live="polite">{copied ? 'Copied' : 'Copy message'}</span></button></div>{copyFailed && <p className="copy-help">Select the draft text above to copy it, or download the email draft.</p>}<button className="text-link edit-enquiry" onClick={() => setPrepared(false)}><ArrowLeft size={14}/>Edit enquiry</button></div>}</div>
}
