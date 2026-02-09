import{a as y}from"./chunk-JSVLZHI4.js";var v=`
.coin-binary {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
  max-width: 480px;
}

.coin-binary-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.coin-binary-btn {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  border: 1px solid var(--border, #cbd5e1);
  cursor: pointer;
  transition: all 0.15s ease;
}

.coin-binary-btn-primary {
  background: var(--accent, #0d9488);
  color: #fff;
  border-color: var(--accent, #0d9488);
}
.coin-binary-btn-primary:hover:not(:disabled) {
  background: var(--accent-hover, #0f766e);
  border-color: var(--accent-hover, #0f766e);
}
.coin-binary-btn-primary:disabled {
  opacity: 0.5;
  cursor: default;
}

.coin-binary-btn-secondary {
  background: transparent;
  color: var(--text-secondary, #475569);
}
.coin-binary-btn-secondary:hover {
  background: var(--accent-glow, rgba(13,148,136,0.1));
  color: var(--text, #0f172a);
}

.coin-binary-flips {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1.25rem;
  min-height: 2rem;
}

.coin-binary-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  animation: coinRowAppear 0.3s ease-out;
}

@keyframes coinRowAppear {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.coin-binary-flip-num {
  font-family: var(--font-mono, monospace);
  font-size: 0.8rem;
  color: var(--text-muted, #94a3b8);
  width: 1.5rem;
  text-align: right;
}

.coin-binary-coin {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.03em;
  transition: transform 0.3s ease;
}

.coin-binary-coin-tails {
  background: var(--accent-glow, rgba(13,148,136,0.1));
  color: var(--accent, #0d9488);
  border: 2px solid var(--accent, #0d9488);
}

.coin-binary-coin-heads {
  background: var(--accent-secondary, #f97316);
  color: #fff;
  border: 2px solid var(--accent-secondary, #f97316);
}

@keyframes coinSpin {
  0%   { transform: rotateY(0deg) scale(1); }
  50%  { transform: rotateY(90deg) scale(0.9); }
  100% { transform: rotateY(0deg) scale(1); }
}
.coin-binary-coin-spinning {
  animation: coinSpin 0.3s ease-in-out;
}

.coin-binary-arrow {
  color: var(--text-muted, #94a3b8);
  font-size: 0.85rem;
}

.coin-binary-bit {
  font-family: var(--font-mono, monospace);
  font-size: 1.1rem;
  font-weight: 600;
  width: 1.5rem;
  text-align: center;
}

.coin-binary-bit-zero {
  color: var(--accent, #0d9488);
}

.coin-binary-bit-one {
  color: var(--accent-secondary, #f97316);
}

.coin-binary-label {
  font-size: 0.8rem;
  color: var(--text-muted, #94a3b8);
  margin-left: auto;
}

.coin-binary-summary {
  border-top: 1px solid var(--border, #cbd5e1);
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.coin-binary-summary-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.coin-binary-summary-label {
  color: var(--text-secondary, #475569);
  min-width: 8rem;
}

.coin-binary-summary-value {
  font-family: var(--font-mono, monospace);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.coin-binary-summary-value-bit {
  letter-spacing: 0.15em;
}

.coin-binary-empty {
  color: var(--text-muted, #94a3b8);
  font-style: italic;
  font-size: 0.9rem;
  padding: 0.75rem 0;
}
`,d=!1;function g(){if(d)return;let n=document.createElement("style");n.textContent=v,document.head.appendChild(n),d=!0}function p(){return{flips:[],done:!1,rng:y(Math.floor(Math.random()*1e6))}}function x(n){if(n.done)return;let a=n.rng()<.5;n.flips.push({isTails:a}),a||(n.done=!0)}function h(n){let i=0;for(let a of n.flips)if(a.isTails)i++;else break;return i}function T(n){return n.flips.map(i=>i.isTails?"0":"1").join("")}function c(n,i){let a=n.querySelector(".coin-binary-flips"),o=n.querySelector(".coin-binary-summary"),l=n.querySelector(".coin-binary-btn-primary");if(l.disabled=i.done,l.textContent=i.done?"Done!":"Flip!",i.flips.length===0?a.innerHTML='<div class="coin-binary-empty">Press Flip! to start flipping coins...</div>':a.innerHTML=i.flips.map((r,e)=>{let s=r.isTails?"coin-binary-coin-tails":"coin-binary-coin-heads",t=r.isTails?"T":"H",m=r.isTails?"0":"1",b=r.isTails?"coin-binary-bit-zero":"coin-binary-bit-one",f=e===i.flips.length-1?" coin-binary-coin-spinning":"",u=r.isTails?"tail":"heads!";return`<div class="coin-binary-row">
          <span class="coin-binary-flip-num">${e+1}</span>
          <span class="coin-binary-coin ${s}${f}">${t}</span>
          <span class="coin-binary-arrow">\u2192</span>
          <span class="coin-binary-bit ${b}">${m}</span>
          <span class="coin-binary-label">${u}</span>
        </div>`}).join(""),i.flips.length===0)o.style.display="none";else{o.style.display="";let r=h(i),e=T(i),s=i.done?`<div class="coin-binary-summary-row">
           <span class="coin-binary-summary-label">Estimate contribution</span>
           <span class="coin-binary-summary-value">2<sup>${r}</sup> = ${Math.pow(2,r).toLocaleString()}</span>
         </div>`:"";o.innerHTML=`
      <div class="coin-binary-summary-row">
        <span class="coin-binary-summary-label">Binary string</span>
        <span class="coin-binary-summary-value coin-binary-summary-value-bit">${e.split("").map((t,m)=>`<span class="${t==="0"?"coin-binary-bit-zero":"coin-binary-bit-one"}">${t}</span>`).join("")}${i.done?"":'<span style="opacity:0.3">\u2026</span>'}</span>
      </div>
      <div class="coin-binary-summary-row">
        <span class="coin-binary-summary-label">Leading zeros</span>
        <span class="coin-binary-summary-value">${r}${i.done?"":" (so far)"}</span>
      </div>
      ${s}
    `}}function w(n){if(!n){console.error("coin-binary: mount element not found");return}g();let i=p();n.innerHTML=`
    <div class="coin-binary">
      <div class="coin-binary-controls">
        <button class="coin-binary-btn coin-binary-btn-primary">Flip!</button>
        <button class="coin-binary-btn coin-binary-btn-secondary">Reset</button>
      </div>
      <div class="coin-binary-flips"></div>
      <div class="coin-binary-summary" style="display:none"></div>
    </div>
  `;let a=n.querySelector(".coin-binary-btn-primary"),o=n.querySelector(".coin-binary-btn-secondary");a.addEventListener("click",()=>{x(i),c(n,i)}),o.addEventListener("click",()=>{i=p(),c(n,i)}),c(n,i)}export{w as mount};
