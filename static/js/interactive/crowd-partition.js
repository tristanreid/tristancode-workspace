import{d as y,e as b,i as h}from"./chunk-JSVLZHI4.js";var k=`
.crowd-partition {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.crowd-partition-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
  align-items: center;
}

.crowd-partition-p-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.crowd-partition-p-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary, #475569);
}

.crowd-partition-p-btn {
  font-family: var(--font-mono, monospace);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 0.7rem;
  border-radius: 5px;
  border: 1px solid var(--border, #cbd5e1);
  background: transparent;
  color: var(--text-secondary, #475569);
  cursor: pointer;
  transition: all 0.15s ease;
}
.crowd-partition-p-btn:hover {
  border-color: var(--accent, #0d9488);
  color: var(--accent, #0d9488);
}
.crowd-partition-p-btn-active {
  background: var(--accent, #0d9488);
  border-color: var(--accent, #0d9488);
  color: #fff;
}

.crowd-partition-info {
  font-size: 0.8rem;
  color: var(--text-muted, #94a3b8);
  font-family: var(--font-mono, monospace);
  margin-left: auto;
}

.crowd-partition-registers {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.crowd-partition-register {
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
  background: var(--bg, #fff);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.crowd-partition-reg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.crowd-partition-reg-name {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted, #94a3b8);
}

.crowd-partition-reg-count {
  font-size: 0.7rem;
  color: var(--text-muted, #94a3b8);
  font-family: var(--font-mono, monospace);
}

.crowd-partition-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  min-height: 12px;
}

.crowd-partition-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.crowd-partition-dot-star {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  transform: rotate(45deg);
  box-shadow: 0 0 4px rgba(249,115,22,0.5);
}

.crowd-partition-reg-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.78rem;
  font-family: var(--font-mono, monospace);
}

.crowd-partition-reg-stat-label {
  color: var(--text-muted, #94a3b8);
}

.crowd-partition-reg-stat-value {
  font-weight: 700;
  color: var(--text, #0f172a);
}

.crowd-partition-summary {
  border-top: 1px solid var(--border, #cbd5e1);
  padding-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.5rem 1.5rem;
}

.crowd-partition-summary-stat {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.crowd-partition-summary-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.crowd-partition-summary-value {
  font-family: var(--font-mono, monospace);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text, #0f172a);
}

.crowd-partition-summary-value-accent {
  color: var(--accent, #0d9488);
}
`,L=!1;function $(){if(L)return;let t=document.createElement("style");t.textContent=k,document.head.appendChild(t),L=!0}var E=["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494","#b3b3b3","#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d","#666666"];function M(t){return E[t%E.length]}function H(t,a,o=0){let i=1<<a,s=i-1,c=32-a,d=Array.from({length:i},(n,l)=>({index:l,items:[],streakValues:[],maxStreak:0,recordHolderIdx:-1})),r=0;for(let n=0;n<t;n++){let l=y(String(n),o),f=b(l,32);f>r&&(r=f);let v=l&s,g=l>>>a,m=b(g,c),p=d[v],x=p.items.length;p.items.push(n),p.streakValues.push(m),m>p.maxStreak&&(p.maxStreak=m,p.recordHolderIdx=x)}let u=d.map(n=>n.maxStreak+1),w=h(u,a),e=Math.pow(2,r);return{registers:d,hllEst:w,singleMaxEst:e}}function S(t,a,o){let i=H(a,o),s=1<<o,c=t.querySelector(".crowd-partition-registers"),d=t.querySelector(".crowd-partition-summary"),r=t.querySelector(".crowd-partition-info");r.textContent=`m = ${s} registers`;let u=s<=4?s:(s<=8||s<=16,4);c.style.gridTemplateColumns=`repeat(${u}, 1fr)`,c.innerHTML=i.registers.map(e=>{let n=M(e.index),l=e.items.map((v,g)=>{let m=g===e.recordHolderIdx;return`<span class="${m?"crowd-partition-dot crowd-partition-dot-star":"crowd-partition-dot"}" style="background:${m?"var(--accent-secondary, #f97316)":n}" title="streak=${e.streakValues[g]}"></span>`}).join(""),f=Math.pow(2,e.maxStreak);return`<div class="crowd-partition-register">
        <div class="crowd-partition-reg-header">
          <span class="crowd-partition-reg-name" style="color:${n}">Reg ${e.index}</span>
          <span class="crowd-partition-reg-count">${e.items.length} items</span>
        </div>
        <div class="crowd-partition-dots">${l}</div>
        <div class="crowd-partition-reg-stats">
          <span>
            <span class="crowd-partition-reg-stat-label">max streak: </span>
            <span class="crowd-partition-reg-stat-value">${e.maxStreak}</span>
          </span>
          <span>
            <span class="crowd-partition-reg-stat-label">est: </span>
            <span class="crowd-partition-reg-stat-value">${f.toLocaleString()}</span>
          </span>
        </div>
      </div>`}).join("");let w=(Math.abs(i.hllEst-a)/a*100).toFixed(1);d.innerHTML=`
    <div class="crowd-partition-summary-stat">
      <span class="crowd-partition-summary-label">True crowd size</span>
      <span class="crowd-partition-summary-value">${a.toLocaleString()}</span>
    </div>
    <div class="crowd-partition-summary-stat">
      <span class="crowd-partition-summary-label">Single-max estimate</span>
      <span class="crowd-partition-summary-value">${i.singleMaxEst.toLocaleString()}</span>
    </div>
    <div class="crowd-partition-summary-stat">
      <span class="crowd-partition-summary-label">HLL estimate (harmonic)</span>
      <span class="crowd-partition-summary-value crowd-partition-summary-value-accent">${Math.round(i.hllEst).toLocaleString()}</span>
    </div>
    <div class="crowd-partition-summary-stat">
      <span class="crowd-partition-summary-label">Error</span>
      <span class="crowd-partition-summary-value crowd-partition-summary-value-accent">${w}%</span>
    </div>
  `}function T(t){if(!t){console.error("crowd-partition: mount element not found");return}$();let a=1e3,o=3,s=[2,3,4,5].map(r=>`<button class="crowd-partition-p-btn${r===o?" crowd-partition-p-btn-active":""}"
                 data-p="${r}">p=${r} (m=${1<<r})</button>`).join("");t.innerHTML=`
    <div class="crowd-partition">
      <div class="crowd-partition-controls">
        <div class="crowd-partition-p-group">
          <span class="crowd-partition-p-label">Register bits:</span>
          ${s}
        </div>
        <span class="crowd-partition-info"></span>
      </div>
      <div class="crowd-partition-registers"></div>
      <div class="crowd-partition-summary"></div>
    </div>
  `;let c=t.querySelectorAll(".crowd-partition-p-btn");function d(){for(let r of c){let u=parseInt(r.dataset.p,10);r.classList.toggle("crowd-partition-p-btn-active",u===o)}}for(let r of c)r.addEventListener("click",()=>{o=parseInt(r.dataset.p,10),d(),S(t,a,o)});S(t,a,o)}export{T as mount};
