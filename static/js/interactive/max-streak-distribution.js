import{c as $,e as E,j as H}from"./chunk-MO3EAYAC.js";import{l as w,n as L,p as S,q as T}from"./chunk-JSVLZHI4.js";var B=`
.max-streak-dist {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.max-streak-dist-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
  align-items: flex-end;
}

.max-streak-dist-slider-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 160px;
}

.max-streak-dist-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  display: flex;
  justify-content: space-between;
}

.max-streak-dist-label-value {
  font-family: var(--font-mono, monospace);
  color: var(--accent, #0d9488);
}

.max-streak-dist-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--border, #cbd5e1);
  outline: none;
}
.max-streak-dist-slider::-webkit-slider-thumb {
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
.max-streak-dist-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent, #0d9488);
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.max-streak-dist-btn {
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
.max-streak-dist-btn:hover {
  background: var(--accent-hover, #0f766e);
  border-color: var(--accent-hover, #0f766e);
}

.max-streak-dist-chart {
  margin: 1rem 0;
  position: relative;
}

.max-streak-dist-chart svg {
  width: 100%;
  display: block;
}

.max-streak-dist-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.5rem 1.5rem;
  border-top: 1px solid var(--border, #cbd5e1);
  padding-top: 1rem;
  margin-top: 0.5rem;
}

.max-streak-dist-stat {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.max-streak-dist-stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.max-streak-dist-stat-value {
  font-family: var(--font-mono, monospace);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text, #0f172a);
}

.max-streak-dist-callout {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #475569);
  line-height: 1.5;
  padding: 0.75rem 1rem;
  background: var(--blockquote-bg, rgba(249,115,22,0.04));
  border-left: 3px solid var(--blockquote-border, #f97316);
  border-radius: 0 6px 6px 0;
}

.max-streak-dist-prose {
  margin-top: 1.25rem;
  font-size: inherit;
  line-height: 1.7;
  color: var(--text, #0f172a);
}

.max-streak-dist-prose p {
  margin: 0 0 1em 0;
}

.max-streak-dist-prose p:last-child {
  margin-bottom: 0;
}

.max-streak-dist-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted, #94a3b8);
  font-style: italic;
}
`,z=!1;function D(){if(z)return;let a=document.createElement("style");a.textContent=B,document.head.appendChild(a),z=!0}function O(a,e){let{estimates:s,trueN:i}=e;if(a.innerHTML="",s.length===0){a.innerHTML='<div class="max-streak-dist-empty">Press Run Trials to simulate...</div>';return}let u=a.clientWidth||500,r={top:28,right:20,bottom:44,left:20},x=u-r.left-r.right,c=280-r.top-r.bottom,m=new Map;for(let t of s)m.set(t,(m.get(t)||0)+1);let f=s.map(t=>Math.log2(t)),h=Math.floor(Math.min(...f))-.5,l=Math.ceil(Math.max(...f))+.5,o=Math.log2(i),p=H().domain([h,l]).range([0,x]),C=Math.max(...m.values()),g=Math.min(6,Math.max(2.5,x/(s.length*.6))),b=g*2.2,d=E(a).append("svg").attr("width",u).attr("height",280).append("g").attr("transform",`translate(${r.left},${r.top})`);d.append("line").attr("x1",p(o)).attr("x2",p(o)).attr("y1",-r.top+8).attr("y2",c+20).attr("stroke","var(--accent-secondary, #f97316)").attr("stroke-width",2).attr("stroke-dasharray","6,3").attr("opacity",.8),d.append("text").attr("x",p(o)).attr("y",-r.top+18).attr("text-anchor","middle").attr("fill","var(--accent-secondary, #f97316)").attr("font-size","11px").attr("font-weight","700").attr("font-family","var(--font-mono, monospace)").text(`True N = ${i.toLocaleString()}`);let y=t=>{let n=Math.abs(Math.log2(t)-o);return n<=.5?"var(--accent, #0d9488)":n<=1.5?"#f59e0b":"var(--accent-secondary, #f97316)"},M=Array.from(m.entries()).sort((t,n)=>t[0]-n[0]);for(let[t,n]of M){let R=p(Math.log2(t)),F=y(t);for(let k=0;k<n;k++){let N=c-8-k*b;d.append("circle").attr("cx",R).attr("cy",Math.max(N,0)).attr("r",0).attr("fill",F).attr("opacity",.75).attr("stroke","#fff").attr("stroke-width",.5).transition().duration(300).delay(k*5+Math.abs(Math.log2(t)-o)*30).attr("r",g)}}let v=[];for(let t=Math.ceil(h);t<=Math.floor(l);t++)v.push(t);let q=$(p).tickValues(v).tickFormat(t=>{let n=Math.pow(2,t);return n>=1e6?`${(n/1e6).toFixed(0)}M`:n>=1e3?`${(n/1e3).toFixed(0)}K`:n.toFixed(0)});d.append("g").attr("transform",`translate(0,${c+4})`).call(q).call(t=>{t.select(".domain").attr("stroke","var(--border, #cbd5e1)"),t.selectAll(".tick line").attr("stroke","var(--border, #cbd5e1)"),t.selectAll(".tick text").attr("fill","var(--text-muted, #94a3b8)").attr("font-family","var(--font-mono, monospace)").attr("font-size","10px")}),d.append("text").attr("x",x/2).attr("y",c+40).attr("text-anchor","middle").attr("fill","var(--text-muted, #94a3b8)").attr("font-size","11px").text("Estimate (powers of 2)")}function W(a,e,s){if(e.length===0){a.innerHTML="";return}let i=[...e].sort((l,o)=>l-o),u=L(e),r=S(e),x=T(e),c=i[0],m=i[i.length-1],h=(e.filter(l=>Math.abs(l-s)/s<=.1).length/e.length*100).toFixed(0);a.innerHTML=`
    <div class="max-streak-dist-stat">
      <span class="max-streak-dist-stat-label">True N</span>
      <span class="max-streak-dist-stat-value">${s.toLocaleString()}</span>
    </div>
    <div class="max-streak-dist-stat">
      <span class="max-streak-dist-stat-label">Mean estimate</span>
      <span class="max-streak-dist-stat-value">${Math.round(u).toLocaleString()}</span>
    </div>
    <div class="max-streak-dist-stat">
      <span class="max-streak-dist-stat-label">Median estimate</span>
      <span class="max-streak-dist-stat-value">${Math.round(r).toLocaleString()}</span>
    </div>
    <div class="max-streak-dist-stat">
      <span class="max-streak-dist-stat-label">Std deviation</span>
      <span class="max-streak-dist-stat-value">${Math.round(x).toLocaleString()}</span>
    </div>
    <div class="max-streak-dist-stat">
      <span class="max-streak-dist-stat-label">Range</span>
      <span class="max-streak-dist-stat-value">${c.toLocaleString()} \u2014 ${m.toLocaleString()}</span>
    </div>
    <div class="max-streak-dist-stat">
      <span class="max-streak-dist-stat-label">Within 10% of N</span>
      <span class="max-streak-dist-stat-value">${h}%</span>
    </div>
  `}function A(a){if(!a){console.error("max-streak-distribution: mount element not found");return}D();let e=1e3,s=200,i=Math.floor(Math.random()*1e6);a.innerHTML=`
    <div class="max-streak-dist">
      <div class="max-streak-dist-controls">
        <div class="max-streak-dist-slider-group">
          <label class="max-streak-dist-label">
            Crowd size (N)
            <span class="max-streak-dist-label-value" data-display="crowd">${e.toLocaleString()}</span>
          </label>
          <input type="range" class="max-streak-dist-slider" data-slider="crowd"
                 min="2" max="5" step="0.1" value="3">
        </div>
        <div class="max-streak-dist-slider-group">
          <label class="max-streak-dist-label">
            Trials
            <span class="max-streak-dist-label-value" data-display="trials">${s}</span>
          </label>
          <input type="range" class="max-streak-dist-slider" data-slider="trials"
                 min="50" max="500" step="10" value="${s}">
        </div>
        <button class="max-streak-dist-btn">Run Trials</button>
      </div>
      <div class="max-streak-dist-chart">
        <div class="max-streak-dist-empty">Press Run Trials to simulate...</div>
      </div>
      <div class="max-streak-dist-stats"></div>
      <div class="max-streak-dist-prose" style="display:none"></div>
    </div>
  `;let u=a.querySelector('[data-slider="crowd"]'),r=a.querySelector('[data-slider="trials"]'),x=a.querySelector('[data-display="crowd"]'),c=a.querySelector('[data-display="trials"]'),m=a.querySelector(".max-streak-dist-btn"),f=a.querySelector(".max-streak-dist-chart"),h=a.querySelector(".max-streak-dist-stats"),l=a.querySelector(".max-streak-dist-prose");u.addEventListener("input",()=>{e=Math.round(Math.pow(10,parseFloat(u.value))),x.textContent=e.toLocaleString()}),r.addEventListener("input",()=>{s=parseInt(r.value,10),c.textContent=String(s)});function o(){i=Math.floor(Math.random()*1e6);let g=w(e,s,i);O(f,{estimates:g,trueN:e}),W(h,g,e);let b=[...g].sort((M,v)=>M-v),d=b[0],y=b[b.length-1];l.style.display="",l.innerHTML=`
      <p>The estimates can only land on powers of 2, and they spread across a <em>huge</em> range.
      One hash function gives ${d.toLocaleString()}, another gives ${y.toLocaleString()} \u2014
      both trying to estimate the exact same crowd of ${e.toLocaleString()}.</p>
      <p>Why is it this bad? Because the estimate depends entirely on the single luckiest
      (or unluckiest) person in the crowd. One person gets a lucky long streak and the estimate
      doubles. Nobody gets lucky and the estimate might be half what it should be. The
      coarse-grained, powers-of-2 nature of the estimate makes it even worse \u2014 there's no way
      to land on a value between, say, ${d.toLocaleString()} and ${(d*2).toLocaleString()}.</p>
    `}m.addEventListener("click",o);let p;new ResizeObserver(()=>{clearTimeout(p),p=setTimeout(()=>{f.querySelector("svg")&&o()},200)}).observe(f)}export{A as mount};
