import{h as M,n as A,o as S}from"./chunk-JSVLZHI4.js";var k=`
.mean-comparison {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.mean-comparison-controls {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.mean-comparison-btn {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  border: 1px solid var(--accent, #0d9488);
  background: var(--accent, #0d9488);
  color: #fff;
  cursor: pointer;
  transition: all 0.15s ease;
}
.mean-comparison-btn:hover {
  background: var(--accent-hover, #0f766e);
  border-color: var(--accent-hover, #0f766e);
}

.mean-comparison-info {
  font-size: 0.8rem;
  color: var(--text-muted, #94a3b8);
  font-family: var(--font-mono, monospace);
}

.mean-comparison-chart {
  margin: 0.75rem 0;
  position: relative;
}

.mean-comparison-chart svg {
  width: 100%;
  display: block;
}

.mean-comparison-estimates {
  font-size: 0.8rem;
  font-family: var(--font-mono, monospace);
  color: var(--text-secondary, #475569);
  margin-bottom: 0.75rem;
  line-height: 1.6;
  word-break: break-all;
}

.mean-comparison-estimates-label {
  font-weight: 700;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.7rem;
}

.mean-comparison-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.5rem 1.5rem;
  border-top: 1px solid var(--border, #cbd5e1);
  padding-top: 1rem;
}

.mean-comparison-stat {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.mean-comparison-stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mean-comparison-stat-value {
  font-family: var(--font-mono, monospace);
  font-size: 1rem;
  font-weight: 700;
}

.mean-comparison-callout {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #475569);
  line-height: 1.5;
  padding: 0.75rem 1rem;
  background: var(--blockquote-bg, rgba(249,115,22,0.04));
  border-left: 3px solid var(--blockquote-border, #f97316);
  border-radius: 0 6px 6px 0;
}
`,E=!1;function T(){if(E)return;let e=document.createElement("style");e.textContent=k,document.head.appendChild(e),E=!0}function z(e,s,a){let i=Array.from({length:e},(r,x)=>x),n=M(i,s,a).map(r=>r>0?Math.pow(2,r-1):0).filter(r=>r>0),t=A(n),u=S(n);return{estimates:n,arithMean:t,harmMean:u,trueN:e}}function C(e,s){e.innerHTML="";let{estimates:a,arithMean:i,harmMean:g,trueN:f}=s,n=e.clientWidth||500,t={top:36,right:20,bottom:32,left:20},u=n-t.left-t.right,r=80,x=[...a,i,g,f/a.length],m=Math.floor(Math.log2(Math.max(1,Math.min(...x))))-.5,y=Math.ceil(Math.log2(Math.max(...x)))+.5,c=document.createElementNS("http://www.w3.org/2000/svg","svg");c.setAttribute("width",String(n)),c.setAttribute("height",String(r+t.top+t.bottom));let l=document.createElementNS("http://www.w3.org/2000/svg","g");l.setAttribute("transform",`translate(${t.left},${t.top})`),c.appendChild(l);function v(b){return(Math.log2(Math.max(b,1))-m)/(y-m)*u}let p=document.createElementNS("http://www.w3.org/2000/svg","line");p.setAttribute("x1","0"),p.setAttribute("x2",String(u)),p.setAttribute("y1",String(r/2)),p.setAttribute("y2",String(r/2)),p.setAttribute("stroke","var(--border, #cbd5e1)"),p.setAttribute("stroke-width","1"),l.appendChild(p);for(let b=Math.ceil(m);b<=Math.floor(y);b++){let w=v(Math.pow(2,b)),h=document.createElementNS("http://www.w3.org/2000/svg","line");h.setAttribute("x1",String(w)),h.setAttribute("x2",String(w)),h.setAttribute("y1",String(r/2-4)),h.setAttribute("y2",String(r/2+4)),h.setAttribute("stroke","var(--border, #cbd5e1)"),l.appendChild(h);let d=document.createElementNS("http://www.w3.org/2000/svg","text");d.setAttribute("x",String(w)),d.setAttribute("y",String(r/2+18)),d.setAttribute("text-anchor","middle"),d.setAttribute("fill","var(--text-muted, #94a3b8)"),d.setAttribute("font-size","10"),d.setAttribute("font-family","var(--font-mono, monospace)");let o=Math.pow(2,b);d.textContent=o>=1e3?`${(o/1e3).toFixed(0)}K`:String(o),l.appendChild(d)}a.forEach((b,w)=>{let h=v(b),d=r/2-10-w%3*8,o=document.createElementNS("http://www.w3.org/2000/svg","circle");o.setAttribute("cx",String(h)),o.setAttribute("cy",String(d)),o.setAttribute("r","5"),o.setAttribute("fill","var(--accent, #0d9488)"),o.setAttribute("opacity","0.5"),o.setAttribute("stroke","#fff"),o.setAttribute("stroke-width","0.5"),l.appendChild(o)}),L(l,v(i),r/2,"#ef4444","Arith. mean",-28),L(l,v(g),r/2,"var(--accent, #0d9488)","Harm. mean",-16),e.appendChild(c)}function L(e,s,a,i,g,f){let n=document.createElementNS("http://www.w3.org/2000/svg","line");n.setAttribute("x1",String(s)),n.setAttribute("x2",String(s)),n.setAttribute("y1",String(a-35)),n.setAttribute("y2",String(a+4)),n.setAttribute("stroke",i),n.setAttribute("stroke-width","2"),n.setAttribute("stroke-dasharray","4,2"),e.appendChild(n);let t=document.createElementNS("http://www.w3.org/2000/svg","text");t.setAttribute("x",String(s)),t.setAttribute("y",String(a+f)),t.setAttribute("text-anchor","middle"),t.setAttribute("fill",i),t.setAttribute("font-size","10"),t.setAttribute("font-weight","700"),t.setAttribute("font-family","var(--font-mono, monospace)"),t.textContent=g,e.appendChild(t)}function H(e){if(!e){console.error("mean-comparison: mount element not found");return}T();let s=1e3,a=3,i=Math.floor(Math.random()*1e6);e.innerHTML=`
    <div class="mean-comparison">
      <div class="mean-comparison-controls">
        <button class="mean-comparison-btn">Re-generate</button>
        <span class="mean-comparison-info">${s.toLocaleString()} items \u2192 ${1<<a} sub-crowds</span>
      </div>
      <div class="mean-comparison-estimates"></div>
      <div class="mean-comparison-chart"></div>
      <div class="mean-comparison-stats"></div>
      <div class="mean-comparison-callout">
        The <strong style="color:#ef4444">arithmetic mean</strong> gets pulled toward outliers.
        The <strong style="color:var(--accent, #0d9488)">harmonic mean</strong> naturally down-weights
        them, staying close to the truth. This is why HyperLogLog uses the harmonic mean.
      </div>
    </div>
  `;let g=e.querySelector(".mean-comparison-btn"),f=e.querySelector(".mean-comparison-estimates"),n=e.querySelector(".mean-comparison-chart"),t=e.querySelector(".mean-comparison-stats");function u(){i=Math.floor(Math.random()*1e6);let m=z(s,a,i),y=1<<a,c=s/y;f.innerHTML=`
      <span class="mean-comparison-estimates-label">Sub-crowd estimates:</span>
      [${m.estimates.map(p=>p.toLocaleString()).join(", ")}]
    `,C(n,m);let l=(Math.abs(m.arithMean-c)/c*100).toFixed(0),v=(Math.abs(m.harmMean-c)/c*100).toFixed(0);t.innerHTML=`
      <div class="mean-comparison-stat">
        <span class="mean-comparison-stat-label">Arithmetic mean</span>
        <span class="mean-comparison-stat-value" style="color:#ef4444">${Math.round(m.arithMean).toLocaleString()} <span style="font-size:0.75rem;font-weight:400">(${l}% off)</span></span>
      </div>
      <div class="mean-comparison-stat">
        <span class="mean-comparison-stat-label">Harmonic mean</span>
        <span class="mean-comparison-stat-value" style="color:var(--accent, #0d9488)">${Math.round(m.harmMean).toLocaleString()} <span style="font-size:0.75rem;font-weight:400">(${v}% off)</span></span>
      </div>
      <div class="mean-comparison-stat">
        <span class="mean-comparison-stat-label">True (per sub-crowd)</span>
        <span class="mean-comparison-stat-value">~${Math.round(c).toLocaleString()}</span>
      </div>
    `}g.addEventListener("click",u);let r;new ResizeObserver(()=>{clearTimeout(r),r=setTimeout(()=>{n.querySelector("svg")&&u()},200)}).observe(n),u()}export{H as mount};
