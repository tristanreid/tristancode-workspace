import{a as z,b as q,c as L,e as C,j as M}from"./chunk-37DNFNR4.js";import{l as k,m as T,n as E,q as H,s as $}from"./chunk-JSVLZHI4.js";var B=`
.stability-showdown {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.stability-showdown-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

@media (max-width: 640px) {
  .stability-showdown-panels {
    grid-template-columns: 1fr;
  }
}

.stability-showdown-panel {
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 8px;
  padding: 1rem;
  background: var(--bg, #fff);
}

.stability-showdown-panel-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.75rem;
  text-align: center;
}

.stability-showdown-panel-title-left {
  color: var(--accent-secondary, #f97316);
}

.stability-showdown-panel-title-right {
  color: var(--accent, #0d9488);
}

.stability-showdown-chart {
  margin: 0.5rem 0;
  min-height: 160px;
}

.stability-showdown-chart svg {
  width: 100%;
  display: block;
}

.stability-showdown-panel-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem 0.75rem;
  border-top: 1px solid var(--border, #cbd5e1);
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

.stability-showdown-stat {
  display: flex;
  flex-direction: column;
}

.stability-showdown-stat-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stability-showdown-stat-value {
  font-family: var(--font-mono, monospace);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text, #0f172a);
}

.stability-showdown-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  border-top: 1px solid var(--border, #cbd5e1);
  padding-top: 1rem;
}

.stability-showdown-slider-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 140px;
}

.stability-showdown-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  display: flex;
  justify-content: space-between;
}

.stability-showdown-label-value {
  font-family: var(--font-mono, monospace);
  color: var(--accent, #0d9488);
}

.stability-showdown-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--border, #cbd5e1);
  outline: none;
}
.stability-showdown-slider::-webkit-slider-thumb {
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
.stability-showdown-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent, #0d9488);
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.stability-showdown-btn {
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
  white-space: nowrap;
}
.stability-showdown-btn:hover {
  background: var(--accent-hover, #0f766e);
  border-color: var(--accent-hover, #0f766e);
}

.stability-showdown-empty {
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--text-muted, #94a3b8);
  font-style: italic;
  font-size: 0.9rem;
}
`,F=!1;function D(){if(F)return;let t=document.createElement("style");t.textContent=B,document.head.appendChild(t),F=!0}function R(t,a,r,n,v){if(t.innerHTML="",a.length===0)return;let u=t.clientWidth||300,d={top:20,right:12,bottom:34,left:12},f=u-d.left-d.right,i=150,p=C(t).append("svg").attr("width",u).attr("height",i+d.top+d.bottom).append("g").attr("transform",`translate(${d.left},${d.top})`);if(v){let c=new Map;for(let s of a)c.set(s,(c.get(s)||0)+1);let h=a.map(s=>Math.log2(Math.max(s,1))),w=Math.floor(Math.min(...h))-.5,l=Math.ceil(Math.max(...h))+.5,g=Math.log2(r),m=M().domain([w,l]).range([0,f]),y=Math.min(4,Math.max(2,f/(a.length*.8))),x=y*2.2;p.append("line").attr("x1",m(g)).attr("x2",m(g)).attr("y1",-8).attr("y2",i+12).attr("stroke","var(--accent-secondary, #f97316)").attr("stroke-width",1.5).attr("stroke-dasharray","4,2").attr("opacity",.7);for(let[s,b]of c.entries()){let I=m(Math.log2(s));for(let S=0;S<b;S++)p.append("circle").attr("cx",I).attr("cy",i-4-S*x).attr("r",y).attr("fill",n).attr("opacity",.6).attr("stroke","#fff").attr("stroke-width",.3)}let e=[];for(let s=Math.ceil(w);s<=Math.floor(l);s++)e.push(s);let o=L(m).tickValues(e).tickFormat(s=>{let b=Math.pow(2,s);return b>=1e6?`${(b/1e6).toFixed(0)}M`:b>=1e3?`${(b/1e3).toFixed(0)}K`:String(b)});p.append("g").attr("transform",`translate(0,${i+4})`).call(o).call(s=>{s.select(".domain").attr("stroke","var(--border, #cbd5e1)"),s.selectAll(".tick line").attr("stroke","var(--border, #cbd5e1)"),s.selectAll(".tick text").attr("fill","var(--text-muted, #94a3b8)").attr("font-size","9px").attr("font-family","var(--font-mono, monospace)")})}else{let c=[...a].sort((e,o)=>e-o),h=c[0]*.8,w=c[c.length-1]*1.2,l=M().domain([h,w]).range([0,f]),g=z().domain(l.domain()).thresholds(30)(a),m=q(g,e=>e.length)||1,y=M().domain([0,m]).range([i,0]);p.append("line").attr("x1",l(r)).attr("x2",l(r)).attr("y1",-8).attr("y2",i+12).attr("stroke","var(--accent-secondary, #f97316)").attr("stroke-width",1.5).attr("stroke-dasharray","4,2").attr("opacity",.7),p.selectAll("rect").data(g).enter().append("rect").attr("x",e=>l(e.x0)+.5).attr("y",e=>y(e.length)).attr("width",e=>Math.max(0,l(e.x1)-l(e.x0)-1)).attr("height",e=>i-y(e.length)).attr("fill",n).attr("opacity",.7).attr("rx",1);let x=L(l).ticks(5).tickFormat(e=>{let o=e;return o>=1e6?`${(o/1e6).toFixed(1)}M`:o>=1e3?`${(o/1e3).toFixed(0)}K`:String(Math.round(o))});p.append("g").attr("transform",`translate(0,${i+4})`).call(x).call(e=>{e.select(".domain").attr("stroke","var(--border, #cbd5e1)"),e.selectAll(".tick line").attr("stroke","var(--border, #cbd5e1)"),e.selectAll(".tick text").attr("fill","var(--text-muted, #94a3b8)").attr("font-size","9px").attr("font-family","var(--font-mono, monospace)")})}}function A(t,a,r){let n=[...a].sort((c,h)=>c-h),v=E(a),u=H(a),d=$(a,r,.1),f=n[0],i=n[n.length-1],p=(u/r*100).toFixed(1);t.innerHTML=`
    <div class="stability-showdown-stat">
      <span class="stability-showdown-stat-label">Mean</span>
      <span class="stability-showdown-stat-value">${Math.round(v).toLocaleString()}</span>
    </div>
    <div class="stability-showdown-stat">
      <span class="stability-showdown-stat-label">Std error</span>
      <span class="stability-showdown-stat-value">${p}%</span>
    </div>
    <div class="stability-showdown-stat">
      <span class="stability-showdown-stat-label">Within 10%</span>
      <span class="stability-showdown-stat-value">${(d*100).toFixed(0)}%</span>
    </div>
    <div class="stability-showdown-stat">
      <span class="stability-showdown-stat-label">Range</span>
      <span class="stability-showdown-stat-value">${Math.round(f).toLocaleString()} \u2014 ${Math.round(i).toLocaleString()}</span>
    </div>
  `}function W(t){if(!t){console.error("stability-showdown: mount element not found");return}D();let a=1e3,r=4,n=200;t.innerHTML=`
    <div class="stability-showdown">
      <div class="stability-showdown-panels">
        <div class="stability-showdown-panel">
          <div class="stability-showdown-panel-title stability-showdown-panel-title-left">Single-Max Estimator</div>
          <div class="stability-showdown-chart" data-chart="left">
            <div class="stability-showdown-empty">Press Run Comparison</div>
          </div>
          <div class="stability-showdown-panel-stats" data-stats="left"></div>
        </div>
        <div class="stability-showdown-panel">
          <div class="stability-showdown-panel-title stability-showdown-panel-title-right">HyperLogLog (m = <span data-m-display>${1<<r}</span> registers)</div>
          <div class="stability-showdown-chart" data-chart="right">
            <div class="stability-showdown-empty">Press Run Comparison</div>
          </div>
          <div class="stability-showdown-panel-stats" data-stats="right"></div>
        </div>
      </div>
      <div class="stability-showdown-controls">
        <div class="stability-showdown-slider-group">
          <label class="stability-showdown-label">
            Crowd size (N)
            <span class="stability-showdown-label-value" data-display="crowd">${a.toLocaleString()}</span>
          </label>
          <input type="range" class="stability-showdown-slider" data-slider="crowd"
                 min="2" max="5" step="0.1" value="${Math.log10(a).toFixed(1)}">
        </div>
        <div class="stability-showdown-slider-group">
          <label class="stability-showdown-label">
            Registers (m)
            <span class="stability-showdown-label-value" data-display="regs">${1<<r}</span>
          </label>
          <input type="range" class="stability-showdown-slider" data-slider="regs"
                 min="2" max="8" step="1" value="${r}">
        </div>
        <div class="stability-showdown-slider-group">
          <label class="stability-showdown-label">
            Trials
            <span class="stability-showdown-label-value" data-display="trials">${n}</span>
          </label>
          <input type="range" class="stability-showdown-slider" data-slider="trials"
                 min="50" max="500" step="10" value="${n}">
        </div>
        <button class="stability-showdown-btn">Run Comparison</button>
      </div>
    </div>
  `;let v=t.querySelector('[data-slider="crowd"]'),u=t.querySelector('[data-slider="regs"]'),d=t.querySelector('[data-slider="trials"]'),f=t.querySelector('[data-display="crowd"]'),i=t.querySelector('[data-display="regs"]'),p=t.querySelector('[data-display="trials"]'),c=t.querySelector("[data-m-display]"),h=t.querySelector(".stability-showdown-btn"),w=t.querySelector('[data-chart="left"]'),l=t.querySelector('[data-chart="right"]'),g=t.querySelector('[data-stats="left"]'),m=t.querySelector('[data-stats="right"]');v.addEventListener("input",()=>{a=Math.round(Math.pow(10,parseFloat(v.value))),f.textContent=a.toLocaleString()}),u.addEventListener("input",()=>{r=parseInt(u.value,10);let o=1<<r;i.textContent=String(o),c.textContent=String(o)}),d.addEventListener("input",()=>{n=parseInt(d.value,10),p.textContent=String(n)});function y(){let o=Math.floor(Math.random()*1e6),s=k(a,n,o),b=T(a,r,n,o);R(w,s,a,"var(--accent-secondary, #f97316)",!0),R(l,b,a,"var(--accent, #0d9488)",!1),A(g,s,a),A(m,b,a)}h.addEventListener("click",y);let x;new ResizeObserver(()=>{clearTimeout(x),x=setTimeout(()=>{w.querySelector("svg")&&y()},200)}).observe(w)}export{W as mount};
