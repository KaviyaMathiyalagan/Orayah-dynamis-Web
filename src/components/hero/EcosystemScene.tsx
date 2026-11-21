import { Component, useEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as T from 'three'
import { createEnergyModel } from './energyModel'

export interface SceneMotion { x: number; y: number; scroll: number; orbit: number; tilt: number; dragging: boolean }
export interface SceneProps {
  view?: 'ecosystem' | 'lumen' | 'tamid' | 'grid'
  motionState: RefObject<SceneMotion>
  label: RefObject<HTMLDivElement | null>
  compact: boolean
  reduced: boolean
  paused: boolean
  visible: boolean
  onReady: () => void
  onError: () => void
}

function Maquette({ motionState, compact, reduced, paused, visible, label, onReady, onError, view = 'ecosystem' }: SceneProps) {
  const atlas = useThree(s => s.gl)
  const economy = useMemo(() => {
    const context=atlas.getContext(),debug=context.getExtension('WEBGL_debug_renderer_info')
    return !!debug && /swiftshader|llvmpipe|software/i.test(context.getParameter(debug.UNMASKED_RENDERER_WEBGL))
  }, [atlas])
  const model = useMemo(() => createEnergyModel(compact,economy,view), [compact,economy,view])
  const rig = useRef<T.Group>(null)
  const moving = useRef<T.InstancedMesh>(null)
  const invalidate = useThree(s => s.invalidate)
  const clock = useRef(0)
  const ready = useRef(false)
  const baked = useRef('')
  const target = useRef(new T.Vector3())
  const dummy = useMemo(() => new T.Object3D(), [])
  const cameraState = useRef({ yaw: .56, pitch: .555, distance: 28 })
  const currentSize = useThree(s => s.size)
  useEffect(() => { invalidate() }, [paused, reduced, currentSize, invalidate])
  useEffect(() => {
    const el = atlas.domElement
    const viewer = el.closest('.od-stage')
    const redraw = () => invalidate()
    viewer?.addEventListener('model-change', redraw)
    el.addEventListener('webglcontextlost', onError)
    return () => { viewer?.removeEventListener('model-change', redraw); el.removeEventListener('webglcontextlost', onError) }
  }, [atlas, invalidate, onError])
  useEffect(() => () => model.dispose(), [model])
  useEffect(() => {
    if (!visible || paused || reduced) return
    // Capped, demand-driven rendering avoids queuing GPU work on integrated
    // hardware. Hidden or paused scenes render nothing until interacted with.
    const interval = 1000 / (economy ? 16 : compact ? 35 : 60)
    let frame = 0, last = 0
    const tick = (now: number) => { if(now-last >= interval-1) { invalidate();last=now } frame=requestAnimationFrame(tick) }
    frame=requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [economy, compact, reduced, paused, visible, invalidate])
  useFrame(({ camera, size, gl }, elapsed) => {
    if (!rig.current) return
    if(baked.current !== model.root.uuid) {
      // Lighting is fixed in model space: bake shadow maps once per LOD,
      // not once per camera/pulse update.
      gl.shadowMap.autoUpdate=false;gl.shadowMap.needsUpdate=true
      baked.current=model.root.uuid
    }
    const data = motionState.current
    const dt = Math.min(elapsed, .16)
    if (!paused && !reduced) clock.current += dt
    const t = clock.current
    const blend = reduced || paused || !ready.current ? 1 : 1-Math.exp(-dt*4.8)
    const p = reduced ? 0 : data.scroll
    const angle = .55 + data.orbit + (reduced ? 0 : Math.sin(t*.075)*.068 + data.x*.044 + p*.145)
    const pitch = .62 + data.tilt + (reduced ? 0 : data.y*.016 + p*.165)
    cameraState.current.yaw = T.MathUtils.lerp(cameraState.current.yaw, angle, blend)
    cameraState.current.pitch = T.MathUtils.lerp(cameraState.current.pitch, pitch, blend)
    const lens = camera as T.PerspectiveCamera
    const frameWidth = {ecosystem:compact ? 17.6 : 17.55,lumen:9.5,tamid:6.9,grid:5.9}[view]
    const frameHeight = {ecosystem:9.35,lumen:6.05,tamid:3.9,grid:3.95}[view]
    const dist = Math.max(frameWidth/(size.width/size.height), frameHeight)/(2*Math.tan(T.MathUtils.degToRad(lens.fov/2))) * (1+p*.14)
    cameraState.current.distance = T.MathUtils.lerp(cameraState.current.distance,dist,blend)
    const {yaw, pitch: elevation, distance}=cameraState.current
    const centreY = view === 'ecosystem' ? .39 : 0
    camera.position.set(Math.sin(yaw)*Math.cos(elevation)*distance, Math.sin(elevation)*distance+centreY, Math.cos(yaw)*Math.cos(elevation)*distance)
    camera.lookAt(0,centreY,0)
    rig.current.position.y = reduced ? 0 : Math.sin(t*.52)*.028
    if(label.current && !compact) {
      camera.updateMatrixWorld()
      target.current.set(1.11,2.47+rig.current.position.y,-.09).project(camera)
      label.current.style.setProperty('transform',`translate3d(${(target.current.x+1)*size.width*.5}px,${(1-target.current.y)*size.height*.5}px,0)`)
    }
    if(moving.current) {
      let index=0
      model.paths.forEach((path, i) => {
        const count = compact ? 1 : 2
        for(let j=0;j<count;j++) {
          const phase = (t*(.14+i*.007)+i*.181+j/count)%1
          path.getPointAt(phase,target.current)
          dummy.position.copy(target.current);dummy.position.y+=.036
          const tangent=path.getTangentAt(phase)
          dummy.rotation.set(0,Math.atan2(tangent.x,tangent.z),0)
          dummy.scale.set(.031,.021,.083);dummy.updateMatrix()
          moving.current!.setMatrixAt(index++,dummy.matrix)
        }
      })
      moving.current.instanceMatrix.needsUpdate=true
    }
    if(!ready.current) { ready.current=true; requestAnimationFrame(onReady) }
  })
  return <>
    <hemisphereLight args={['#dfe9f0', '#6a7265', .76]}/>
    <directionalLight position={[-6.5, 12, 6.5]} color="#fff1d9" intensity={3.15} castShadow shadow-mapSize-width={compact || economy ? 1024 : 2048} shadow-mapSize-height={compact || economy ? 1024 : 2048} shadow-camera-left={-9.8} shadow-camera-right={9.8} shadow-camera-top={8.7} shadow-camera-bottom={-8.7} shadow-camera-near={.1} shadow-camera-far={36} shadow-bias={-.00025} shadow-normalBias={.014} shadow-radius={3}/>
    <directionalLight position={[6,7,-7]} color="#c6deda" intensity={1.25}/>
    {!economy && <Environment resolution={64} frames={1} background={false} environmentIntensity={.82}>
      <color attach="background" args={['#66756f']}/>
      <Lightformer position={[-4,7,3]} rotation={[-.55,0,.45]} scale={[10,3,1]} color="#fff2dd" intensity={3}/>
      <Lightformer position={[5,1,3]} rotation={[0,-Math.PI/2,0]} scale={[4,8,1]} color="#d9e8ef" intensity={2.7}/>
      <Lightformer position={[0,8,-3]} rotation={[-Math.PI/2,0,0]} scale={[9,5,1]} color="#ffffff" intensity={2.3}/>
    </Environment>}
    <group ref={rig}>
      <primitive object={model.root} dispose={null}/>
      {model.paths.length > 0 && <instancedMesh ref={moving} args={[undefined, undefined, model.paths.length*(compact?1:2)]} frustumCulled={false}>
        <sphereGeometry args={[1,8,5]}/><meshBasicMaterial color="#e8ffdf" toneMapped={false}/>
      </instancedMesh>}
    </group>
  </>
}

class SceneBoundary extends Component<{children: ReactNode; onError: () => void}, {failed: boolean}> {
  state={failed:false}
  static getDerivedStateFromError(){return {failed:true}}
  componentDidCatch(){this.props.onError()}
  render(){return this.state.failed ? null : this.props.children}
}
export default function EcosystemScene(props: SceneProps) {
  // Demand rendering keeps the model static when reduced motion is requested;
  // pointer/keyboard edits request a single frame rather than a continuous loop.
  return <SceneBoundary onError={props.onError}><Canvas key={props.compact ? 'compact' : 'full'}
    dpr={[1, props.compact ? 1.25 : 1.65]}
    shadows={{ type: T.PCFShadowMap, autoUpdate:false, needsUpdate:true }}
    frameloop="demand"
    camera={{ position:[12,14,22],fov:25,near:.2,far:110 }}
    gl={{alpha:true,antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:false}}
    onCreated={({gl,setDpr})=>{
      const ctx=gl.getContext(),debug=ctx.getExtension('WEBGL_debug_renderer_info')
      const software=!!debug && /swiftshader|llvmpipe|software/i.test(ctx.getParameter(debug.UNMASKED_RENDERER_WEBGL))
      gl.domElement.dataset.quality=software?'economy':'full'
      if(software)setDpr(.85)
      gl.toneMapping=T.ACESFilmicToneMapping;gl.toneMappingExposure=1.02;gl.setClearColor('#101f1c',0)
      gl.domElement.setAttribute('aria-hidden','true');gl.domElement.dataset.renderer='three-webgl'
    }}
    fallback={<p>This interactive ecosystem model requires a WebGL 2 compatible browser.</p>}
    style={{width:'100%',height:'100%',display:'block',pointerEvents:'none'}}>
      <Maquette {...props}/>
    </Canvas></SceneBoundary>
}
