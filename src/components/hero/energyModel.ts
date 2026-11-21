import * as T from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// A purpose-built architectural maquette. All equipment, buildings, trees and
// conductors are geometry; only the material finishes and nameplates are textures.
export type EnergyModel = ReturnType<typeof createEnergyModel>
export type ModelPoint = [number, number, number]
const PI = Math.PI

function surface(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')!
  draw(ctx)
  const t = new T.CanvasTexture(canvas)
  t.colorSpace = T.SRGBColorSpace
  t.anisotropy = 4
  return t
}

export function createEnergyModel(compact: boolean, economy = false, view: 'ecosystem' | 'lumen' | 'tamid' | 'grid' = 'ecosystem') {
  let seed = 29407
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 }
  const root = new T.Group()
  const resources = new Set<T.BufferGeometry | T.Material | T.Texture>()
  const keep = <Q extends T.BufferGeometry | T.Material | T.Texture>(o: Q) => { resources.add(o); return o }
  const mat = (color: string, metalness = 0, roughness = .65, extra: T.MeshStandardMaterialParameters = {}) => keep(new T.MeshStandardMaterial({ color, metalness, roughness, ...extra }))
  const metal = mat('#bac5c2', .73, .3), zinc = mat('#71817d', .7, .32), ivory = mat('#dddcd1', .35, .35)
  const pearl = mat('#ecebe2', .37, .32), shell = mat('#495551', .72, .39), dark = mat('#202b2a', .6, .38)
  const rubber = mat('#26312f', .05, .9), concrete = mat('#a5aca1', .06, .85)
  const black = mat('#10201c', .21, .49), wood = mat('#9b8060', .02, .8), brass = mat('#a69c73', .64, .45)
  const glass = mat('#415c60', .64, .14, { envMapIntensity: 1.4 }), windowLight = mat('#a59d7b', .35, .24, { emissive: '#9e7844', emissiveIntensity: .15 })
  const light = mat('#daf3d0', .1, .23, { emissive: '#b1e7a2', emissiveIntensity: .65 })
  const statusGreen = mat('#67ac8b', .4, .3, { emissive: '#579d76', emissiveIntensity: .42 })
  const plainBox = keep(new T.BoxGeometry(1, 1, 1)), softBox = keep(new RoundedBoxGeometry(1, 1, 1, 1, .025))
  const unitCylinder = keep(new T.CylinderGeometry(1, 1, 1, compact ? 12 : 20)), thinCylinder = keep(new T.CylinderGeometry(1, 1, 1, 6))
  const plane = keep(new T.PlaneGeometry(1, 1))
  const tmp = new T.Object3D()
  let division: 'site' | 'lumen' | 'tamid' | 'grid' = 'site'
  // Static hardware shares geometry and is submitted in material/geometry batches.
  const batches = new Map<string, { g: T.BufferGeometry; m: T.Material; a: T.Matrix4[]; shadows: boolean }>()
  const put = (g: T.BufferGeometry, m: T.Material, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0, shadows = true) => {
    if (view !== 'ecosystem' && view !== division) return
    tmp.position.set(x, y, z); tmp.rotation.set(rx, ry, rz); tmp.scale.set(sx, sy, sz); tmp.updateMatrix()
    const key = g.uuid + m.uuid + Number(shadows)
    let b = batches.get(key)
    if (!b) { b = { g, m, a: [], shadows }; batches.set(key, b) }
    b.a.push(tmp.matrix.clone())
  }
  const box = (x: number, y: number, z: number, w: number, h: number, d: number, m: T.Material, rounded = false, rx = 0, ry = 0, rz = 0) => put(rounded ? softBox : plainBox, m, x, y, z, w, h, d, rx, ry, rz)
  const cyl = (x: number, y: number, z: number, r: number, h: number, m: T.Material) => put(unitCylinder, m, x, y, z, r, h, r)
  const rod = (a: ModelPoint, b: ModelPoint, r: number, m: T.Material) => {
    const av = new T.Vector3(...a), bv = new T.Vector3(...b), dir = bv.clone().sub(av)
    const q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), dir.clone().normalize())
    const e = new T.Euler().setFromQuaternion(q)
    put(thinCylinder, m, (a[0]+b[0])/2, (a[1]+b[1])/2, (a[2]+b[2])/2, r, dir.length(), r, e.x, e.y, e.z)
  }
  const decal = (t: T.Texture, pos: ModelPoint, w: number, h: number, angle = 0, flat = false) => {
    const m = keep(new T.MeshStandardMaterial({ map: keep(t), transparent: true, roughness: .6, metalness: .12, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }))
    put(plane, m, ...pos, w, h, 1, flat ? -PI/2 : 0, angle, 0, false)
  }
  const nameplate = (title: string, detail: string, color: string, brand = false) => surface(768, 144, c => {
    c.fillStyle = color
    if (brand) { c.save(); c.translate(7, 19); c.scale(2.25, 2.25); c.fill(new Path2D('M1 39 18.8 6H28.5L10.7 39ZM23.1 20.4 28.3 10.8 44 39H33.1ZM16.4 39 22 28.6H26.3L32 39Z')); c.restore() }
    const x = brand ? 128 : 8
    c.font = '600 61px Arial, sans-serif'; c.fillText(title, x, 81)
    c.font = '500 20px Arial, sans-serif'; c.fillText(detail.split('').join(' '), x+2, 119)
  })
  const finish = (base: string, tint: string, n: number, coarse = false) => keep(surface(256, 256, c => {
    c.fillStyle = base; c.fillRect(0, 0, 256, 256)
    for (let i=0; i<n; i++) { c.fillStyle = random()>.5 ? tint : '#26352c'; c.globalAlpha = .03+random()*.22; const s = coarse ? 1+random()*3 : 1; c.fillRect(random()*256,random()*256,s,s*(.5+random())) }
    c.globalAlpha=1
  }))
  const turfTex = finish('#798368','#c1c398',13500,true); turfTex.wrapS=turfTex.wrapT=T.RepeatWrapping;turfTex.repeat.set(3,3)
  const turf = mat('#dfdfcf',.02,.98,{ map:turfTex, bumpMap:turfTex, bumpScale:.018 })
  const stoneTex=finish('#a3aaa0','#e7e6d8',12000);stoneTex.wrapS=stoneTex.wrapT=T.RepeatWrapping;stoneTex.repeat.set(5,4)
  const stone=mat('#bec7bc',.03,.85,{map:stoneTex, bumpMap:stoneTex,bumpScale:.008})
  const deck=mat('#646e66',.26,.64,{map:stoneTex,bumpMap:stoneTex,bumpScale:.012})
  const baseTex=finish('#49534e','#a7b2a5',13000,true);baseTex.wrapS=baseTex.wrapT=T.RepeatWrapping;baseTex.repeat.set(3,1)
  const basalt=mat('#acb5a9',.36,.64,{map:baseTex,bumpMap:baseTex,bumpScale:.03})
  const slab = (w: number,d: number,y: number,h: number,cut: number,m:T.Material) => {
    const x=w/2,z=d/2,s=new T.Shape()
    s.moveTo(-x+cut,-z);s.lineTo(x-cut,-z);s.lineTo(x,-z+cut);s.lineTo(x,z-cut);s.lineTo(x-cut,z);s.lineTo(-x+cut,z);s.lineTo(-x,z-cut);s.lineTo(-x,-z+cut);s.closePath()
    const g=keep(new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:2,steps:1}));g.rotateX(-PI/2)
    put(g,m,0,y,0)
  }
  // Stepped, machined display plinth, with a recessed shadow gap and metal lip.
  slab(12.74,9.32,-.65,.16,.34,dark);slab(12.86,9.44,-.47,.20,.34,basalt)
  slab(12.82,9.40,-.24,.045,.33,zinc);slab(12.87,9.45,-.17,.12,.33,shell);slab(12.80,9.38,-.041,.052,.32,deck)
  for(let i=0;i<20;i++) { const x=-5.9+i*.62; box(x,-.34,4.725,.009,.14,.01,dark); if(i%3===0) box(x,-.13,4.74,.12,.012,.014,metal) }
  for(let i=0;i<14;i++) box(6.435,-.34,-4.15+i*.63,.008,.14,.012,dark)
  box(2.91,-.34,4.731,2.9,.17,.014,dark)
  decal(nameplate('ORAYAH DYNAMIS','ECOSYSTEM  /  OD—01','#c1cec4'),[2.94,-.34,4.744],2.44,.15)
  // A real cylindrical contact shadow, feathered out onto the surrounding studio floor.
  const shadowTex=keep(surface(256,256,c=>{ const g=c.createRadialGradient(128,128,15,128,128,128); g.addColorStop(0,'rgba(0,0,0,.93)');g.addColorStop(.60,'rgba(0,0,0,.68)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,256,256) }))
  const shadow=keep(new T.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false,opacity:.56}))
  put(plane,shadow,.3,-.88,.28,17.9,14.6,1,-PI/2,0,0,false)
  const ao = (x:number,z:number,w:number,d:number,y=.037) => put(plane,shadow,x,y,z,w,d,1,-PI/2,0,0,false)
  // Separate landscaped equipment courts and fine expansion joints.
  box(-3.83,.034,.13,4.68,.06,8.14,turf,true)
  box(.60,.032,-3.25,4.12,.04,2.47,turf,true)
  box(4.45,.035,-2.73,3.05,.06,3.57,turf,true)
  box(5.7,.04,1.88,.91,.07,4.5,turf,true)
  box(-1.10,.04,2.94,.58,.06,2.75,turf,true)
  for(let i=0;i<9;i++) box(-5.7+i*1.4,.018,0,.009,.003,8.98,concrete)
  for(let i=0;i<7;i++) box(0,.018,-4.05+i*1.35,12.1,.003,.009,concrete)
  // Photovoltaic cell busbars, wafer corners, fine fingers, and lamination grain.
  const pvtex=keep(surface(384,640,c=>{
    c.fillStyle='#95a7ad';c.fillRect(0,0,384,640)
    for(let col=0;col<6;col++) for(let row=0;row<10;row++) {
      const x=col*64+1.1,y=row*64+1.1,s=61.8,k=3.2,n=Math.floor(random()*11)
      const grad=c.createLinearGradient(x,y,x+s,y+s);grad.addColorStop(0,`rgb(${26+n},${48+n},${70+n})`);grad.addColorStop(1,`rgb(${38+n},${61+n},${80+n})`)
      c.fillStyle=grad;c.beginPath();c.moveTo(x+k,y);c.lineTo(x+s-k,y);c.lineTo(x+s,y+k);c.lineTo(x+s,y+s-k);c.lineTo(x+s-k,y+s);c.lineTo(x+k,y+s);c.lineTo(x,y+s-k);c.lineTo(x,y+k);c.closePath();c.fill()
      c.fillStyle='#9bb2c04b';for(let k=3;k<62;k+=3)c.fillRect(x+2,y+k,58,.45)
      c.fillStyle='#bdcbd197';c.fillRect(x+20,y+1,.8,59);c.fillRect(x+41,y+1,.8,59)
    }
  }))
  const pv=mat('#b2c2d4',.45,.22,{map:pvtex,envMapIntensity:.75})
  const pvPlane=keep(new T.PlaneGeometry(1,1));pvPlane.rotateX(-PI/2)
  const panel=(x:number,z:number,y:number,w:number,d:number,tilt=.30)=>{
    box(x,y,z,w,.058,d,metal,false,tilt)
    put(pvPlane,pv,x,y+.031*Math.cos(tilt),z+.031*Math.sin(tilt),w-.027,1,d-.028,tilt)
  }
  division = 'lumen'
  for(let r=0;r<4;r++) {
    const z=-2.89+r*1.94
    ao(-3.82,z,4.85,2.23,.07)
    for(let i=0;i<5;i++)panel(-5.46+i*.82,z,.59,.803,1.39)
    for(const x of [-5.55,-3.82,-2.10]) {
      for(const dz of [-.47,.47]) { const h=.5-dz*.32;box(x,h/2+.075,z+dz,.06,h,.084,zinc);box(x,.095,z+dz,.25,.06,.28,concrete,true) }
      rod([x,.14,z+.5],[x,.71,z-.48],.023,zinc)
    }
    box(-3.82,.40,z+.35,4.20,.065,.065,zinc);box(-3.82,.63,z-.42,4.20,.065,.065,zinc)
  }
  // Central GRID enclosure: double skin, brushed ribs, recessed cooling decks.
  division = 'grid'
  const hx=.49,hz=-.09
  ao(hx,hz,5.25,4.0)
  box(hx,.092,hz,3.94,.15,3.13,concrete,true);box(hx,.225,hz,3.60,.16,2.84,dark,true)
  box(hx,1.04,hz,3.43,1.50,2.63,ivory,true);box(hx,1.77,hz,3.49,.095,2.69,zinc,true)
  box(hx,1.89,hz,3.63,.15,2.83,pearl,true);box(hx,1.986,hz,3.39,.072,2.58,shell,true)
  box(hx,1.807,hz,3.51,.025,2.71,statusGreen,true)
  // Front facade with narrow ventilated bays, service panel, and industrial signage.
  const fz=hz+1.327
  box(hx-.98,1.04,fz,.95,1.23,.036,shell,true)
  for(let i=0;i<18;i++)box(hx-1.39+i*.048,1.035,fz+.038,.019,1.14,.059,zinc,true)
  box(hx+.28,.96,fz+.005,1.36,1.13,.04,pearl,true)
  decal(nameplate('ORAYAH','D Y N A M I S','#344941',true),[hx+.37,1.24,fz+.029],1.31,.27)
  for(let i=0;i<8;i++)box(hx+.27,.57+i*.043,fz+.032,1.08,.018,.013,zinc)
  box(hx+1.26,1.02,fz+.005,.52,1.22,.04,zinc,true);box(hx+1.28,1.07,fz+.027,.43,1.08,.012,shell)
  box(hx+1.17,1.11,fz+.047,.023,.18,.04,metal,true);box(hx+1.31,1.42,fz+.042,.21,.055,.014,statusGreen)
  for(const x of [-1.59,-.48,1.61])box(hx+x,1.04,fz,.019,1.33,.02,zinc)
  const sx=hx+1.731
  box(sx,1.03,hz,.033,1.29,2.28,dark,true)
  for(let i=0;i<30;i++)box(sx+.033,1.045,hz-1.075+i*.074,.073,1.18,.030,zinc,true)
  box(sx+.051,1.51,hz+.40,.012,.105,1.18,dark)
  box(sx+.065,1.51,hz+.53,.012,.037,.61,light)
  // Tiny rooftop fans are modeled with concentric guards, vanes, and bolt heads.
  const torusG=keep(new T.TorusGeometry(1,.026,4,compact?20:36))
  const ring=(x:number,y:number,z:number,r:number,m:T.Material)=>put(torusG,m,x,y,z,r,r,r,-PI/2)
  const fan=(x:number,y:number,z:number,r:number)=>{
    cyl(x,y,z,r,.056,metal);cyl(x,y+.033,z,r*.90,.03,dark)
    for(let i=0;i<(compact?5:9);i++){const a=i*PI*2/(compact?5:9);box(x+Math.sin(a)*r*.41,y+.055,z+Math.cos(a)*r*.41,r*.21,.018,r*.64,zinc,false,0,a+.44)}
    for(let i=1;i<5;i++)ring(x,y+.075,z,r*(.18+i*.16),rubber)
    cyl(x,y+.075,z,r*.16,.037,metal)
    if(!compact)for(let i=0;i<6;i++){const a=i*PI/3;rod([x+Math.cos(a)*r*.1,y+.081,z+Math.sin(a)*r*.1],[x+Math.cos(a)*r*.90,y+.081,z+Math.sin(a)*r*.90],.007,zinc)}
  }
  box(hx-.94,2.065,hz,1.01,.13,2.10,black,true)
  fan(hx-.94,2.15,hz-.51,.386);fan(hx-.94,2.15,hz+.50,.386)
  // The central processor is a physical chip beneath a raised, smoked-glass cap.
  box(hx+.62,2.074,hz,1.62,.13,2.11,metal,true)
  box(hx+.62,2.16,hz,1.52,.093,2.0,dark,true)
  const pcbTex=keep(surface(384,384,c=>{
    c.fillStyle='#24433b';c.fillRect(0,0,384,384)
    for(let i=0;i<100;i++){const x=random()*384,z=random()*384,l=8+random()*54;c.strokeStyle=i%4===0?'#9bba86':'#587a64';c.lineWidth=i%4===0?1.6:1;c.beginPath();c.moveTo(x,z);c.lineTo(x+l,z);c.lineTo(x+l+12,z+12);c.lineTo(x+l+12,z+30);c.stroke();c.fillStyle='#a2a98d';c.fillRect(x-1,z-1,3,3)}
  }))
  put(pvPlane,mat('#b0c3b4',.42,.36,{map:pcbTex}),hx+.62,2.215,hz,1.39,1,1.83)
  for(let i=0;i<13;i++){box(hx+.20+i*.068,2.246,hz-.48,.025,.034,.16,brass);box(hx+.20+i*.068,2.246,hz+.48,.025,.034,.16,brass)}
  box(hx+.62,2.26,hz,.98,.10,.92,black,true);box(hx+.62,2.326,hz,.84,.04,.79,zinc,true)
  decal(nameplate('GRID','I E M S','#e0e9dc'),[hx+.62,2.35,hz],.69,.17,0,true)
  const lid=mat('#71998c',.30,.12,{transparent:true,opacity:.19,depthWrite:false,envMapIntensity:1.6})
  box(hx+.62,2.43,hz,1.53,.035,2.01,lid,true)
  for(const x of [-.105,1.345])for(const z of [-.96,.96]){cyl(hx+x,2.319,hz+z,.025,.235,metal);cyl(hx+x,2.452,hz+z,.04,.013,pearl)}
  for(const z of [-1,1])box(hx+.62,2.425,hz+z,1.52,.029,.022,metal)
  for(const x of [-.135,1.375])box(hx+x,2.425,hz,.022,.029,2.00,metal)
  box(hx+.62,2.18,hz+1.013,1.20,.023,.03,statusGreen)
  // Battery banks: individual sealed cabinets, plinths, lifting lugs and cooling grilles.
  division = 'tamid'
  const bLabel=nameplate('TAMID','ENERGY STORAGE','#354840')
  const battery=(x:number,z:number,i:number)=>{
    ao(x,z,1.58,2.28);box(x,.101,z,1.25,.16,1.62,concrete,true);box(x,.223,z,1.10,.13,1.46,dark,true)
    box(x,.849,z,1.08,1.17,1.42,ivory,true)
    box(x,1.463,z,1.12,.073,1.46,pearl,true)
    box(x,.84,z+.721,.901,1.035,.024,zinc,true);box(x,.86,z+.738,.86,.982,.025,pearl,true)
    box(x,.832,z+.758,.016,.95,.016,metal);box(x+.052,.854,z+.780,.024,.176,.025,shell,true)
    box(x-.29,1.16,z+.758,.151,.065,.014,dark);box(x-.318,1.161,z+.770,.04,.03,.006,statusGreen)
    for(let j=0;j<7;j++)box(x,.478+j*.038,z+.758,.674,.016,.014,zinc)
    box(x+.553,.92,z,.012,.58,.99,shell)
    for(let j=0;j<13;j++)box(x+.564,.92,z-.438+j*.073,.021,.53,.030,zinc)
    fan(x,1.512,z-.035,.386)
    decal(bLabel,[x+.02,1.02,z+.765],.72,.126)
    if(!compact) {for(const d of [-.43,.43])for(const a of [-.57,.57])cyl(x+d,1.513,z+a,.026,.048,zinc);box(x-.47,.95,z+.768,.032,.09,.027,shell);box(x-.47,.50,z+.768,.032,.09,.027,shell)}
    box(x,.25,z+.75,.81,.028,.012,i===2?statusGreen:metal)
  }
  for(let i=0;i<4;i++)battery(-.17+i*1.37,3.05,i)
  division = 'site'
  // Residential buildings have complete pitched roofs, standing seams, windows,
  // mullions, timber doors, gutters, domestic solar and terrace furniture.
  const roofMats=[mat('#46554f',.28,.63),mat('#48575a',.34,.60),mat('#576257',.30,.61)]
  const house=(x:number,z:number,w:number,d:number,h:number,style:number)=>{
    ao(x,z,w*1.52,d*1.57,.073);box(x,.14,z,w+.27,.16,d+.3,concrete,true);box(x,.22+h/2,z,w,h,d,pearl)
    const top=.22+h, rise=.63, ff=z+d/2+.012
    const shape=new T.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,rise);shape.closePath()
    const tri=keep(new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,steps:1}));put(tri,ivory,x,top,z-d/2)
    const slope=Math.atan2(rise,w/2),length=Math.hypot(w/2,rise)+.11,rm=roofMats[style%3]
    box(x-w/4,top+rise/2+.027,z,length,.065,d+.22,rm,false,0,0,slope);box(x+w/4,top+rise/2+.027,z,length,.065,d+.22,rm,false,0,0,-slope)
    for(let k=0;k<7;k++){const zz=z-d/2-.057+k*(d+.12)/6;box(x+w/4,top+rise/2+.066,zz,length,.018,.014,zinc,false,0,0,-slope);box(x-w/4,top+rise/2+.066,zz,length,.018,.014,zinc,false,0,0,slope)}
    box(x,top+rise+.081,z,.084,.053,d+.25,zinc,true);box(x+w/2+.07,top-.006,z,.063,.07,d+.21,metal)
    box(x-w*.25,.63,ff,.35,.79,.035,wood,true);box(x-w*.19,.65,ff+.027,.018,.084,.03,brass)
    for(let i=0;i<2;i++){const xx=x+w*.08+i*.33;box(xx,.83,ff,.31,.47,.033,shell);box(xx,.83,ff+.019,.258,.408,.018,i===0?glass:windowLight);box(xx,.84,ff+.033,.014,.41,.016,metal)}
    for(let i=0;i<3;i++){const zz=z-d*.29+i*d*.29;box(x+w/2+.014,.82,zz,.028,.51,.29,shell);box(x+w/2+.031,.82,zz,.018,.443,.241,glass)}
    box(x+w*.25,top+rise*.31+.19,z-d*.23,.16,.55,.25,shell);box(x+w*.25,top+rise*.31+.476,z-d*.23,.21,.029,.31,metal)
    box(x-w*.21,.13,ff+.21,.66,.115,.44,stone);box(x-w*.21,.07,ff+.43,.77,.075,.22,concrete)
    if(style!==1){for(let k=0;k<2;k++){const zz=z+(k-.5)*.52;box(x+w*.257,top+rise*.49+.083,zz,w*.38,.025,.49,metal,false,0,0,-slope);put(pvPlane,pv,x+w*.259,top+rise*.49+.101,zz,w*.36,1,.471,0,0,-slope)}}
  }
  house(-.76,-3.20,1.49,1.32,.96,0);house(1.27,-3.38,1.53,1.42,1.09,1);house(3.55,-3.32,1.59,1.58,1.07,2)
  // A compact two-level community services building with curtain-wall glazing.
  const cx=4.31,cz=-.46,cw=1.78,cd=2.16
  ao(cx,cz,2.69,3.21);box(cx,.12,cz,cw+.35,.18,cd+.35,concrete,true);box(cx,.72,cz,cw,1.05,cd,ivory,true)
  box(cx,1.31,cz,cw+.19,.14,cd+.2,concrete,true);box(cx-.10,1.79,cz-.09,cw-.19,.85,cd-.2,pearl)
  box(cx-.10,2.27,cz-.09,cw+.05,.105,cd+.03,pearl,true);box(cx-.10,2.335,cz-.09,cw-.11,.025,cd-.14,shell)
  for(let fl=0;fl<2;fl++) {
    const y=.85+fl*.95,f=cz+cd/2+.01-fl*.192,right=cx+cw/2+.011-fl*.197
    const w=cw-.2-fl*.15;box(cx-fl*.1,y,f,w,.49,.026,glass)
    for(let i=0;i<5;i++)box(cx-fl*.1-w/2+i*w/4,y,f+.018,.025,.5,.028,zinc)
    box(right,y,cz-fl*.09,.027,.49,cd-.24-fl*.18,glass)
    for(let i=0;i<6;i++)box(right+.02,y,cz-fl*.09-(cd-.24-fl*.18)/2+i*(cd-.24-fl*.18)/5,.025,.504,.022,zinc)
  }
  box(cx-.4,2.47,cz-.49,.53,.26,.69,zinc,true);fan(cx-.4,2.61,cz-.49,.17)
  box(cx+.35,.28,cz+1.25,.78,.11,.41,stone);box(cx+.35,.15,cz+1.48,.89,.11,.17,concrete)
  // Organic, irregular tree meshes; canopy clumps share one instanced geometry.
  const brittle=keep(new T.IcosahedronGeometry(1,compact?0:1));const attr=brittle.attributes.position
  for(let i=0;i<attr.count;i++){const x=attr.getX(i),y=attr.getY(i),z=attr.getZ(i),n=1+.085*Math.sin(x*16+y*13+z*18);attr.setXYZ(i,x*n,y*n,z*n)}
  brittle.computeVertexNormals()
  const bark=mat('#635b48',0,.98)
  const foliageTex=finish('#929c77','#dfdfb5',13500,true)
  const greens=['#4d6345','#60754e','#76835c','#425d46','#7e8d65','#627d61'].map(v=>mat(v,0,.96,{map:foliageTex}))
  // Alpha-tested sprays of individual leaves give each layered 3D crown a
  // fine, naturally broken silhouette without hundreds of thousands of leaves.
  const sprayTex=keep(surface(256,256,c=>{
    const clumps=Array.from({length:19},()=>{const a=random()*PI*2,r=Math.sqrt(random())*71;return [128+Math.cos(a)*r,119+Math.sin(a)*r]})
    c.lineCap='round';c.strokeStyle='#5b5a3f';c.lineWidth=2
    for(const [x,y] of clumps){c.beginPath();c.moveTo(127,228);c.quadraticCurveTo(121,147,x,y);c.stroke()}
    for(let k=0;k<1600;k++){const [x,y]=clumps[k%clumps.length],a=random()*PI*2,r=Math.sqrt(random())*33,xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r,n=.53+random()*.53+(120-yy)*.0009;
      c.fillStyle=`rgb(${Math.floor(116*n)},${Math.floor(136*n)},${Math.floor(88*n)})`;c.beginPath();c.ellipse(xx,yy,2.0+random()*3.3,1.9+random()*1.8,random()*PI,0,PI*2);c.fill()
    }
  }))
  const leafMats=['#cfdbc4','#e3dfbf','#bbd2c1','#d6d4b0'].map(color=>mat(color,.0,.92,{map:sprayTex,alphaTest:.35,side:T.DoubleSide,alphaToCoverage:true}))
  const tree=(x:number,z:number,s:number,i:number)=>{
    ao(x,z,s*1.5,s*1.6,.079);rod([x,.065,z],[x+.025*s,1.12*s,z+.01],.045*s,bark)
    const n=compact?23:44
    for(let k=0;k<n;k++){
      const theta=random()*PI*2,cos=random()*2-1,sin=Math.sqrt(1-cos*cos),r=(.25+random()*.28)*s
      const xx=x+Math.cos(theta)*r*sin,zz=z+Math.sin(theta)*r*sin,yy=1.15*s+cos*r*1.17
      const rad=(compact?.75:.63)*s*(.78+random()*.53)
      put(plane,leafMats[(i+k%2)%leafMats.length],xx,yy,zz,rad,rad*1.03,1,-.26-random()*.62,theta,random()*.65-.325)
      if(k%4===0)rod([x,.63*s,z],[xx,yy-.16*s,zz],.013*s,bark)
    }
  }
  const trees=[[ -5.85,-4.02,.97],[-4.84,-4.04,.77],[-3.42,-4.04,.99],[-2.58,-4.13,1.11],[-1.95,-3.60,.77],[.16,-3.88,.83],[2.45,-4.02,1.06],[4.68,-4.02,1.09],[5.48,-3.57,1.28],[5.78,-2.56,1.18],[5.78,-1.64,.91],[5.77,-.48,1.14],[5.69,1.12,1.05],[5.69,2.17,.88],[5.59,3.98,1.09],[-1.08,3.72,.86],[-1.10,2.24,.69],[-5.97,3.94,.81]]
  trees.forEach(([x,z,s],i)=>tree(x,z,s,i))
  for(const [x,z,w,d] of [[-5.92,.27,.26,5.5],[2.30,-2.24,.88,.24],[4.61,1.22,1.3,.26],[1.58,-2.19,.65,.26],[5.67,2.65,.34,1.04]]){
    box(x,.14,z,w+.10,.17,d+.1,concrete,true);box(x,.31,z,w,.30,d,greens[1],true)
    for(let i=0;i<(compact?8:28);i++)put(brittle,greens[(i%3)+1],x+(random()-.5)*w,.40+random()*.07,z+(random()-.5)*d,.12,.101,.123,random(),random(),0)
  }
  // Fine paving, guard posts, and aluminum enclosure corners establish scale.
  for(let i=0;i<8;i++)box(-.48+i*.59,.039,-1.894,.48,.013,.25,concrete,true)
  for(const [x,z] of [[-1.32,1.53],[2.46,1.49],[-1.23,-1.49],[2.44,-1.49],[4.71,2.16],[4.75,3.90]]){cyl(x,.21,z,.046,.36,metal);cyl(x,.369,z,.049,.021,statusGreen)}
  if(!compact)for(let i=0;i<24;i++){const z=-4.06+i*.346;cyl(-6.17,.146,z,.014,.22,zinc)}
  rod([-6.17,.225,-4.06],[-6.17,.225,3.90],.012,metal)
  // Routed energy paths have a rigid conduit, a soft illuminated core, and
  // separately animated travelling pulses. These are logical energy paths.
  const energy=keep(new T.MeshBasicMaterial({color:'#9bd8b2',toneMapped:false}))
  const eff=keep(new T.MeshBasicMaterial({color:'#a2dfac',transparent:true,opacity:.22,depthWrite:false,blending:T.AdditiveBlending}))
  const paths:T.CurvePath<T.Vector3>[]=[]
  const route=(points:number[][])=>{
    const pts=points.map(([x,z])=>new T.Vector3(x,.094,z)),curve=new T.CurvePath<T.Vector3>();let start=pts[0]
    for(let i=1;i<pts.length-1;i++){
      const before=pts[i].clone().addScaledVector(pts[i-1].clone().sub(pts[i]).normalize(),.122),after=pts[i].clone().addScaledVector(pts[i+1].clone().sub(pts[i]).normalize(),.122)
      curve.add(new T.LineCurve3(start,before));curve.add(new T.QuadraticBezierCurve3(before,pts[i],after));start=after
    }
    curve.add(new T.LineCurve3(start,pts[pts.length-1]));paths.push(curve)
    const segments=compact?28:52
    const sheath=keep(new T.TubeGeometry(curve,segments,.040,5,false));put(sheath,dark,0,-.017,0,1,1,1,0,0,0,false)
    const core=keep(new T.TubeGeometry(curve,segments,.022,5,false));put(core,energy,0,.012,0,1,1,1,0,0,0,false)
    const glow=keep(new T.TubeGeometry(curve,segments,.054,5,false));put(glow,eff,0,.013,0,1,1,1,0,0,0,false)
  }
  route([[-3.99,.82],[-1.41,.82],[-1.41,.29],[-.67,.29]])
  route([[-3.99,-2.96],[-1.43,-2.96],[-1.43,-.56],[-.74,-.56]])
  route([[-3.99,2.81],[-1.37,2.81],[-1.37,1.75],[-.7,1.75],[-.7,1.04]])
  route([[.48,1.1],[.48,1.73],[2.54,1.73],[2.54,2.96]])
  route([[1.92,-.84],[2.61,-.84],[2.61,-2.24],[3.59,-2.24],[3.59,-2.80]])
  route([[1.08,-.98],[1.08,-1.86],[-.76,-1.86],[-.76,-2.75]])
  route([[1.95,.58],[2.84,.58],[2.84,1.19],[4.56,1.19],[4.56,.45]])
  route([[-4.95,3.29],[-4.95,4.21],[-1.44,4.21],[-1.44,1.82],[-.48,1.82],[-.48,1.11]])
  route([[1.90,.85],[2.89,.85],[2.89,1.80],[4.74,1.80],[4.74,4.12],[1.20,4.12],[1.20,3.46]])
  for(const [x,z] of [[-1.41,.82],[.48,1.73],[2.61,-2.24],[2.84,1.19]]) {cyl(x,.095,z,.09,.059,dark);cyl(x,.131,z,.042,.019,light)}
  // CPUs providing WebGL in software use a less expensive specular shader.
  // This is the same orbitable geometry and textured hardware, not a poster.
  const lightweight=new Map<T.Material,T.Material>()
  for(const b of batches.values()){
    let material=b.m
    if(economy && material instanceof T.MeshStandardMaterial) {
      if(!lightweight.has(material))lightweight.set(material,keep(new T.MeshPhongMaterial({
        color:material.color,map:material.map,emissive:material.emissive,emissiveIntensity:material.emissiveIntensity,
        specular:new T.Color('#879c9b').multiplyScalar(.09+material.metalness*.75),shininess:12+(1-material.roughness)*74,
        transparent:material.transparent,opacity:material.opacity,depthWrite:material.depthWrite,side:material.side,alphaTest:material.alphaTest,
        polygonOffset:material.polygonOffset,polygonOffsetFactor:material.polygonOffsetFactor
      })))
      material=lightweight.get(material)!
    }
    const m=new T.InstancedMesh(b.g,material,b.a.length);b.a.forEach((matrix,i)=>m.setMatrixAt(i,matrix));m.castShadow=b.shadows;m.receiveShadow=true;m.computeBoundingSphere();m.instanceMatrix.setUsage(T.StaticDrawUsage);root.add(m)
  }
  if(view !== 'ecosystem') {
    const centres = { lumen: [-3.82,.42,.02], tamid: [1.885,.8,3.05], grid: [.49,1.2,-.09] }
    root.position.fromArray(centres[view]).multiplyScalar(-1)
    paths.length=0
    return {root,paths,dispose:()=>{root.traverse(o=>{if(o instanceof T.InstancedMesh)o.dispose()});resources.forEach(r=>r.dispose())}}
  }
  const ticks:number[]=[]
  for(let i=-12;i<=12;i++){ticks.push(i,-.895,-12,i,-.895,12,-12,-.895,i,12,-.895,i)}
  const gridG=keep(new T.BufferGeometry());gridG.setAttribute('position',new T.Float32BufferAttribute(ticks,3))
  const gridMat=keep(new T.ShaderMaterial({transparent:true,depthWrite:false,vertexShader:'varying vec3 vP; void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 vP;void main(){float f=1.-smoothstep(4.,11.8,length(vP.xz));gl_FragColor=vec4(.53,.66,.57,.14*f);}' }));const grid=new T.LineSegments(gridG,gridMat);root.add(grid)
  return {root,paths,dispose:()=>{root.traverse(o=>{if(o instanceof T.InstancedMesh)o.dispose()});resources.forEach(r=>r.dispose())}}
}
