(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]).replace(/\./g,'٫');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2600)};
const f1=n=>(Math.round(n*10)/10).toLocaleString('en-US');
const COL={col:'#cfe3ff',raf:'#7fd3ff',pur:'#8fb0d4',brc:'#ff7a3d',cld:'#7fd3ff',dim:'#ffb38f'};
const LAYERS=[['col','ستون و پی'],['raf','تیر / خرپا'],['pur','لاپه و دیوارکوب'],['brc','بادبند'],['cld','پوشش'],['dim','ابعاد']];
const STAGES=['پی و ستون‌ها','تیرها و خرپاها','لاپه‌ها و دیوارکوب‌ها','بادبندها','پوشش سقف و دیوار','کامل'];

/* ---------- geometry ---------- */
function gen(p){const{S,L,H,P,B,t}=p,Hr=H+S/2*P/100,n=Math.max(2,Math.ceil(L/B)+1),bay=L/(n-1),segs=[],faces=[],z0=-L/2;
  const seg=(a,b,l,k)=>segs.push({a,b,l,k});
  for(let i=0;i<n;i++){const z=z0+i*bay,k=i/(n-1);
    [-S/2,S/2].forEach(x=>{seg([x,0,z],[x,H,z],'col',k);const s=.5;seg([x-s,0,z-s],[x+s,0,z-s],'col',k);seg([x+s,0,z-s],[x+s,0,z+s],'col',k);seg([x+s,0,z+s],[x-s,0,z+s],'col',k);seg([x-s,0,z+s],[x-s,0,z-s],'col',k)});
    seg([-S/2,H,z],[0,Hr,z],'raf',k);seg([0,Hr,z],[S/2,H,z],'raf',k);
    if(t==='truss'){seg([-S/2,H-1.4,z],[S/2,H-1.4,z],'raf',k);const m=8;for(let j=1;j<m;j++){const x=-S/2+S*j/m,yt=H+(S/2-Math.abs(x))*P/100;seg([x,H-1.4,z],[x,yt,z],'raf',k);
        const x2=-S/2+S*(j+(j<m/2?-1:1))/m,yt2=H+(S/2-Math.abs(x2))*P/100;if(j!==m/2)seg([x,H-1.4,z],[x2,yt2,z],'raf',k)}seg([-S/2,H-1.4,z],[-S/2+S/8,H+(S/2-S/8*3)*P/100*0+((S/2-Math.abs(-S/2+S/8))*P/100),z],'raf',k)}
    else{const d=Math.max(.6,S/32);seg([-S/2,H-d,z],[-S/2+S*.18,H+S*.18*P/100-d*.45,z],'raf',k);seg([S/2,H-d,z],[S/2-S*.18,H+S*.18*P/100-d*.45,z],'raf',k)}}
  const m=Math.max(2,Math.round(S/2/1.6));for(let j=0;j<=m;j++){const x=-S/2+S/2*j/m,y=H+(x+S/2)*P/100;seg([x,y,z0],[x,y,-z0],'pur',j/m);if(j<m)seg([-x,y,z0],[-x,y,-z0],'pur',j/m)}
  for(let y=2;y<H-.5;y+=2){seg([-S/2,y,z0],[-S/2,y,-z0],'pur',y/H);seg([S/2,y,z0],[S/2,y,-z0],'pur',y/H)}
  [[0,1],[n-2,n-1]].forEach(([a,b],q)=>{const za=z0+a*bay,zb=z0+b*bay;[-1,1].forEach(sg=>{
    seg([sg*S/2,0,za],[sg*S/2,H,zb],'brc',q);seg([sg*S/2,H,za],[sg*S/2,0,zb],'brc',q);
    seg([sg*S/2,H,za],[0,Hr,zb],'brc',q);seg([0,Hr,za],[sg*S/2,H,zb],'brc',q)})});
  faces.push([[-S/2,H,z0],[0,Hr,z0],[0,Hr,-z0],[-S/2,H,-z0]],[[S/2,H,z0],[0,Hr,z0],[0,Hr,-z0],[S/2,H,-z0]],[[-S/2,0,z0],[-S/2,H,z0],[-S/2,H,-z0],[-S/2,0,-z0]],[[S/2,0,z0],[S/2,H,z0],[S/2,H,-z0],[S/2,0,-z0]],
    [[-S/2,0,-z0],[-S/2,H,-z0],[0,Hr,-z0],[S/2,H,-z0],[S/2,0,-z0]]);
  const dims=[{a:[-S/2,-1.5,-z0+0],b:[S/2,-1.5,-z0],tx:f1(S)+' m'},{a:[S/2+2,0,z0],b:[S/2+2,0,-z0],tx:f1(L)+' m'},{a:[-S/2-2,0,-z0],b:[-S/2-2,H,-z0],tx:f1(H)+' m'},{a:[0,Hr+1.4,-z0],b:[0,Hr+1.4,-z0],tx:'+'+f1(Hr)}];
  return{segs,faces,dims,Hr,n,bay}}

/* ---------- 3D viewer ---------- */
const cv=$('#cv'),cx=cv.getContext('2d');cx.direction='ltr';
const VIEWS={iso:[-.72,.48],front:[0,0],side:[Math.PI/2,0],top:[0,Math.PI/2-.0001]};
const S={p:{S:24,L:60,H:8,P:10,B:6,t:'portal'},yaw:-.72,pitch:.48,ty:-.72,tp:.48,zoom:1.2,on:{col:1,raf:1,pur:1,brc:1,cld:1,dim:1},build:5,auto:!reduce,g:null,coefEdited:false};
function size(){const d=Math.min(devicePixelRatio||1,2),w=cv.clientWidth,h=cv.clientHeight;cv.width=w*d;cv.height=h*d;cx.setTransform(d,0,0,d,0,0);cx.direction='ltr';return[w,h]}
let W=0,Hh=0;
function draw(){const g=S.g,{S:sp,L,H}=S.p;if(!W)[W,Hh]=size();cx.clearRect(0,0,W,Hh);
  const c1=Math.cos(S.yaw),s1=Math.sin(S.yaw),c2=Math.cos(S.pitch),s2=Math.sin(S.pitch);
  const diag=Math.hypot(sp+6,L+6,g.Hr+3),k=S.zoom*Math.min(W,Hh)/diag*.98,ox=W/2,oy=Hh/2+ (g.Hr/2)*k*c2*0.9;
  const P=([x,y,z])=>{const x1=x*c1-z*s1,z1=x*s1+z*c1,y2=y*c2-z1*s2;return[ox+x1*k,oy-y2*k+ (s2>.9?-(g.Hr/2)*k*.9:0)]};
  // ground grid
  cx.strokeStyle='rgba(207,227,255,.08)';cx.lineWidth=1;const gs=6,ext=Math.max(sp,L)/2+12;
  for(let v=-ext;v<=ext;v+=gs){let a=P([v,0,-ext]),b=P([v,0,ext]);cx.beginPath();cx.moveTo(...a);cx.lineTo(...b);cx.stroke();a=P([-ext,0,v]);b=P([ext,0,v]);cx.beginPath();cx.moveTo(...a);cx.lineTo(...b);cx.stroke()}
  const vis=(l,kk)=>{const i=['col','raf','pur','brc','cld'].indexOf(l);const f=clamp(S.build-i);return S.on[l]?(l==='pur'?f:(kk<=f+1e-6?1:0)):0};
  if(S.on.cld&&S.build>4){const a=clamp(S.build-4);cx.fillStyle=`rgba(127,211,255,${.10*a})`;cx.strokeStyle=`rgba(127,211,255,${.25*a})`;g.faces.forEach(f=>{cx.beginPath();f.forEach((p,i)=>{const q=P(p);i?cx.lineTo(...q):cx.moveTo(...q)});cx.closePath();cx.fill();cx.stroke()})}
  ['pur','col','raf','brc'].forEach(l=>{cx.strokeStyle=COL[l];cx.lineWidth=l==='col'?2:l==='raf'?1.8:l==='brc'?1.3:1;cx.globalAlpha=l==='pur'?.8:1;cx.beginPath();
    g.segs.forEach(s=>{if(s.l!==l)return;const v=vis(l,s.k);if(!v)return;let b=s.b;if(l==='pur'&&v<1)b=s.a.map((a,i)=>a+(s.b[i]-a)*v);const A=P(s.a),Bp=P(b);cx.moveTo(...A);cx.lineTo(...Bp)});cx.stroke()});
  cx.globalAlpha=1;
  if(S.on.dim&&S.build>=5){cx.strokeStyle=COL.dim;cx.fillStyle=COL.dim;cx.lineWidth=1;cx.font='600 12px ui-monospace,Menlo,monospace';cx.textAlign='center';
    g.dims.forEach(d=>{const A=P(d.a),B=P(d.b);if(Math.hypot(A[0]-B[0],A[1]-B[1])>4){cx.beginPath();cx.moveTo(...A);cx.lineTo(...B);cx.stroke();[A,B].forEach(q=>{cx.beginPath();cx.arc(q[0],q[1],2.5,0,7);cx.fill()})}
      const m=[(A[0]+B[0])/2,(A[1]+B[1])/2];const tw=cx.measureText(d.tx).width+10;cx.fillStyle='rgba(15,44,76,.9)';cx.fillRect(m[0]-tw/2,m[1]-9,tw,18);cx.fillStyle=COL.dim;cx.fillText(d.tx,m[0],m[1]+4)})}
}
let raf=0;function loop(){raf=0;let moving=false;
  if(S.auto){S.ty+=.0025;moving=true}
  const dy=S.ty-S.yaw,dp=S.tp-S.pitch;if(Math.abs(dy)>.0005||Math.abs(dp)>.0005){S.yaw+=dy*.14;S.pitch+=dp*.14;moving=true}
  draw();if(moving&&vis)raf=requestAnimationFrame(loop)}
const kick=()=>{if(!raf)raf=requestAnimationFrame(loop)};let vis=true;
function update(){const p=S.p;p.S=+$('#S').value;p.L=+$('#L').value;p.H=+$('#H').value;p.P=+$('#P').value;p.B=+$('#B').value;p.t=$('input[name=t]:checked').value;
  S.g=gen(p);$('#oS').textContent=p.S+' m';$('#oL').textContent=p.L+' m';$('#oH').textContent=p.H+' m';$('#oP').textContent=p.P+' %';$('#oB').textContent=p.B+' m';
  const A=p.S*p.L,V=A*(p.H+(S.g.Hr-p.H)/2);
  $('#stats').innerHTML=`<div><dt>زیربنا</dt><dd>${Math.round(A).toLocaleString('en-US')} <small>m²</small></dd></div><div><dt>حجم داخلی</dt><dd>${Math.round(V).toLocaleString('en-US')} <small>m³</small></dd></div>
   <div><dt>تعداد قاب</dt><dd>${S.g.n} <small>@ ${f1(S.g.bay)} m</small></dd></div><div><dt>ارتفاع تاج</dt><dd>${f1(S.g.Hr)} <small>m</small></dd></div>`;
  if(!S.coefEdited)$('#coef').value=Math.round((20+p.S*.5)*(p.t==='truss'?.9:1));
  const c=parseFloat(($('#coef').value||'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))||0;$('#wt').textContent='≈ '+f1(A*c/1000)+' t';
  $('#spec').value=`نوع قاب: ${p.t==='truss'?'خرپایی':'تیرورقی'} · دهانه ${p.S} m · طول ${p.L} m · ارتفاع ستون ${p.H} m · شیب ${p.P}% · فاصله‌ی قاب ${p.B} m`;
  kick()}
function buildViewer(){
  $('#layers').innerHTML=LAYERS.map(([id,n])=>`<label><input type="checkbox" data-l="${id}" checked><span style="--c:${COL[id]}"><i></i>${n}</span></label>`).join('');
  $$('#layers input').forEach(i=>i.onchange=()=>{S.on[i.dataset.l]=i.checked?1:0;kick()});
  $$('.ctrls input').forEach(i=>i.addEventListener('input',update));$('#coef').addEventListener('input',()=>{S.coefEdited=true;update()});
  $$('.views button').forEach(b=>b.onclick=()=>{const[y,p]=VIEWS[b.dataset.v];S.auto=false;S.ty=y+Math.round((S.yaw-y)/(2*Math.PI))*2*Math.PI;S.tp=p;$$('.views button').forEach(x=>x.setAttribute('aria-pressed',x===b));kick()});
  $('#zin').onclick=()=>{S.zoom=Math.min(2.6,S.zoom*1.2);kick()};$('#zout').onclick=()=>{S.zoom=Math.max(.5,S.zoom/1.2);kick()};
  let drag=null;cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,yw:S.ty,pt:S.tp};S.auto=false;cv.setPointerCapture(e.pointerId)});
  cv.addEventListener('pointermove',e=>{if(!drag)return;S.ty=drag.yw+(e.clientX-drag.x)*.008;if(e.pointerType==='mouse')S.tp=clamp(drag.pt+(e.clientY-drag.y)*.006,-.1,Math.PI/2-.0001);$$('.views button').forEach(x=>x.setAttribute('aria-pressed','false'));kick()});
  ['pointerup','pointercancel'].forEach(ev=>cv.addEventListener(ev,()=>drag=null));
  cv.addEventListener('dblclick',()=>{S.zoom=1.2;$('.views button').click()});
  cv.addEventListener('keydown',e=>{const m={ArrowLeft:[-.15,0],ArrowRight:[.15,0],ArrowUp:[0,-.1],ArrowDown:[0,.1]}[e.key];if(m){S.auto=false;S.ty+=m[0];S.tp=clamp(S.tp+m[1],-.1,Math.PI/2-.0001);kick();e.preventDefault()}
    if(e.key==='+'||e.key==='='){S.zoom*=1.2;kick()}if(e.key==='-'){S.zoom/=1.2;kick()}});
  $('#build').onclick=()=>{S.build=0;const t0=performance.now(),T=reduce?0:6500;const st=$('#stage');
    const f=t=>{S.build=T?clamp((t-t0)/T*5.4,0,5):5;st.textContent=S.build<5?'مرحله: '+STAGES[Math.min(4,Math.floor(S.build))]:'';draw();if(S.build<5)requestAnimationFrame(f);else{st.textContent='';toast('اسکلت کامل شد')}};requestAnimationFrame(f)};
  addEventListener('resize',()=>{[W,Hh]=size();kick()});
  new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis)kick()}).observe(cv);
  [W,Hh]=size();update()}

/* ---------- hero drawing ---------- */
function buildHero(){const svg=$('#heroSvg');const gx=90,gy=350,Sx=460,Hy=190,ry=60;
  svg.innerHTML=`<line class="ax" x1="${gx}" y1="40" x2="${gx}" y2="400"/><line class="ax" x1="${gx+Sx}" y1="40" x2="${gx+Sx}" y2="400"/><line class="ax" x1="${gx+Sx/2}" y1="30" x2="${gx+Sx/2}" y2="400"/>
  <path class="d" d="M40 ${gy}H600"/><path class="d" d="M${gx} ${gy}V${gy-Hy}L${gx+Sx/2} ${gy-Hy-ry}L${gx+Sx} ${gy-Hy}V${gy}" style="--dl:.3s"/>
  <path class="d" d="M${gx+12} ${gy}V${gy-Hy+20}L${gx+110} ${gy-Hy-ry*110/(Sx/2)+14}M${gx+Sx-12} ${gy}V${gy-Hy+20}L${gx+Sx-110} ${gy-Hy-ry*110/(Sx/2)+14}" style="--dl:.7s"/>
  ${[...Array(8)].map((_,i)=>{const x=gx+Sx/16+i*Sx/8,y=gy-Hy-ry*(1-Math.abs(x-gx-Sx/2)/(Sx/2));return`<path class="d" d="M${x} ${y-6}h0" style="--dl:${1+i*.08}s;stroke-width:6"/>`}).join('')}
  <path class="d" d="M${gx-16} ${gy}h32v18h-32zM${gx+Sx-16} ${gy}h32v18h-32z" style="--dl:1s"/>
  <path class="dim" d="M${gx} ${gy+44}H${gx+Sx}M${gx} ${gy+36}v16M${gx+Sx} ${gy+36}v16" style="--dl:1.4s"/>
  <path class="dim" d="M${gx-44} ${gy}V${gy-Hy}M${gx-52} ${gy}h16M${gx-52} ${gy-Hy}h16" style="--dl:1.6s"/>
  <path class="dim" d="M${gx+Sx/2+40} ${gy-Hy-ry+8}l60 0M${gx+Sx/2+40} ${gy-Hy-ry+8}l50 ${ry*50/(Sx/2)}" style="--dl:1.8s"/>
  <text x="${gx+Sx/2}" y="${gy+40}" text-anchor="middle" style="--dl:2s">24.00</text><text x="${gx-58}" y="${gy-Hy/2}" text-anchor="middle" transform="rotate(-90 ${gx-58} ${gy-Hy/2})" style="--dl:2.1s">8.00</text>
  <text x="${gx+Sx/2+108}" y="${gy-Hy-ry+14}" style="--dl:2.2s">10%</text><text x="${gx+Sx/2}" y="22" text-anchor="middle" style="--dl:2.3s">±0.00 / +10.40</text>`;
  svg.querySelectorAll('path,line').forEach(p=>{p.style.setProperty('--l',Math.ceil(p.getTotalLength()+1))})}

/* ---------- story ---------- */
const jit=(i)=>{const x=Math.sin(i*91.7)*43758.5;return(x-Math.floor(x)-.5)};
function wob(d,seed){return d.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g,(m,a,b)=>`${(+a+jit(seed++)*8).toFixed(1)} ${(+b+jit(seed++)*8).toFixed(1)}`)}
function iso(x,y,z){return[300+(x-z)*Math.cos(.52)*8,300-(y*8)-(x+z)*Math.sin(.52)*8]}
function buildStory(){const svg=$('#storySvg');const F='M120 330 L120 190 L300 120 L480 190 L480 330';
  let g0=`<g class="g" data-s="0" opacity="1"><path d="${wob(F,3)}" fill="none" stroke="#5b6b7d" stroke-width="2.2" stroke-linecap="round"/><path d="${wob(F,40)}" fill="none" stroke="#5b6b7d" stroke-width="1.2" opacity=".6"/>
   <path d="${wob('M80 332 L520 332',9)}" stroke="#5b6b7d" stroke-width="1.6"/><text x="300" y="370" text-anchor="middle" font-size="22" fill="#5b6b7d" font-family="Vazirmatn" transform="rotate(-2 300 370)">انبار؟ حدود ۲۴ × ۶۰</text>
   <circle cx="420" cy="80" r="42" fill="none" stroke="#ff7a3d" stroke-width="2"/><text x="420" y="87" text-anchor="middle" font-size="18" fill="#ff7a3d" font-family="Vazirmatn">جرثقیل؟</text></g>`;
  let g1=`<g class="g" data-s="1" opacity="0"><g stroke="#0f2c4c" fill="none"><path d="${F}" stroke-width="2.4"/><path d="M80 330H520" stroke-width="1.6"/><path d="M120 60V360M480 60V360M300 60V360" stroke-dasharray="10 4 2 4" stroke-width="1" stroke="#2f6fb0"/></g>
   <g stroke="#ff7a3d" fill="#ff7a3d" font-family="ui-monospace,Menlo,monospace" font-size="14"><path d="M120 362H480M120 354v16M480 354v16M88 330V190M80 330h16M80 190h16" fill="none"/><text x="300" y="384" text-anchor="middle" stroke="none">24.00</text><text x="70" y="264" text-anchor="middle" stroke="none" transform="rotate(-90 70 264)">8.00</text>
   <text x="300" y="105" text-anchor="middle" stroke="none">+10.40</text><text x="120" y="52" text-anchor="middle" stroke="none">A</text><text x="300" y="52" text-anchor="middle" stroke="none">B</text><text x="480" y="52" text-anchor="middle" stroke="none">C</text></g></g>`;
  // iso model
  let l='';const Sx=24,L=30,H=8,Hr=10.4;for(let i=0;i<=5;i++){const z=-L/2+i*L/5;const pts=[[-Sx/2,0,z],[-Sx/2,H,z],[0,Hr,z],[Sx/2,H,z],[Sx/2,0,z]].map(p=>iso(...p).map(v=>v.toFixed(1)).join(' '));l+=`<path d="M${pts.join('L')}" fill="none" stroke="#0f2c4c" stroke-width="1.8"/>`}
  [[-Sx/2,H],[0,Hr],[Sx/2,H],[-Sx/4,(H+Hr)/2],[Sx/4,(H+Hr)/2]].forEach(([x,y])=>{const a=iso(x,y,-L/2),b=iso(x,y,L/2);l+=`<path d="M${a.join(' ')}L${b.join(' ')}" stroke="#2f6fb0" stroke-width="1"/>`});
  {const a=iso(-Sx/2,0,-L/2),b=iso(-Sx/2,H,-L/2+6),c=iso(-Sx/2,H,-L/2),d=iso(-Sx/2,0,-L/2+6);l+=`<path d="M${a.join(' ')}L${b.join(' ')}M${c.join(' ')}L${d.join(' ')}" stroke="#ff7a3d" stroke-width="1.4"/>`}
  let g2=`<g class="g" data-s="2" opacity="0" transform="translate(0,-20)">${l}<g font-family="ui-monospace,Menlo,monospace" font-size="13" fill="#ff7a3d"><text x="40" y="380">M = 312 kN·m (فرضی)</text><text x="40" y="360">IPE / تیرورق — کنترل شد ✓</text></g></g>`;
  // built
  const q=(...pp)=>pp.map(p=>iso(...p).map(v=>v.toFixed(1)).join(' ')).join('L');
  let stripes='';for(let z=-L/2;z<L/2;z+=1.5)stripes+=`<path d="M${q([Sx/2,0,z],[Sx/2,H,z])}" stroke="#b9c7d6" stroke-width=".8"/>`;
  let g3=`<g class="g" data-s="3" opacity="0" transform="translate(0,-20)"><path d="M${q([-Sx/2-6,0,-L/2-6],[Sx/2+6,0,-L/2-6],[Sx/2+6,0,L/2+6],[-Sx/2-6,0,L/2+6])}Z" fill="#cfd8e0"/>
   <path d="M${q([Sx/2,0,-L/2],[Sx/2,H,-L/2],[Sx/2,H,L/2],[Sx/2,0,L/2])}Z" fill="#e6ecf1" stroke="#0f2c4c"/>${stripes}
   <path d="M${q([-Sx/2,0,-L/2],[-Sx/2,H,-L/2],[0,Hr,-L/2],[Sx/2,H,-L/2],[Sx/2,0,-L/2])}Z" fill="#f6f8fa" stroke="#0f2c4c"/>
   <path d="M${q([-Sx/2,H,-L/2],[0,Hr,-L/2],[0,Hr,L/2],[-Sx/2,H,L/2])}Z" fill="#2f6fb0" stroke="#0f2c4c"/><path d="M${q([0,Hr,-L/2],[Sx/2,H,-L/2],[Sx/2,H,L/2],[0,Hr,L/2])}Z" fill="#4f8fd0" stroke="#0f2c4c"/>
   <path d="M${q([-4,0,-L/2],[-4,5.5,-L/2],[4,5.5,-L/2],[4,0,-L/2])}Z" fill="#0f2c4c"/><path d="M${q([-4,1,-L/2],[4,1,-L/2])}M${q([-4,2.2,-L/2],[4,2.2,-L/2])}M${q([-4,3.4,-L/2],[4,3.4,-L/2])}M${q([-4,4.6,-L/2],[4,4.6,-L/2])}" stroke="#3a5574"/>
   <text x="40" y="380" font-family="Vazirmatn" font-size="14" fill="#0f2c4c">ساخت و نصب: نمونه‌ی فرضی</text></g>`;
  svg.innerHTML=`<rect width="600" height="400" fill="#fff"/>${g0}${g1}${g2}${g3}`;
  const gs=$$('.g',svg),steps=$$('.story-steps li');const set=i=>{gs.forEach((g,n)=>g.setAttribute('opacity',n===i?1:0));steps.forEach((s,n)=>s.classList.toggle('on',n===i))};set(0);
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)set(+e.target.dataset.s)}),{rootMargin:'-45% 0px -45% 0px'});steps.forEach(s=>io.observe(s))}

/* ---------- projects ---------- */
const PJ=[{n:'انبار مرکزی پخش',c:'تهران (فرضی)',S:30,L:90,H:9,P:8,t:'portal',cr:0},{n:'سالن تولید با جرثقیل سقفی',c:'اصفهان (فرضی)',S:24,L:72,H:10,P:10,t:'portal',cr:1},{n:'سوله‌ی مرغداری',c:'قزوین (فرضی)',S:15,L:60,H:5,P:15,t:'truss',cr:0}];
function elev(p){const k=Math.min(260/p.S,140/(p.H+p.S/2*p.P/100)),X=o=>150+o*k,gy=180,Hy=p.H*k,Hr=(p.H+p.S/2*p.P/100)*k;
  let s=`<rect width="300" height="200" fill="#0f2c4c"/><path d="M20 ${gy}H280" stroke="#cfe3ff" stroke-width="1.5"/><path d="M${X(-p.S/2)} ${gy}V${gy-Hy}L150 ${gy-Hr}L${X(p.S/2)} ${gy-Hy}V${gy}" fill="none" stroke="#cfe3ff" stroke-width="2"/>`;
  if(p.t==='truss'){const yb=gy-Hy+10;s+=`<path d="M${X(-p.S/2)} ${yb}H${X(p.S/2)}" stroke="#7fd3ff"/>`;for(let j=1;j<8;j++){const x=-p.S/2+p.S*j/8,yt=gy-Hy-(p.S/2-Math.abs(x))*p.P/100*k;s+=`<path d="M${X(x)} ${yb}V${yt}" stroke="#7fd3ff"/>`}}
  if(p.cr)s+=`<path d="M${X(-p.S/2)+6} ${gy-Hy*.72}H${X(p.S/2)-6}" stroke="#ff7a3d" stroke-width="3"/><path d="M150 ${gy-Hy*.72}v24" stroke="#ff7a3d" stroke-width="1.5"/><text x="150" y="${gy-Hy*.72-6}" fill="#ff7a3d" font-size="11" text-anchor="middle" font-family="Vazirmatn">جرثقیل سقفی</text>`;
  s+=`<text x="150" y="196" fill="#ffb38f" font-size="11" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">${p.S}.00</text>`;return s}
function buildProjects(){$('#proj').innerHTML=PJ.map(p=>`<article class="pcard"><svg viewBox="0 0 300 200" role="img" aria-label="نمای قاب پروژه‌ی ${p.n}">${elev(p)}</svg><div><small>${p.c} · پروژه‌ی فرضی</small><h3>${p.n}</h3><ul><li>${p.S}×${p.L} m</li><li>H ${p.H} m</li><li>${p.P}%</li><li>${p.t==='truss'?'truss':'portal'}</li></ul></div></article>`).join('')}

/* ---------- form ---------- */
function buildForm(){$('#cf').addEventListener('submit',e=>{e.preventDefault();const n=$('#cf [name=n]');if(!n.value.trim()){$('#err').textContent='لطفاً نام یا نام شرکت را بنویس.';n.setAttribute('aria-invalid','true');n.focus();return}
  n.removeAttribute('aria-invalid');$('#err').textContent='';toast('ثبت نمایشی شد؛ چیزی ارسال نشد')})}

buildHero();buildViewer();buildStory();buildProjects();buildForm();
})();
