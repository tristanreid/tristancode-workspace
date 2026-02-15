var Q={pos:"#22c55e",neg:"#ef4444"},W=["#dc2626","#ef4444","#f97316","#fb923c","#fbbf24","#a3e635","#4ade80","#22d3ee","#818cf8","#a78bfa"],Z=`
.fwe {
  position: relative;
  width: 960px;
  max-width: calc(100vw - 2rem);
  left: 50%;
  transform: translateX(-50%);
  margin: 2rem 0;
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid #334155;
  border-radius: 12px;
  overflow: hidden;
  background: #0f172a;
}

/* \u2500\u2500 toolbar \u2500\u2500 */
.fwe-toolbar {
  display: flex; align-items: center; gap: 1.25rem;
  padding: 0.75rem 1rem;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  flex-wrap: wrap;
}
.fwe-slider-group {
  display: flex; align-items: center; gap: 0.4rem;
}
.fwe-slider-group label {
  font-size: 0.78rem; font-weight: 600; color: #94a3b8;
  white-space: nowrap; min-width: 3.2rem;
}
.fwe-slider-group input[type="range"] {
  width: 90px; accent-color: #818cf8;
}
.fwe-slider-group .fwe-val {
  font-size: 0.72rem; color: #64748b; width: 2rem; text-align: right;
  font-variant-numeric: tabular-nums;
}
.fwe-toolbar select {
  font-size: 0.8rem; padding: 0.3rem 0.5rem;
  border-radius: 6px; border: 1px solid #475569;
  background: #0f172a; color: #e2e8f0; cursor: pointer;
}
.fwe-divider {
  width: 1px; height: 1.4rem; background: #334155;
}
.fwe-toolbar button {
  font-size: 0.75rem; padding: 0.3rem 0.7rem;
  border-radius: 6px; border: 1px solid #475569;
  background: #1e293b; color: #94a3b8; cursor: pointer;
  transition: all 0.15s;
}
.fwe-toolbar button:hover { background: #334155; color: #e2e8f0; }

/* \u2500\u2500 legend \u2500\u2500 */
.fwe-legend {
  display: flex; align-items: center; gap: 1rem;
  padding: 0.4rem 1rem;
  background: #1e293b; border-bottom: 1px solid #334155;
  font-size: 0.75rem; color: #94a3b8; flex-wrap: wrap;
}
.fwe-legend-item { display: flex; align-items: center; gap: 0.35rem; }
.fwe-legend-dot { width: 10px; height: 10px; border-radius: 50%; }

/* \u2500\u2500 status bar \u2500\u2500 */
.fwe-status {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.35rem 1rem;
  background: #1e293b; border-bottom: 1px solid #334155;
  font-size: 0.72rem; color: #64748b;
  font-variant-numeric: tabular-nums;
}
.fwe-status-weights { font-weight: 600; color: #94a3b8; }
.fwe-status-badge {
  padding: 0.15rem 0.5rem; border-radius: 4px;
  background: rgba(129, 140, 248, 0.15); color: #818cf8;
  font-size: 0.68rem; font-weight: 600;
}

/* \u2500\u2500 canvas \u2500\u2500 */
.fwe-canvas-wrap {
  position: relative; width: 100%; height: 580px;
}
.fwe-canvas-wrap canvas {
  display: block; width: 100%; height: 100%;
  cursor: crosshair;
}

/* \u2500\u2500 tooltip \u2500\u2500 */
.fwe-tooltip {
  position: fixed; pointer-events: none;
  background: #1e293b; border: 1px solid #475569;
  border-radius: 8px; padding: 0.6rem 0.8rem;
  max-width: 320px; font-size: 0.8rem;
  color: #e2e8f0; line-height: 1.45;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  opacity: 0; transition: opacity 0.12s; z-index: 1000;
  font-family: var(--font-sans, system-ui, sans-serif);
}
.fwe-tooltip.visible { opacity: 1; }
.fwe-tooltip-meta {
  display: flex; gap: 0.5rem; align-items: center;
  margin-bottom: 0.4rem; font-weight: 600;
}
.fwe-tooltip-badge {
  padding: 0.15rem 0.5rem; border-radius: 4px;
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;
}
.fwe-tooltip-badge.pos { background: rgba(34,197,94,0.2); color: #4ade80; }
.fwe-tooltip-badge.neg { background: rgba(239,68,68,0.2); color: #f87171; }
.fwe-tooltip-text { color: #94a3b8; font-style: italic; }

/* \u2500\u2500 loading \u2500\u2500 */
.fwe-loading {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; background: #0f172a;
  color: #94a3b8; font-size: 0.9rem; gap: 0.75rem; z-index: 10;
}
.fwe-spinner {
  width: 32px; height: 32px;
  border: 3px solid #334155; border-top-color: #818cf8;
  border-radius: 50%;
  animation: fwe-spin 0.8s linear infinite;
}
@keyframes fwe-spin { to { transform: rotate(360deg); } }
`,Y=!1;function ee(){if(Y)return;let i=document.createElement("style");i.textContent=Z,document.head.appendChild(i),Y=!0}function te(i){let u=new Map;for(let s=0;s<i.length;s++){let[w,a,x]=i[s].w;u.set($(w,a,x),s)}return u}function $(i,u,s){let w=i+u+s||1,a=Math.round(i/w*1e6)/1e6,x=Math.round(u/w*1e6)/1e6,k=Math.round(s/w*1e6)/1e6;return`${a},${x},${k}`}function ne(i){if(!i)return;ee(),i.innerHTML=`
    <div class="fwe">
      <div class="fwe-toolbar">
        <div class="fwe-slider-group">
          <label>Meaning</label>
          <input type="range" data-proj="semantic" min="0" max="100" step="25" value="100">
          <span class="fwe-val" data-val="semantic">100</span>
        </div>
        <div class="fwe-slider-group">
          <label>Genre</label>
          <input type="range" data-proj="genre" min="0" max="100" step="25" value="0">
          <span class="fwe-val" data-val="genre">0</span>
        </div>
        <div class="fwe-slider-group">
          <label>Style</label>
          <input type="range" data-proj="style" min="0" max="100" step="25" value="0">
          <span class="fwe-val" data-val="style">0</span>
        </div>
        <span class="fwe-divider"></span>
        <select data-ctl="colorBy">
          <option value="sentiment">Sentiment</option>
          <option value="rating">Rating (1\u201310)</option>
        </select>
        <button data-action="reset">Reset</button>
      </div>
      <div class="fwe-status" data-el="status">
        <span class="fwe-status-weights" data-el="statusWeights">Meaning 100%</span>
        <span class="fwe-status-badge">genuine UMAP</span>
      </div>
      <div class="fwe-legend" data-el="legend"></div>
      <div class="fwe-canvas-wrap" data-el="wrap">
        <canvas data-el="canvas"></canvas>
        <div class="fwe-loading" data-el="loading">
          <div class="fwe-spinner"></div>
          <span>Loading 10,000 reviews \xD7 15 projections\u2026</span>
        </div>
      </div>
    </div>`;let u=document.createElement("div");u.className="fwe-tooltip",document.body.appendChild(u);let s=e=>i.querySelector(e),w=s('[data-el="wrap"]'),a=s('[data-el="canvas"]'),x=s('[data-el="loading"]'),k=s('[data-el="legend"]'),q=s('[data-el="statusWeights"]'),A=s('[data-ctl="colorBy"]'),O=s('[data-action="reset"]'),o=a.getContext("2d"),g=Math.min(window.devicePixelRatio,2),m=null,T=null,y={semantic:100,genre:0,style:0},S="sentiment",j=-1,h,v,E,L,C=!1,M=-1;function z(){let e=w.clientWidth,t=w.clientHeight;a.width=e*g,a.height=t*g,a.style.width=e+"px",a.style.height=t+"px",o.setTransform(g,0,0,g,0,0)}new ResizeObserver(z).observe(w),z();function P(){S==="sentiment"?k.innerHTML=H("#22c55e","Positive")+H("#ef4444","Negative"):k.innerHTML=W.map((e,t)=>H(e,String(t+1))).join("")}function H(e,t){return`<div class="fwe-legend-item"><span class="fwe-legend-dot" style="background:${e}"></span>${t}</div>`}P();function V(e){if(!m)return;let t=m.grid[e],f=t.coords;for(let r=0;r<m.count;r++)E[r]=f[r*2],L[r]=f[r*2+1];j=e,C=!0;let[p,l,n]=t.w,c=r=>{let b=r*100;return b===Math.round(b)?`${Math.round(b)}%`:`${b.toFixed(1)}%`},d=[];p>0&&d.push(`Meaning ${c(p)}`),l>0&&d.push(`Genre ${c(l)}`),n>0&&d.push(`Style ${c(n)}`),q.textContent=d.join(" + ")||"Meaning 100%"}function F(){if(!m||!T)return;let e=$(y.semantic,y.genre,y.style),t=T.get(e);t!==void 0&&t!==j&&V(t)}function R(e){return(e+1)*.5*(a.width/g-40)+20}function D(e){return(1-(e+1)*.5)*(a.height/g-40)+20}function _(e){return(e-20)/((a.width/g-40)*.5)-1}function K(e){return 1-(e-20)/((a.height/g-40)*.5)}function I(e){let t=m.meta[e];return S==="sentiment"?Q[t.s]||"#94a3b8":W[Math.max(0,Math.min(9,t.r-1))]}function U(){if(!m)return;let e=a.width/g,t=a.height/g;o.clearRect(0,0,e,t);let f=2.5,p=m.count,l=new Map;for(let n=0;n<p;n++){let c=I(n),d=l.get(c);d||(d=[],l.set(c,d)),d.push(n)}o.globalAlpha=.7;for(let[n,c]of l){o.fillStyle=n,o.beginPath();for(let d of c){let r=R(h[d]),b=D(v[d]);o.moveTo(r+f,b),o.arc(r,b,f,0,Math.PI*2)}o.fill()}if(M>=0){o.globalAlpha=1,o.fillStyle="#ffffff",o.strokeStyle=I(M),o.lineWidth=2,o.beginPath();let n=R(h[M]),c=D(v[M]);o.arc(n,c,5,0,Math.PI*2),o.fill(),o.stroke()}o.globalAlpha=1}let G=.1;function N(){if(requestAnimationFrame(N),!!m){if(C){let e=0;for(let t=0;t<m.count;t++)h[t]+=(E[t]-h[t])*G,v[t]+=(L[t]-v[t])*G,e=Math.max(e,Math.abs(E[t]-h[t]),Math.abs(L[t]-v[t]));e<1e-4&&(C=!1)}U()}}function J(e,t,f){let p=m.meta[e];u.innerHTML=`
      <div class="fwe-tooltip-meta">
        <span class="fwe-tooltip-badge ${p.s}">${p.s==="pos"?"Positive":"Negative"}</span>
        <span>${p.r}/10</span>
      </div>
      <div class="fwe-tooltip-text">"${p.t}"</div>`,u.classList.add("visible");let l=t+16,n=f-20;l+340>window.innerWidth&&(l=t-340),n+140>window.innerHeight&&(n=f-140),n<8&&(n=8),u.style.left=l+"px",u.style.top=n+"px"}function X(){u.classList.remove("visible")}a.addEventListener("pointermove",e=>{if(!m)return;let t=a.getBoundingClientRect(),f=e.clientX-t.left,p=e.clientY-t.top,l=_(f),n=K(p),c=-1,d=.02;for(let r=0;r<m.count;r++){let b=(h[r]-l)**2+(v[r]-n)**2;b<d&&(d=b,c=r)}M=c,c>=0?(J(c,e.clientX,e.clientY),a.style.cursor="pointer"):(X(),a.style.cursor="crosshair")}),a.addEventListener("pointerleave",()=>{X(),M=-1});let B=i.querySelectorAll("input[data-proj]");B.forEach(e=>{let t=e.dataset.proj,f=i.querySelector(`[data-val="${t}"]`);e.addEventListener("input",()=>{y[t]=parseInt(e.value),f.textContent=e.value,F()})}),A.addEventListener("change",()=>{S=A.value,P()}),O.addEventListener("click",()=>{y={semantic:100,genre:0,style:0},B.forEach(e=>{let t=e.dataset.proj;e.value=String(y[t]),i.querySelector(`[data-val="${t}"]`).textContent=String(y[t])}),F()}),fetch("/data/exploring-data/feature-projections.json").then(e=>{if(!e.ok)throw new Error(e.statusText);return e.json()}).then(e=>{m=e,T=te(e.grid);let t=e.count;h=new Float32Array(t),v=new Float32Array(t),E=new Float32Array(t),L=new Float32Array(t);let f=$(100,0,0),p=T.get(f)??0,l=e.grid[p].coords;for(let n=0;n<t;n++)h[n]=l[n*2],v[n]=l[n*2+1],E[n]=h[n],L[n]=v[n];j=p,x.style.display="none",N()}).catch(e=>{x.innerHTML=`<span style="color:#f87171">Failed to load data: ${e.message}</span>`})}export{ne as mount};
