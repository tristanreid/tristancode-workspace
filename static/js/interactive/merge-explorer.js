var z=`
.merge-explorer {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.merge-explorer-header {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.merge-explorer-select {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.45rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border, #cbd5e1);
  background: var(--bg, #fff);
  color: var(--text, #0f172a);
  cursor: pointer;
}

.merge-explorer-btn {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.45rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  border: 1px solid var(--accent, #0d9488);
  background: var(--accent, #0d9488);
  color: #fff;
}
.merge-explorer-btn:hover {
  background: var(--accent-hover, #0f766e);
  border-color: var(--accent-hover, #0f766e);
}

.merge-explorer-btn-secondary {
  background: transparent;
  color: var(--accent, #0d9488);
}
.merge-explorer-btn-secondary:hover {
  background: var(--accent, #0d9488);
  color: #fff;
}

.merge-explorer-machines {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

@media (max-width: 580px) {
  .merge-explorer-machines {
    grid-template-columns: 1fr;
  }
}

.merge-explorer-machine {
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 8px;
  padding: 0.75rem;
  background: var(--bg, #fff);
  text-align: center;
}

.merge-explorer-machine-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem;
}

.merge-explorer-machine-title-0 { color: var(--accent, #0d9488); }
.merge-explorer-machine-title-1 { color: #8b5cf6; }
.merge-explorer-machine-title-2 { color: #e87b35; }

.merge-explorer-machine-data {
  font-family: var(--font-mono, monospace);
  font-size: 0.8rem;
  color: var(--text-secondary, #475569);
  margin-bottom: 0.5rem;
  line-height: 1.5;
  word-break: break-all;
}

.merge-explorer-machine-result {
  font-family: var(--font-mono, monospace);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text, #0f172a);
}

.merge-explorer-machine-result-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.merge-explorer-verdict {
  border: 2px solid var(--border, #cbd5e1);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  background: var(--bg, #fff);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.5rem 1.5rem;
  margin-bottom: 0.75rem;
}

.merge-explorer-verdict-match {
  border-color: var(--accent, #0d9488);
}

.merge-explorer-verdict-mismatch {
  border-color: #ef4444;
}

.merge-explorer-verdict-item {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.merge-explorer-verdict-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.merge-explorer-verdict-value {
  font-family: var(--font-mono, monospace);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text, #0f172a);
}

.merge-explorer-verdict-correct {
  color: var(--accent, #0d9488);
}

.merge-explorer-verdict-wrong {
  color: #ef4444;
}

.merge-explorer-verdict-icon {
  font-size: 1.3rem;
}

.merge-explorer-explanation {
  font-size: 0.85rem;
  color: var(--text-secondary, #475569);
  line-height: 1.5;
  padding: 0.75rem 1rem;
  background: var(--blockquote-bg, rgba(249,115,22,0.04));
  border-left: 3px solid var(--blockquote-border, #f97316);
  border-radius: 0 6px 6px 0;
}

.merge-explorer-explanation-match {
  border-left-color: var(--accent, #0d9488);
  background: rgba(13,148,136,0.04);
}
`,f=!1;function S(){if(f)return;let i=document.createElement("style");i.textContent=z,document.head.appendChild(i),f=!0}function g(i){let t=[...i].sort((e,r)=>e-r),l=Math.floor(t.length/2);return t.length%2===0?(t[l-1]+t[l])/2:t[l]}function k(i,t){let l=t.flat();switch(i){case"sum":{let e=t.map(n=>n.reduce((a,s)=>a+s,0)),r=e.reduce((n,a)=>n+a,0),o=l.reduce((n,a)=>n+a,0);return{partials:e.map(String),combined:r,centralized:o,match:r===o,explanation:"Sum of sums = sum of all. It doesn't matter how you split the data."}}case"max":{let e=t.map(n=>Math.max(...n)),r=Math.max(...e),o=Math.max(...l);return{partials:e.map(String),combined:r,centralized:o,match:r===o,explanation:"Max of maxes = max of all. The global maximum can't hide inside a partition."}}case"min":{let e=t.map(n=>Math.min(...n)),r=Math.min(...e),o=Math.min(...l);return{partials:e.map(String),combined:r,centralized:o,match:r===o,explanation:"Min of mins = min of all. Same reasoning as max \u2014 the global minimum surfaces."}}case"count":{let e=t.map(n=>n.length),r=e.reduce((n,a)=>n+a,0),o=l.length;return{partials:e.map(String),combined:r,centralized:o,match:r===o,explanation:"Count is just a sum of 1s. Every partition knows how many items it has."}}case"mean":{let e=t.map(a=>a.reduce((s,m)=>s+m,0)/a.length),r=e.reduce((a,s)=>a+s,0)/e.length,o=l.reduce((a,s)=>a+s,0)/l.length,n=Math.abs(r-o)<.001;return{partials:e.map(a=>a.toFixed(2)),combined:Math.round(r*100)/100,centralized:Math.round(o*100)/100,match:n,explanation:n?"The partitions happen to be equal-sized, so the mean of means matches. Try reshuffling for unequal splits!":"Mean of means \u2260 mean of all! The small partition's mean gets equal weight with the large one, skewing the result. To fix this, carry (sum, count) pairs instead."}}case"median":{let e=t.map(a=>g(a)),r=g(e),o=g(l),n=r===o;return{partials:e.map(a=>Number.isInteger(a)?String(a):a.toFixed(1)),combined:Math.round(r*100)/100,centralized:Math.round(o*100)/100,match:n,explanation:n?"Got lucky \u2014 the median of medians happened to match this time. Reshuffle to see it fail!":"Median of medians \u2260 global median. There's no trick that fixes this. Exact median requires seeing all the data in one place \u2014 a global shuffle."}}}}function h(){let t=[...[7,3,9,2,14,1,5,8,6,11,4,100]];for(let e=t.length-1;e>0;e--){let r=Math.floor(Math.random()*(e+1));[t[e],t[r]]=[t[r],t[e]]}let l=[t.slice(0,5),t.slice(5,8),t.slice(8,12)];return{all:t,partitions:l}}function E(i){if(!i){console.error("merge-explorer: mount element not found");return}S();let t=["var(--accent, #0d9488)","#8b5cf6","#e87b35"],l=["Machine A","Machine B","Machine C"],e="sum",r=h();i.innerHTML=`
    <div class="merge-explorer">
      <div class="merge-explorer-header">
        <select class="merge-explorer-select" data-op>
          <option value="sum" selected>Sum</option>
          <option value="max">Max</option>
          <option value="min">Min</option>
          <option value="count">Count</option>
          <option value="mean">Mean (naive)</option>
          <option value="median">Median</option>
        </select>
        <button class="merge-explorer-btn" data-run>Split & Merge</button>
        <button class="merge-explorer-btn merge-explorer-btn-secondary" data-reshuffle>Reshuffle Data</button>
      </div>
      <div class="merge-explorer-machines" data-machines></div>
      <div class="merge-explorer-verdict" data-verdict></div>
      <div class="merge-explorer-explanation" data-explanation></div>
    </div>
  `;let o=i.querySelector("[data-op]"),n=i.querySelector("[data-run]"),a=i.querySelector("[data-reshuffle]"),s=i.querySelector("[data-machines]"),m=i.querySelector("[data-verdict]"),u=i.querySelector("[data-explanation]");function d(){let c=k(e,r.partitions);s.innerHTML=r.partitions.map((x,p)=>`
      <div class="merge-explorer-machine">
        <div class="merge-explorer-machine-title merge-explorer-machine-title-${p}">
          ${l[p]} (${x.length} items)
        </div>
        <div class="merge-explorer-machine-data">
          [${x.join(", ")}]
        </div>
        <div class="merge-explorer-machine-result-label">
          Partial ${e}
        </div>
        <div class="merge-explorer-machine-result">
          ${c.partials[p]}
        </div>
      </div>
    `).join("");let v=c.match?"merge-explorer-verdict-match":"merge-explorer-verdict-mismatch",b=c.match?"merge-explorer-verdict-correct":"merge-explorer-verdict-wrong",M=c.match?"\u2714":"\u2718",y=c.match?"merge-explorer-verdict-correct":"merge-explorer-verdict-wrong";m.className=`merge-explorer-verdict ${v}`,m.innerHTML=`
      <div class="merge-explorer-verdict-item">
        <span class="merge-explorer-verdict-label">Combined (distributed)</span>
        <span class="merge-explorer-verdict-value ${b}">
          ${c.combined}
        </span>
      </div>
      <div class="merge-explorer-verdict-item">
        <span class="merge-explorer-verdict-label">Centralized (correct)</span>
        <span class="merge-explorer-verdict-value merge-explorer-verdict-correct">
          ${c.centralized}
        </span>
      </div>
      <div class="merge-explorer-verdict-item">
        <span class="merge-explorer-verdict-label">Verdict</span>
        <span class="merge-explorer-verdict-value merge-explorer-verdict-icon ${y}">
          ${M} ${c.match?"Match":"Mismatch"}
        </span>
      </div>
    `;let w=c.match?"merge-explorer-explanation merge-explorer-explanation-match":"merge-explorer-explanation";u.className=w,u.textContent=c.explanation}o.addEventListener("change",()=>{e=o.value,d()}),n.addEventListener("click",d),a.addEventListener("click",()=>{r=h(),d()}),d()}export{E as mount};
