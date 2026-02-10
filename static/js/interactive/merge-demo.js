import{e as B}from"./chunk-MO3EAYAC.js";import{h as y,i as g,k}from"./chunk-JSVLZHI4.js";var U=`
.merge-demo {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.merge-demo-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 1.25rem;
}

.merge-demo-slider-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 130px;
}

.merge-demo-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  display: flex;
  justify-content: space-between;
}

.merge-demo-label-value {
  font-family: var(--font-mono, monospace);
  color: var(--accent, #0d9488);
}

.merge-demo-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--border, #cbd5e1);
  outline: none;
}
.merge-demo-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent, #0d9488);
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.merge-demo-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent, #0d9488);
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.merge-demo-btn {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  border: 1px solid var(--accent, #0d9488);
  background: var(--accent, #0d9488);
  color: #fff;
}
.merge-demo-btn:hover {
  background: var(--accent-hover, #0f766e);
  border-color: var(--accent-hover, #0f766e);
}

.merge-demo-crowds {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
}

@media (max-width: 580px) {
  .merge-demo-crowds {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  .merge-demo-overlap-indicator {
    display: none;
  }
}

.merge-demo-crowd {
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 8px;
  padding: 1rem;
  background: var(--bg, #fff);
  text-align: center;
}

.merge-demo-crowd-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem;
}

.merge-demo-crowd-title-a {
  color: var(--accent, #0d9488);
}

.merge-demo-crowd-title-b {
  color: #8b5cf6;
}

.merge-demo-crowd-viz {
  min-height: 60px;
  margin-bottom: 0.5rem;
}

.merge-demo-crowd-viz svg {
  display: block;
  margin: 0 auto;
}

.merge-demo-crowd-stat {
  font-family: var(--font-mono, monospace);
  font-size: 0.85rem;
  color: var(--text, #0f172a);
}

.merge-demo-crowd-stat-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.merge-demo-overlap-indicator {
  font-size: 1.5rem;
  color: var(--text-muted, #94a3b8);
  text-align: center;
  line-height: 1;
}

.merge-demo-result {
  border: 2px solid var(--accent, #0d9488);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  background: var(--bg, #fff);
  display: none;
}

.merge-demo-result-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent, #0d9488);
  margin-bottom: 0.75rem;
}

.merge-demo-result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.5rem 1.5rem;
}

.merge-demo-result-stat {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.merge-demo-result-stat-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.merge-demo-result-stat-value {
  font-family: var(--font-mono, monospace);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text, #0f172a);
}

.merge-demo-result-highlight {
  color: var(--accent, #0d9488);
}

.merge-demo-result-wrong {
  color: var(--accent-secondary, #f97316);
  text-decoration: line-through;
  opacity: 0.7;
}

.merge-demo-empty {
  text-align: center;
  padding: 1rem;
  color: var(--text-muted, #94a3b8);
  font-style: italic;
  font-size: 0.9rem;
}
`,A=!1;function Y(){if(A)return;let e=document.createElement("style");e.textContent=U,document.head.appendChild(e),A=!0}function $(e,t,r,d=200){e.innerHTML="";let o=Math.min(t,d),m=e.clientWidth||180,s=Math.ceil(Math.sqrt(o*2)),i=Math.min(4,Math.max(1.5,m/(s*3))),a=i*2.5,p=Math.ceil(o/s),u=Math.min(m,s*a+a),v=p*a+a,b=B(e).append("svg").attr("width",u).attr("height",v).append("g").attr("transform",`translate(${a/2}, ${a/2})`);for(let l=0;l<o;l++){let f=l%s,x=Math.floor(l/s);b.append("circle").attr("cx",f*a).attr("cy",x*a).attr("r",i).attr("fill",r).attr("opacity",.7).attr("stroke","#fff").attr("stroke-width",.3)}}function J(e){if(!e){console.error("merge-demo: mount element not found");return}Y();let t=700,r=500,d=40,o=8;e.innerHTML=`
    <div class="merge-demo">
      <div class="merge-demo-controls">
        <div class="merge-demo-slider-group">
          <label class="merge-demo-label">
            Crowd A
            <span class="merge-demo-label-value" data-display="a">${t}</span>
          </label>
          <input type="range" class="merge-demo-slider" data-slider="a"
                 min="100" max="2000" step="50" value="${t}">
        </div>
        <div class="merge-demo-slider-group">
          <label class="merge-demo-label">
            Crowd B
            <span class="merge-demo-label-value" data-display="b">${r}</span>
          </label>
          <input type="range" class="merge-demo-slider" data-slider="b"
                 min="100" max="2000" step="50" value="${r}">
        </div>
        <div class="merge-demo-slider-group">
          <label class="merge-demo-label">
            Overlap
            <span class="merge-demo-label-value" data-display="overlap">${d}%</span>
          </label>
          <input type="range" class="merge-demo-slider" data-slider="overlap"
                 min="0" max="100" step="5" value="${d}">
        </div>
        <button class="merge-demo-btn" data-btn="run">Run & Merge</button>
      </div>

      <div class="merge-demo-crowds">
        <div class="merge-demo-crowd" data-crowd="a">
          <div class="merge-demo-crowd-title merge-demo-crowd-title-a">Crowd A (Monday)</div>
          <div class="merge-demo-crowd-viz" data-viz="a">
            <div class="merge-demo-empty">Press Run & Merge</div>
          </div>
          <div class="merge-demo-crowd-stat-label">HLL estimate</div>
          <div class="merge-demo-crowd-stat" data-est="a">\u2014</div>
        </div>
        <div class="merge-demo-overlap-indicator">\u2229</div>
        <div class="merge-demo-crowd" data-crowd="b">
          <div class="merge-demo-crowd-title merge-demo-crowd-title-b">Crowd B (Tuesday)</div>
          <div class="merge-demo-crowd-viz" data-viz="b">
            <div class="merge-demo-empty">Press Run & Merge</div>
          </div>
          <div class="merge-demo-crowd-stat-label">HLL estimate</div>
          <div class="merge-demo-crowd-stat" data-est="b">\u2014</div>
        </div>
      </div>

      <div class="merge-demo-result" data-result>
        <div class="merge-demo-result-title">Merged Result (A \u222A B)</div>
        <div class="merge-demo-result-grid">
          <div class="merge-demo-result-stat">
            <span class="merge-demo-result-stat-label">True union size</span>
            <span class="merge-demo-result-stat-value" data-res="true">\u2014</span>
          </div>
          <div class="merge-demo-result-stat">
            <span class="merge-demo-result-stat-label">Merged HLL estimate</span>
            <span class="merge-demo-result-stat-value merge-demo-result-highlight" data-res="merged">\u2014</span>
          </div>
          <div class="merge-demo-result-stat">
            <span class="merge-demo-result-stat-label">Naive sum (A + B)</span>
            <span class="merge-demo-result-stat-value merge-demo-result-wrong" data-res="naive">\u2014</span>
          </div>
          <div class="merge-demo-result-stat">
            <span class="merge-demo-result-stat-label">Overlap</span>
            <span class="merge-demo-result-stat-value" data-res="overlap">\u2014</span>
          </div>
          <div class="merge-demo-result-stat">
            <span class="merge-demo-result-stat-label">Merged error</span>
            <span class="merge-demo-result-stat-value merge-demo-result-highlight" data-res="error">\u2014</span>
          </div>
          <div class="merge-demo-result-stat">
            <span class="merge-demo-result-stat-label">Naive error</span>
            <span class="merge-demo-result-stat-value merge-demo-result-wrong" data-res="naive-error">\u2014</span>
          </div>
        </div>
      </div>
    </div>
  `;let m=e.querySelector('[data-slider="a"]'),s=e.querySelector('[data-slider="b"]'),i=e.querySelector('[data-slider="overlap"]'),a=e.querySelector('[data-display="a"]'),p=e.querySelector('[data-display="b"]'),u=e.querySelector('[data-display="overlap"]'),v=e.querySelector('[data-btn="run"]'),w=e.querySelector('[data-viz="a"]'),b=e.querySelector('[data-viz="b"]'),l=e.querySelector('[data-est="a"]'),f=e.querySelector('[data-est="b"]'),x=e.querySelector("[data-result]"),I=e.querySelector('[data-res="true"]'),R=e.querySelector('[data-res="merged"]'),O=e.querySelector('[data-res="naive"]'),N=e.querySelector('[data-res="overlap"]'),P=e.querySelector('[data-res="error"]'),j=e.querySelector('[data-res="naive-error"]');m.addEventListener("input",()=>{t=parseInt(m.value,10),a.textContent=String(t)}),s.addEventListener("input",()=>{r=parseInt(s.value,10),p.textContent=String(r)}),i.addEventListener("input",()=>{d=parseInt(i.value,10),u.textContent=`${d}%`});function W(){let h=Math.round(r*(d/100)),F=r-h,M=[];for(let n=0;n<t;n++)M.push(n);let L=t-h,E=[];for(let n=L;n<L+r;n++)E.push(n);let c=t+F,S=y(M,o),H=y(E,o),V=k(S,H),T=g(S,o),z=g(H,o),q=g(V,o),C=T+z,D=Math.abs(q-c)/c,G=Math.abs(C-c)/c;$(w,t,"var(--accent, #0d9488)"),$(b,r,"#8b5cf6"),l.textContent=Math.round(T).toLocaleString(),f.textContent=Math.round(z).toLocaleString(),x.style.display="",I.textContent=c.toLocaleString(),R.textContent=Math.round(q).toLocaleString(),O.textContent=Math.round(C).toLocaleString(),N.textContent=`${h.toLocaleString()} shared`,P.textContent=`${(D*100).toFixed(1)}%`,j.textContent=`${(G*100).toFixed(0)}%`}v.addEventListener("click",W)}export{J as mount};
