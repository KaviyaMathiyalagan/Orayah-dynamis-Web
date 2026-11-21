import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Box, ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react'
import type { SystemKey } from '../lib/content'
import type { SceneMotion } from './hero/EcosystemScene'
import { usePrefersReducedMotion } from '../lib/motionPreference'

const Scene=lazy(()=>import('./hero/EcosystemScene'))
export function ModelPlate({view}:{view:'ecosystem'|SystemKey}) {
  const mount=useRef<HTMLElement>(null), label=useRef<HTMLDivElement>(null)
  const state=useRef<SceneMotion>({x:0,y:0,scroll:0,orbit:0,tilt:0,dragging:false})
  const [load,setLoad]=useState(false),[visible,setVisible]=useState(false),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[paused,setPaused]=useState(false)
  const reduced=usePrefersReducedMotion()
  const onReady=useCallback(()=>setReady(true),[]),onError=useCallback(()=>setFailed(true),[])
  useEffect(()=>{
    const target=mount.current
    if(!target)return
    let inFrame=false
    const update=()=>setVisible(inFrame&&!document.hidden)
    const io=new IntersectionObserver(([e])=>{inFrame=e.isIntersecting;if(inFrame)setLoad(true);update()},{threshold:.04})
    io.observe(target);document.addEventListener('visibilitychange',update)
    return()=>{io.disconnect();document.removeEventListener('visibilitychange',update)}
  },[])
  const rotate=(delta:number|null)=>{state.current.orbit=delta===null?0:state.current.orbit+delta;mount.current?.querySelector('.od-stage')?.dispatchEvent(new Event('model-change'))}
  const title=view==='ecosystem'?'Community energy ecosystem':`ORAYAH ${view.toUpperCase()}`
  return <figure ref={mount} className={`model-plate model-plate-${view}`} aria-label={`${title} interactive 3D concept study`}>
    <div className="model-plate-top"><span><Box size={12}/>3D CONCEPT STUDY</span><span>{view==='ecosystem'?'SYSTEM OVERVIEW':view.toUpperCase()}</span></div>
    <div className="od-stage model-plate-stage" aria-busy={!ready&&!failed}>
      {load&&!failed&&<Suspense fallback={null}><Scene view={view} label={label} motionState={state} compact={window.innerWidth<760} reduced={reduced} paused={paused} visible={visible} onReady={onReady} onError={onError}/></Suspense>}
      {failed?<div className="model-plate-fallback"><Box size={22}/><p>3D rendering is unavailable in this browser.</p><span>The accompanying description explains this concept.</span></div>:!ready&&<div className="od-loader" role="status"><Box size={21} className="mx-auto mb-2"/><span>Preparing model</span><div className="od-loader-track"/></div>}
    </div>
    <figcaption className="model-plate-bottom"><span>{title}<small>Illustrative design · not an installed system</small></span>{ready&&!failed&&<div className="plate-controls" role="group" aria-label="Model view controls"><button aria-label="Rotate model left" onClick={()=>rotate(-.29)}><ChevronLeft size={14}/></button><button aria-label="Rotate model right" onClick={()=>rotate(.29)}><ChevronRight size={14}/></button>{!reduced&&<button aria-label={paused?'Resume model motion':'Pause model motion'} aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?<Play size={12}/>:<Pause size={12}/>}</button>}<button aria-label="Reset model angle" onClick={()=>rotate(null)}><RotateCcw size={12}/></button></div>}</figcaption>
  </figure>
}
