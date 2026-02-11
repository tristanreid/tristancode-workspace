import{b as q,c as R,d as $,e as L,f as z,i as A,j as B,k as T}from"./chunk-37DNFNR4.js";import{a as C,c as E,f as H}from"./chunk-JSVLZHI4.js";var P=`
.coin-crowd {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.coin-crowd-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: flex-end;
  margin-bottom: 1.25rem;
}

.coin-crowd-slider-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 150px;
}

.coin-crowd-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  display: flex;
  justify-content: space-between;
}

.coin-crowd-label-value {
  font-family: var(--font-mono, monospace);
  color: var(--accent, #0d9488);
}

.coin-crowd-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--border, #cbd5e1);
  outline: none;
}
.coin-crowd-slider::-webkit-slider-thumb {
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
.coin-crowd-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent, #0d9488);
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.coin-crowd-btn-group {
  display: flex;
  gap: 0.5rem;
}

.coin-crowd-btn {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.coin-crowd-btn-primary {
  border: 1px solid var(--accent, #0d9488);
  background: var(--accent, #0d9488);
  color: #fff;
}
.coin-crowd-btn-primary:hover {
  background: var(--accent-hover, #0f766e);
  border-color: var(--accent-hover, #0f766e);
}

.coin-crowd-btn-secondary {
  border: 1px solid var(--border, #cbd5e1);
  background: transparent;
  color: var(--text-secondary, #475569);
}
.coin-crowd-btn-secondary:hover {
  background: var(--accent-glow, rgba(13,148,136,0.1));
  color: var(--text, #0f172a);
}

.coin-crowd-viz {
  margin: 1rem 0;
}

.coin-crowd-viz svg {
  width: 100%;
  display: block;
}

.coin-crowd-results {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 2rem;
  padding: 1rem 0;
  border-top: 1px solid var(--border, #cbd5e1);
  border-bottom: 1px solid var(--border, #cbd5e1);
  margin-bottom: 1rem;
}

.coin-crowd-result {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.coin-crowd-result-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.coin-crowd-result-value {
  font-family: var(--font-mono, monospace);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text, #0f172a);
}

.coin-crowd-result-highlight {
  color: var(--accent-secondary, #f97316);
}

.coin-crowd-histogram {
  margin-top: 0.5rem;
}

.coin-crowd-histogram svg {
  width: 100%;
  display: block;
}

.coin-crowd-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted, #94a3b8);
  font-style: italic;
  font-size: 0.9rem;
}

.coin-crowd-hint {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #475569);
  line-height: 1.5;
  padding: 0.75rem 1rem;
  background: var(--blockquote-bg, rgba(249,115,22,0.04));
  border-left: 3px solid var(--blockquote-border, #f97316);
  border-radius: 0 6px 6px 0;
  transition: opacity 0.3s ease;
}

@keyframes crowdDotAppear {
  from { r: 0; opacity: 0; }
  to   { opacity: 1; }
}
`,F=!1;function W(){if(F)return;let e=document.createElement("style");e.textContent=P,document.head.appendChild(e),F=!0}function I(e,o){let u=C(o),a=E(e,u),c=0,n=0;for(let r=0;r<a.length;r++)a[r]>c&&(c=a[r],n=r);let f=H(a);return{streaks:a,maxStreak:c,maxIdx:n,estimate:f}}function _(e,o){e.innerHTML="";let{streaks:u,maxStreak:a,maxIdx:c}=o,n=u.length,f=e.clientWidth||500,r=500,d=n<=r,g=d?n:r,l=[];if(d)for(let t=0;t<n;t++)l.push(t);else{let t=n/r,m=new Set;m.add(c);for(let h=0;h<r-1;h++)m.add(Math.floor(h*t));l.push(...Array.from(m).sort((h,k)=>h-k))}let p=Math.ceil(Math.sqrt(g*1.5)),b=Math.min(6,Math.max(2,(f-40)/(p*2.8))),i=b*2.5,s=Math.ceil(g/p)*i+20,w=T(z("#b2dfdb","#00695c")).domain([0,Math.max(a,3)]),x=L(e).append("svg").attr("width",f).attr("height",s).append("g").attr("transform",`translate(${i}, ${i/2})`);l.forEach((t,m)=>{let h=m%p,k=Math.floor(m/p),S=h*i,M=k*i,D=u[t];t===c?(x.append("circle").attr("cx",S).attr("cy",M).attr("r",0).attr("fill","var(--accent-secondary, #f97316)").attr("stroke","#fff").attr("stroke-width",1.5).transition().duration(400).delay(300+m*.5).attr("r",b*1.8),x.append("text").attr("x",S).attr("y",M).attr("text-anchor","middle").attr("dominant-baseline","central").attr("font-size",`${b*1.6}px`).attr("fill","#fff").attr("opacity",0).text("\u2605").transition().duration(300).delay(500+m*.5).attr("opacity",1)):x.append("circle").attr("cx",S).attr("cy",M).attr("r",0).attr("fill",w(D)).attr("opacity",.75).attr("stroke","#fff").attr("stroke-width",.3).transition().duration(300).delay(m*.5).attr("r",b)})}function j(e,o){e.innerHTML="";let{streaks:u,maxStreak:a}=o,c=e.clientWidth||500,n={top:14,right:16,bottom:36,left:40},f=c-n.left-n.right,r=130,d=new Map;for(let t of u)d.set(t,(d.get(t)||0)+1);let g=a,l=[];for(let t=0;t<=g;t++)l.push({streak:t,count:d.get(t)||0});let p=A().domain(l.map(t=>t.streak)).range([0,f]).padding(.15),b=q(l,t=>t.count)||1,i=B().domain([0,b]).nice().range([r,0]),y=T(z("#b2dfdb","#00695c")).domain([0,Math.max(a,3)]),w=L(e).append("svg").attr("width",c).attr("height",r+n.top+n.bottom).append("g").attr("transform",`translate(${n.left},${n.top})`);w.selectAll("rect").data(l).enter().append("rect").attr("x",t=>p(t.streak)).attr("y",r).attr("width",p.bandwidth()).attr("height",0).attr("fill",t=>t.streak===a?"var(--accent-secondary, #f97316)":y(t.streak)).attr("opacity",t=>t.streak===a?1:.75).attr("rx",2).transition().duration(400).delay((t,m)=>m*30).attr("y",t=>i(t.count)).attr("height",t=>r-i(t.count));let v=R(p).tickFormat(t=>String(t));w.append("g").attr("transform",`translate(0,${r})`).call(v).call(t=>{t.select(".domain").attr("stroke","var(--border, #cbd5e1)"),t.selectAll(".tick line").attr("stroke","var(--border, #cbd5e1)"),t.selectAll(".tick text").attr("fill","var(--text-muted, #94a3b8)").attr("font-family","var(--font-mono, monospace)").attr("font-size","10px")}),w.append("text").attr("x",f/2).attr("y",r+32).attr("text-anchor","middle").attr("fill","var(--text-muted, #94a3b8)").attr("font-size","11px").text("Streak length (tails before heads)");let x=$(i).ticks(4).tickFormat(t=>String(t));w.append("g").call(x).call(t=>{t.select(".domain").attr("stroke","var(--border, #cbd5e1)"),t.selectAll(".tick line").attr("stroke","var(--border, #cbd5e1)"),t.selectAll(".tick text").attr("fill","var(--text-muted, #94a3b8)").attr("font-family","var(--font-mono, monospace)").attr("font-size","10px")})}function O(e){if(!e){console.error("coin-flip-crowd: mount element not found");return}W();let o=200,u=0,a=Math.floor(Math.random()*1e6);e.innerHTML=`
    <div class="coin-crowd">
      <div class="coin-crowd-controls">
        <div class="coin-crowd-slider-group">
          <label class="coin-crowd-label">
            Crowd size
            <span class="coin-crowd-label-value" data-display="crowd">${o.toLocaleString()}</span>
          </label>
          <input type="range" class="coin-crowd-slider" data-slider="crowd"
                 min="1.7" max="4" step="0.05" value="${Math.log10(o).toFixed(2)}">
        </div>
        <div class="coin-crowd-btn-group">
          <button class="coin-crowd-btn coin-crowd-btn-primary" data-btn="play">Play</button>
          <button class="coin-crowd-btn coin-crowd-btn-secondary" data-btn="rerun">Re-run</button>
        </div>
      </div>
      <div class="coin-crowd-viz">
        <div class="coin-crowd-empty">Press Play to let the crowd flip coins...</div>
      </div>
      <div class="coin-crowd-results" style="display:none" data-results></div>
      <div class="coin-crowd-histogram" data-histogram></div>
      <div class="coin-crowd-hint" style="display:none" data-hint></div>
    </div>
  `;let c=e.querySelector('[data-slider="crowd"]'),n=e.querySelector('[data-display="crowd"]'),f=e.querySelector('[data-btn="play"]'),r=e.querySelector('[data-btn="rerun"]'),d=e.querySelector(".coin-crowd-viz"),g=e.querySelector("[data-results]"),l=e.querySelector("[data-histogram]"),p=e.querySelector("[data-hint]");c.addEventListener("input",()=>{o=Math.round(Math.pow(10,parseFloat(c.value))),n.textContent=o.toLocaleString()});function b(){a=Math.floor(Math.random()*1e6),u++;let s=I(o,a);_(d,s),g.style.display="";let w=(s.estimate/o*100).toFixed(0),v=s.estimate>o?"over":s.estimate<o?"under":"exact";g.innerHTML=`
      <div class="coin-crowd-result">
        <span class="coin-crowd-result-label">Crowd size</span>
        <span class="coin-crowd-result-value">${o.toLocaleString()}</span>
      </div>
      <div class="coin-crowd-result">
        <span class="coin-crowd-result-label">Record streak</span>
        <span class="coin-crowd-result-value coin-crowd-result-highlight">${s.maxStreak} tails</span>
      </div>
      <div class="coin-crowd-result">
        <span class="coin-crowd-result-label">Estimate</span>
        <span class="coin-crowd-result-value coin-crowd-result-highlight">2<sup>${s.maxStreak}</sup> = ${s.estimate.toLocaleString()}</span>
      </div>
      <div class="coin-crowd-result">
        <span class="coin-crowd-result-label">Accuracy</span>
        <span class="coin-crowd-result-value">${w}% ${v==="over"?"(over)":v==="under"?"(under)":"(exact!)"}</span>
      </div>
    `,j(l,s),u>=3&&(p.style.display="",p.textContent="Notice how the estimate changes each time? The longest streak depends on luck \u2014 one person gets a lucky long run and the estimate jumps. That's the instability problem we'll solve in Part 3.")}f.addEventListener("click",b),r.addEventListener("click",b);let i;new ResizeObserver(()=>{clearTimeout(i),i=setTimeout(()=>{if(d.querySelector("svg")){let s=I(o,a);_(d,s),j(l,s)}},200)}).observe(d)}export{O as mount};
