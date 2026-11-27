// poly-orb: seeded living polyhedra drawn on a 2D canvas. No dependencies.
// Used by index.html and copied as-is by other apps (agent-orbs): keep it free of DOM lookups.
/* =====================================================================
   EXACT 3D POLYHEDRA GEOMETRY LIBRARY (7 TRUE 3D SOLIDS + POLYFORM)
   ===================================================================== */
function norm(v){const l=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/l,v[1]/l,v[2]/l];}
function add(a,b){return[a[0]+b[0],a[1]+b[1],a[2]+b[2]];}
function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}

function buildTetra(){const v=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(norm);return{v,f:[[0,1,2],[0,3,1],[0,2,3],[1,3,2]]};}
function buildOcta(){const v=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];return{v,f:[[0,2,4],[2,1,4],[1,3,4],[3,0,4],[2,0,5],[1,2,5],[3,1,5],[0,3,5]]};}
function buildCube(){const v=[];for(const x of[-1,1])for(const y of[-1,1])for(const z of[-1,1])v.push(norm([x,y,z]));return{v,f:[[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]]};}
function buildCrystal(){const v=[[0,1.24,0],[0,-1.24,0]];for(let i=0;i<6;i++){const a=i*Math.PI/3;v.push([Math.cos(a)*0.82,0,Math.sin(a)*0.82]);}const f=[];for(let i=0;i<6;i++){const n=(i+1)%6;f.push([0,2+i,2+n],[1,2+n,2+i]);}return{v,f};}
function buildIcosa(){
  const t=(1+Math.sqrt(5))/2;
  const v=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(norm);
  const f=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  return{v,f};
}
function buildDodeca(){
  const ico=buildIcosa();
  const v=ico.f.map(tri=>norm(add(add(ico.v[tri[0]],ico.v[tri[1]]),ico.v[tri[2]])));
  const f=[];
  for(let vi=0;vi<ico.v.length;vi++){
    const axis=ico.v[vi],adj=[];
    ico.f.forEach((tri,fi)=>{if(tri.includes(vi))adj.push(fi);});
    const ref=Math.abs(axis[1])<0.9?[0,1,0]:[1,0,0];
    const ux=norm(cross(ref,axis)),uy=cross(axis,ux);
    adj.sort((a,b)=>Math.atan2(dot(v[a],uy),dot(v[a],ux))-Math.atan2(dot(v[b],uy),dot(v[b],ux)));
    f.push(adj);
  }
  return{v,f};
}
function buildPolyform(){
  const ico=buildIcosa(),v=ico.v.map(p=>[...p]),midMap=new Map();
  function mid(a,b){const k=a<b?a+'_'+b:b+'_'+a;if(midMap.has(k))return midMap.get(k);const idx=v.length;v.push(norm(add(v[a],v[b])));midMap.set(k,idx);return idx;}
  const f=[];
  for(const[a,b,c]of ico.f){const ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);f.push([a,ab,ca],[b,bc,ab],[c,ca,bc],[ab,bc,ca]);}
  return{v,f};
}

function buildBrilliantSphere(segs, rings){
  // Closed brilliant-cut triangulated sphere/bipyramid: exactly 2 * (rings - 1) * segs faces
  const v=[[0,1,0]];
  for(let r=1;r<rings;r++){
    const phi=Math.PI*r/rings;
    const y=Math.cos(phi), rad=Math.sin(phi);
    const twist=(r%2)*(Math.PI/segs);
    for(let s=0;s<segs;s++){
      const a=twist+(s*Math.PI*2)/segs;
      v.push([Math.cos(a)*rad, y, Math.sin(a)*rad]);
    }
  }
  const southIdx=v.length;
  v.push([0,-1,0]);
  const f=[];
  // North cap
  for(let s=0;s<segs;s++){
    const a=1+s, b=1+((s+1)%segs);
    f.push([0,b,a]);
  }
  // Middle bands
  for(let r=1;r<rings-1;r++){
    const rowA=1+(r-1)*segs, rowB=1+r*segs;
    const odd=r%2===1;
    for(let s=0;s<segs;s++){
      const sNext=(s+1)%segs;
      const a1=rowA+s, a2=rowA+sNext;
      const b1=rowB+s, b2=rowB+sNext;
      if(odd){
        f.push([a1,a2,b1],[a2,b2,b1]);
      } else {
        f.push([a1,a2,b2],[a1,b2,b1]);
      }
    }
  }
  // South cap
  const lastRow=1+(rings-2)*segs;
  for(let s=0;s<segs;s++){
    const a=lastRow+s, b=lastRow+((s+1)%segs);
    f.push([southIdx,a,b]);
  }
  return { v, f };
}

const FACE_STEPS=[
  {faces:4,  name:'TETRAEDRO',    build:buildTetra},
  {faces:6,  name:'HEXAEDRO',     build:buildCube},
  {faces:8,  name:'OCTAEDRO',     build:buildOcta},
  {faces:10, name:'BIPIRÁMIDE',   build:()=>buildBrilliantSphere(5,2)},
  {faces:12, name:'DODECAEDRO',   build:buildDodeca},
  {faces:14, name:'CRISTAL 14',   build:()=>buildBrilliantSphere(7,2)},
  {faces:16, name:'CRISTAL 16',   build:()=>buildBrilliantSphere(8,2)},
  {faces:18, name:'CRISTAL 18',   build:()=>buildBrilliantSphere(9,2)},
  {faces:20, name:'ICOSAEDRO',    build:buildIcosa},
  {faces:24, name:'GEMA 24',      build:()=>buildBrilliantSphere(6,3)},
  {faces:28, name:'GEMA 28',      build:()=>buildBrilliantSphere(7,3)},
  {faces:32, name:'GEMA 32',      build:()=>buildBrilliantSphere(8,3)},
  {faces:36, name:'GEMA 36',      build:()=>buildBrilliantSphere(9,3)},
  {faces:40, name:'GEMA 40',      build:()=>buildBrilliantSphere(10,3)},
  {faces:48, name:'ESFERA 48',    build:()=>buildBrilliantSphere(8,4)},
  {faces:54, name:'ESFERA 54',    build:()=>buildBrilliantSphere(9,4)},
  {faces:60, name:'ESFERA 60',    build:()=>buildBrilliantSphere(10,4)},
  {faces:72, name:'ESFERA 72',    build:()=>buildBrilliantSphere(12,4)},
  {faces:80, name:'POLIFORMA',    build:buildPolyform}
];
const GEO_CACHE=new Map();
function getSolid(faces){
  if(!GEO_CACHE.has(faces)){
    const step=FACE_STEPS.find(s=>s.faces===faces)||FACE_STEPS[8];
    GEO_CACHE.set(faces,step.build());
  }
  return GEO_CACHE.get(faces);
}
function getFaceMeta(faces){
  return FACE_STEPS.find(s=>s.faces===faces)||FACE_STEPS[8];
}

const PALETTES=[
  {id:'amber', name:'ÁMBAR SOLAR',     primary:'#ffb84d',secondary:'#ff6b2b',core:'#fff3cc'},
  {id:'mint',  name:'MENTA VIVA',      primary:'#3ff0c4',secondary:'#12a8ff',core:'#d4fff4'},
  {id:'ruby',  name:'RUBÍ CARMESÍ',    primary:'#ff4d73',secondary:'#ff1f5e',core:'#ffd0dc'},
  {id:'cobalt',name:'COBALTO PROFUNDO',primary:'#5294ff',secondary:'#8b5cf6',core:'#d9e8ff'},
  {id:'violet',name:'AMATISTA NEBULA', primary:'#a87bff',secondary:'#5b6cff',core:'#eee0ff'},
  {id:'gold',  name:'ORO CHAMPAGNE',   primary:'#e5c172',secondary:'#b88635',core:'#fff6df'},
  {id:'aqua',  name:'TURQUESA POLAR',  primary:'#2de2e6',secondary:'#2678ff',core:'#d6feff'},
  {id:'coral', name:'CORAL ATARDECER', primary:'#ff7a59',secondary:'#ff3d7f',core:'#ffe0d6'}
];

const STATUS_META={
  working:{label:'TRABAJANDO',color:'#3ff0c4'},
  waiting:{label:'TE ESPERA', color:'#ffb84d'},
  blocked:{label:'BLOQUEADO', color:'#ff4d73'},
  resting:{label:'DESCANSO',  color:'#8890b0'}
};

function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
// Seed = 10 hex chars, a reversible mixed-radix number:
// faces step (19) · satellites 0-5 · rings 0-3 · morph 0-100 · color (8 palettes, then any exact #rrggbb).
const SEED_RADIX=[19,6,4,101];
const SEED_COLORS=PALETTES.length+0x1000000;
// Invertible scramble mod 2^40 (odd multiplier, then xor) so nearby figures get unrelated-looking codes.
const SEED_BITS=40n,SEED_MASK=(1n<<SEED_BITS)-1n,SEED_MUL=0x9e3779b97fn,SEED_XOR=0x5bd1e99547n;
const SEED_MUL_INV=[0,1,2,3,4,5].reduce(x=>(x*(2n-SEED_MUL*x))&SEED_MASK,SEED_MUL);
function encodeSeed(ent){
  const pi=PALETTES.findIndex(p=>p.primary===ent.primary&&p.secondary===ent.secondary);
  const color=pi>=0?pi:PALETTES.length+parseInt(ent.primary.slice(1),16);
  const fi=Math.max(0,FACE_STEPS.findIndex(st=>st.faces===ent.faces));
  let n=color;
  [ent.morph,ent.rings,ent.satellites,fi].forEach((v,i)=>{n=n*SEED_RADIX[3-i]+v;});
  return (((BigInt(n)*SEED_MUL)&SEED_MASK)^SEED_XOR).toString(16).padStart(10,'0');
}
function decodeSeed(hex,status){
  let n=Number(((BigInt('0x'+hex)^SEED_XOR)*SEED_MUL_INV)&SEED_MASK);
  const [fi,sat,rings,morph]=SEED_RADIX.map(rad=>{const v=n%rad;n=Math.floor(n/rad);return v;});
  const color=n%SEED_COLORS;
  const pal=PALETTES[color];
  const primary=pal?pal.primary:'#'+(color-PALETTES.length).toString(16).padStart(6,'0');
  return {
    seed:hex.toLowerCase(),faces:FACE_STEPS[fi].faces,
    primary,secondary:pal?pal.secondary:primary,core:pal?pal.core:'#ffffff',palName:pal?pal.name:primary.toUpperCase(),
    satellites:sat,rings,morph,status:status||'waiting',
    rotX:0.35,rotY:(parseInt(hex.slice(-6),16)%314)/100,velX:0,velY:0,poke:0
  };
}
function randomSeed(){return encodeSeed(entityFromText(Math.random().toString(36).slice(2)));}

function generateEntityFromSeed(seed,status){
  const raw=(seed||'').trim()||'d1a4f801';
  if(/^[0-9a-f]{10}$/i.test(raw))return decodeSeed(raw,status);
  const ent=entityFromText(raw,status);
  ent.seed=encodeSeed(ent);
  return ent;
}
// Older links ("32c-a87bff-5s-1r-38m") and any free text still open a figure; the shown seed becomes the 10-hex one.
function entityFromText(raw,status){
  // 1) Reversible structured DNA seed: e.g. "80c-ffb84d-3s-2r-55m"
  const m=raw.match(/^(\d+)c-([0-9a-f]{6})-(\d+)s-(\d+)r-(\d+)m$/i);
  if(m){
    const facesReq=Number(m[1]);
    const closest=FACE_STEPS.reduce((best,cur)=>Math.abs(cur.faces-facesReq)<Math.abs(best.faces-facesReq)?cur:best,FACE_STEPS[0]);
    const hex='#'+m[2].toLowerCase();
    const pal=PALETTES.find(p=>p.primary.toLowerCase()===hex);
    return {
      seed:raw,
      faces:closest.faces,
      primary:hex,
      secondary:pal?pal.secondary:hex,
      core:pal?pal.core:'#ffffff',
      palName:pal?pal.name:hex.toUpperCase(),
      satellites:Math.max(0,Math.min(5,Number(m[3]))),
      rings:Math.max(0,Math.min(3,Number(m[4]))),
      morph:Math.max(0,Math.min(100,Number(m[5]))),
      status:status||'waiting',
      rotX:0.35,rotY:(hashStr(raw)%314)/100,velX:0,velY:0,poke:0
    };
  }
  // 2) Any arbitrary ID / hash seed -> deterministic entity
  const h1=hashStr(raw);
  const h2=hashStr(raw+':orbit');
  const step=FACE_STEPS[h1%FACE_STEPS.length];
  const pal=PALETTES[(h1>>>3)%PALETTES.length];
  const ent={
    seed:raw,
    faces:step.faces,
    primary:pal.primary,
    secondary:pal.secondary,
    core:pal.core,
    palName:pal.name,
    satellites:1+(h2%5),
    rings:1+((h2>>>4)%3),
    morph:15+((h1>>>10)%55),
    status:status||'waiting',
    rotX:0.35,rotY:(h1%314)/100,velX:0,velY:0,poke:0
  };
  return ent;
}

function hexRgb(hex){const n=parseInt((hex||'#ffffff').replace('#',''),16);return[(n>>16)&255,(n>>8)&255,n&255];}

function drawLivingEntity(ctx,ent,w,h,t,mini){
  ctx.clearRect(0,0,w,h);
  const cx=w*0.5,cy=h*0.5;
  const isRest=ent.status==='resting',isWork=ent.status==='working',isBlocked=ent.status==='blocked',isWaiting=ent.status==='waiting';
  const isUrg=isWaiting||isBlocked;

  // Natural syllabic voice-cadence envelope when working (speaking / streaming)
  const phraseGate=0.42+0.58*Math.max(0,Math.sin(t*1.15+0.4));
  const rawVoice=Math.max(0, 0.52*Math.sin(t*5.4) + 0.34*Math.sin(t*9.7+1.2) + 0.24*Math.sin(t*15.3+2.5) + 0.35);
  const speechPulse=isWork ? Math.min(1, rawVoice*phraseGate) : 0;

  const R=Math.min(w,h)*(mini?0.27:0.25)*(1+(isRest?0.02:0.04)*Math.sin(t*(isUrg?2.4:1.5)) + speechPulse*0.095 + ent.poke*0.16);
  const pRgb=hexRgb(ent.primary),sRgb=hexRgb(ent.secondary),cRgb=hexRgb(ent.core);
  const rgba=(rgb,a)=>`rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;

  const glowR=R*(mini?2.0:2.35)*(1+speechPulse*0.18);
  const halo=ctx.createRadialGradient(cx,cy,R*0.15,cx,cy,glowR);
  if(isBlocked){
    // Unmistakable red warning halo around the entity regardless of its own color
    halo.addColorStop(0,rgba(pRgb,0.34));
    halo.addColorStop(0.42,`rgba(255,62,102,${(0.38+0.12*Math.sin(t*4.2)).toFixed(2)})`);
    halo.addColorStop(0.75,'rgba(255,42,84,0.14)');
    halo.addColorStop(1,'rgba(0,0,0,0)');
  } else if(isWaiting){
    halo.addColorStop(0,rgba(pRgb,0.4));
    halo.addColorStop(0.52,`rgba(255,184,77,${(0.28+0.08*Math.sin(t*2.8)).toFixed(2)})`);
    halo.addColorStop(1,'rgba(0,0,0,0)');
  } else if(isWork){
    // Keep the entity's own color identity (no green halo override)
    halo.addColorStop(0,rgba(pRgb,(0.44+speechPulse*0.24).toFixed(2)));
    halo.addColorStop(0.52,rgba(sRgb,(0.15+speechPulse*0.16).toFixed(2)));
    halo.addColorStop(1,'rgba(0,0,0,0)');
  } else {
    halo.addColorStop(0,rgba(pRgb,isRest?0.28:0.46));
    halo.addColorStop(0.55,rgba(sRgb,isRest?0.1:0.18));
    halo.addColorStop(1,'rgba(0,0,0,0)');
  }
  ctx.fillStyle=halo;ctx.beginPath();ctx.arc(cx,cy,glowR,0,Math.PI*2);ctx.fill();

  if(ent.poke>0.03){
    const ph=1-ent.poke;
    ctx.beginPath();ctx.arc(cx,cy,R*(1.1+ph*1.4),0,Math.PI*2);
    ctx.strokeStyle=rgba(cRgb,ent.poke*0.75);ctx.lineWidth=mini?1.2:2;ctx.stroke();
  }
  if(isBlocked){
    // Rotating crimson dashed lock halo (visible in both hero & mini icons!)
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash(mini?[3,3]:[8,6]);
    ctx.arc(cx,cy,R*(mini?1.52:1.48),t*0.65,t*0.65+Math.PI*2);
    ctx.strokeStyle='rgba(255,77,115,0.82)';
    ctx.lineWidth=mini?1.2:1.8;
    ctx.stroke();
    ctx.restore();
    if(!mini){
      for(let wv=0;wv<2;wv++){
        const ph=(t*0.9+wv*0.5)%1;
        ctx.beginPath();ctx.arc(cx,cy,R*(1.2+ph*1.15),0,Math.PI*2);
        ctx.strokeStyle=`rgba(255,77,115,${((1-ph)*0.62).toFixed(3)})`;
        ctx.lineWidth=1.6;ctx.stroke();
      }
    }
  } else if(isWaiting){
    // Warm amber sonar ripples
    if(mini){
      ctx.beginPath();ctx.arc(cx,cy,R*1.5,0,Math.PI*2);
      ctx.strokeStyle='rgba(255,184,77,0.65)';ctx.lineWidth=1.1;ctx.stroke();
    } else {
      for(let wv=0;wv<2;wv++){
        const ph=(t*0.65+wv*0.5)%1;
        ctx.beginPath();ctx.arc(cx,cy,R*(1.18+ph*1.1),0,Math.PI*2);
        ctx.strokeStyle=`rgba(255,184,77,${((1-ph)*0.55).toFixed(3)})`;
        ctx.lineWidth=1.5;ctx.stroke();
      }
    }
  } else if(isWork){
    // Living speaking / acoustic voice-wave rings pulsing in syllabic cadence
    ctx.save();
    ctx.globalCompositeOperation='lighter';
    const waveCount=mini?1:2;
    const ptsN=mini?40:84;
    for(let wv=0;wv<waveCount;wv++){
      const baseRing=R*(mini?1.44:(1.28+wv*0.22));
      const amp=(mini?1.8:(6.5+wv*3.5))*speechPulse;
      ctx.beginPath();
      for(let i=0;i<=ptsN;i++){
        const a=(i/ptsN)*Math.PI*2;
        const mod=
          Math.sin(a*6 + t*(5.2+wv*1.8))*0.55 +
          Math.cos(a*11 - t*(7.5-wv*1.4))*0.3 +
          Math.sin(a*3 + t*3.1)*0.25;
        const rr=baseRing + mod*amp + speechPulse*(mini?1.2:4);
        const px=cx+Math.cos(a)*rr, py=cy+Math.sin(a)*rr;
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      }
      ctx.closePath();
      const alpha=(mini?0.42:(0.28-wv*0.08)) + speechPulse*0.34;
      ctx.strokeStyle=wv===0?rgba(pRgb,alpha.toFixed(3)):rgba(cRgb,(alpha*0.72).toFixed(3));
      ctx.lineWidth=mini?1.0:(1.45-wv*0.35);
      ctx.stroke();
    }
    ctx.restore();
  }

  const satNodes=[];
  const satSpeed=(isRest?0.45:(ent.status==='working'?1.45:0.95))+ent.poke*2.2;
  for(let i=0;i<ent.satellites;i++){
    const tiltZ=-0.45+i*0.62,orbitR=R*(1.42+(i%2)*0.22+ent.poke*0.25);
    const a=t*satSpeed*(i%2?1:-0.85)+i*(Math.PI*2/Math.max(1,ent.satellites));
    const ox=Math.cos(a)*orbitR,oy=Math.sin(a)*orbitR*0.42,oz=Math.sin(a)*orbitR;
    satNodes.push({x:cx+ox*Math.cos(tiltZ)-oy*Math.sin(tiltZ),y:cy+ox*Math.sin(tiltZ)+oy*Math.cos(tiltZ),z:oz,orbitR,tiltZ,a,idx:i});
  }

  for(let r=0;r<ent.rings;r++){
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-0.4+r*0.72+t*0.08*(r%2?1:-1));
    ctx.beginPath();if(isRest)ctx.setLineDash([2,4]);
    const rr=R*(1.36+r*0.2);ctx.ellipse(0,0,rr,rr*0.42,0,0,Math.PI*2);
    ctx.strokeStyle=rgba(r%2?sRgb:pRgb,mini?0.34:0.26);ctx.lineWidth=mini?0.85:1.05;ctx.stroke();ctx.restore();
  }

  function drawSat(s){
    const behind=s.z<0,sr=(mini?2.1:4.6)*(behind?0.72:1.12);
    ctx.save();ctx.globalAlpha=behind?(isRest?0.25:0.42):(isRest?0.65:0.98);
    if(!mini&&ent.status==='working'){
      for(let k=1;k<=8;k++){
        const aa=s.a-k*0.09*(s.idx%2?1:-0.85),ox=Math.cos(aa)*s.orbitR,oy=Math.sin(aa)*s.orbitR*0.42;
        ctx.beginPath();ctx.arc(cx+ox*Math.cos(s.tiltZ)-oy*Math.sin(s.tiltZ),cy+ox*Math.sin(s.tiltZ)+oy*Math.cos(s.tiltZ),sr*(1-k/9)*0.75,0,Math.PI*2);
        ctx.fillStyle=rgba(pRgb,(1-k/9)*0.45);ctx.fill();
      }
    }
    const sg=ctx.createRadialGradient(s.x-sr*0.3,s.y-sr*0.3,0.4,s.x,s.y,sr*1.3);
    sg.addColorStop(0,'#ffffff');sg.addColorStop(0.5,rgba(s.idx%2?sRgb:pRgb,1));sg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=sg;ctx.beginPath();ctx.arc(s.x,s.y,sr*1.3,0,Math.PI*2);ctx.fill();ctx.restore();
  }

  satNodes.filter(s=>s.z<0).forEach(drawSat);

  const geo=getSolid(ent.faces);
  const cosY=Math.cos(ent.rotY),sinY=Math.sin(ent.rotY),cosX=Math.cos(ent.rotX),sinX=Math.sin(ent.rotX);
  const morphAmt=(ent.morph/100)*0.22+ent.poke*0.14,fov=R*4.4;
  const transformed=geo.v.map((pt,vi)=>{
    const wave=morphAmt>0?1+Math.sin(pt[0]*3.4+t*2.1+vi*0.4)*Math.cos(pt[1]*3.1-t*1.7)*morphAmt:1;
    const vx=pt[0]*wave,vy=pt[1]*wave,vz=pt[2]*wave;
    const x1=vx*cosY-vz*sinY,z1=vx*sinY+vz*cosY,y2=vy*cosX-z1*sinX,z2=vy*sinX+z1*cosX;
    const persp=fov/(fov-z2*R);
    return{x:cx+x1*R*persp,y:cy+y2*R*persp,z:z2,rx:x1,ry:y2,rz:z2};
  });
  const faces=geo.f.map(idxs=>{
    const pts=idxs.map(i=>transformed[i]);
    const avgZ=pts.reduce((acc,p)=>acc+p.z,0)/pts.length;
    const a=pts[0],b=pts[1],c=pts[2];
    const n=norm(cross([b.rx-a.rx,b.ry-a.ry,b.rz-a.rz],[c.rx-a.rx,c.ry-a.ry,c.rz-a.rz]));
    return{pts,avgZ,light:Math.max(0.12,Math.abs(dot(n,norm([-0.45,-0.55,0.72]))))};
  }).sort((a,b)=>a.avgZ-b.avgZ);

  const coreG=ctx.createRadialGradient(cx-R*0.18,cy-R*0.2,1,cx,cy,R*0.72);
  coreG.addColorStop(0,rgba(cRgb,isRest?0.45:0.88));coreG.addColorStop(0.5,rgba(pRgb,isRest?0.22:0.46));coreG.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=coreG;ctx.beginPath();ctx.arc(cx,cy,R*0.72,0,Math.PI*2);ctx.fill();

  for(const face of faces){
    ctx.beginPath();face.pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));ctx.closePath();
    const front=face.avgZ>0,fillAlpha=((front?0.22:0.08)+face.light*(front?0.34:0.12))*(isRest?0.65:1);
    const mr=Math.min(255,Math.round(pRgb[0]*(0.55+face.light*0.45)+cRgb[0]*face.light*0.22));
    const mg=Math.min(255,Math.round(pRgb[1]*(0.55+face.light*0.45)+cRgb[1]*face.light*0.22));
    const mb=Math.min(255,Math.round(pRgb[2]*(0.55+face.light*0.45)+cRgb[2]*face.light*0.22));
    ctx.fillStyle=`rgba(${mr},${mg},${mb},${fillAlpha.toFixed(3)})`;ctx.fill();
    ctx.strokeStyle=front?rgba(cRgb,(0.35+face.light*0.52)*(isRest?0.6:1)):rgba(sRgb,0.22);
    ctx.lineWidth=mini?(front?0.9:0.5):(front?1.3:0.75);ctx.stroke();
  }
  satNodes.filter(s=>s.z>=0).forEach(drawSat);
}

/** Advance spin, inertia and poke of one entity by dt seconds (t = time in seconds). */
function stepEntity(e,dt,t){
  const baseSpin=e.status==='resting'?0.18:(e.status==='working'?0.65:0.4);
  e.rotY+=(baseSpin+e.velY)*dt;
  e.rotX+=(0.14*Math.sin(t*0.6)+e.velX)*dt;
  e.velX*=Math.pow(0.06,dt);e.velY*=Math.pow(0.06,dt);
  if(e.poke>0)e.poke=Math.max(0,e.poke-dt*2.1);
}

export {FACE_STEPS,PALETTES,STATUS_META,getSolid,getFaceMeta,hashStr,encodeSeed,decodeSeed,randomSeed,generateEntityFromSeed,entityFromText,hexRgb,drawLivingEntity,stepEntity};
