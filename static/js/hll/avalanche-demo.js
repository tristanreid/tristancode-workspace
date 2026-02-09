import{d,e as i}from"./chunk-JSVLZHI4.js";var p=`
.avalanche-demo {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.avalanche-demo-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
  align-items: flex-end;
}

.avalanche-demo-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 140px;
}

.avalanche-demo-input-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary, #475569);
}

.avalanche-demo-input {
  font-family: var(--font-mono, monospace);
  font-size: 0.9rem;
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 6px;
  background: var(--bg, #fff);
  color: var(--text, #0f172a);
  outline: none;
  transition: border-color 0.15s ease;
}
.avalanche-demo-input:focus {
  border-color: var(--accent, #0d9488);
  box-shadow: 0 0 0 3px var(--accent-glow, rgba(13,148,136,0.1));
}

.avalanche-demo-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.avalanche-demo-chip {
  font-family: var(--font-mono, monospace);
  font-size: 0.78rem;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  border: 1px solid var(--border, #cbd5e1);
  background: transparent;
  color: var(--text-secondary, #475569);
  cursor: pointer;
  transition: all 0.15s ease;
}
.avalanche-demo-chip:hover {
  background: var(--accent-glow, rgba(13,148,136,0.1));
  border-color: var(--accent, #0d9488);
  color: var(--accent, #0d9488);
}

.avalanche-demo-table-wrap {
  overflow-x: auto;
  margin-bottom: 1rem;
}

.avalanche-demo-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.avalanche-demo-table th {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-bottom: 2px solid var(--accent, #0d9488);
  white-space: nowrap;
}

.avalanche-demo-table td {
  font-family: var(--font-mono, monospace);
  padding: 0.4rem 0.75rem;
  border-bottom: 1px solid var(--border, #cbd5e1);
  vertical-align: middle;
}

.avalanche-demo-table tr:last-child td {
  border-bottom: none;
}

.avalanche-demo-table tr:nth-child(even) td {
  background: rgba(0,0,0,0.015);
}

.avalanche-demo-input-cell {
  color: var(--text, #0f172a);
  font-weight: 500;
}

.avalanche-demo-binary-cell {
  font-size: 0.78rem;
  letter-spacing: 0.03em;
  line-height: 1.5;
}

.avalanche-demo-bit-zero {
  color: var(--accent, #0d9488);
  font-weight: 700;
}

.avalanche-demo-bit-one-first {
  color: var(--accent-secondary, #f97316);
  font-weight: 700;
}

.avalanche-demo-bit-rest {
  color: var(--text-muted, #94a3b8);
}

.avalanche-demo-bit-space {
  display: inline-block;
  width: 0.2em;
}

.avalanche-demo-lz-cell {
  text-align: center;
}

.avalanche-demo-lz-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.6rem;
  height: 1.6rem;
  border-radius: 5px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
}

.avalanche-demo-lz-badge-low {
  background: var(--accent, #0d9488);
}
.avalanche-demo-lz-badge-mid {
  background: #f59e0b;
}
.avalanche-demo-lz-badge-high {
  background: var(--accent-secondary, #f97316);
}

.avalanche-demo-bar-cell {
  width: 100px;
  min-width: 60px;
}

.avalanche-demo-bar {
  height: 14px;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.avalanche-demo-bar-low {
  background: var(--accent, #0d9488);
}
.avalanche-demo-bar-mid {
  background: #f59e0b;
}
.avalanche-demo-bar-high {
  background: var(--accent-secondary, #f97316);
}

.avalanche-demo-callout {
  font-size: 0.85rem;
  color: var(--text-secondary, #475569);
  line-height: 1.5;
  padding: 0.75rem 1rem;
  background: var(--blockquote-bg, rgba(249,115,22,0.04));
  border-left: 3px solid var(--blockquote-border, #f97316);
  border-radius: 0 6px 6px 0;
}
`,m=!1;function u(){if(m)return;let e=document.createElement("style");e.textContent=p,document.head.appendChild(e),m=!0}function b(e,n){let c=[];for(let t=1;t<=n;t++){let r=e+String(t),a=d(r,0),l=(a>>>0).toString(2).padStart(32,"0"),o=i(a,32);c.push({input:r,hash:a,binary:l,leadingZeros:o})}return c}function v(e){return e<=2?"low":e<=5?"mid":"high"}function g(e,n){let c=e==="0".repeat(32),t=[],r=16;for(let a=0;a<r;a++)a>0&&a%4===0&&t.push('<span class="avalanche-demo-bit-space"></span>'),a<n?t.push(`<span class="avalanche-demo-bit-zero">${e[a]}</span>`):a===n&&!c?t.push(`<span class="avalanche-demo-bit-one-first">${e[a]}</span>`):t.push(`<span class="avalanche-demo-bit-rest">${e[a]}</span>`);return t.push('<span class="avalanche-demo-bit-rest">\u2026</span>'),t.join("")}function f(e,n,c){let t=e.querySelector(".avalanche-demo-table-wrap"),r=b(n,c),a=Math.max(...r.map(o=>o.leadingZeros),1),l=r.map(o=>{let s=v(o.leadingZeros),h=Math.max(4,o.leadingZeros/a*100);return`<tr>
        <td class="avalanche-demo-input-cell">${x(o.input)}</td>
        <td class="avalanche-demo-binary-cell">${g(o.binary,o.leadingZeros)}</td>
        <td class="avalanche-demo-lz-cell">
          <span class="avalanche-demo-lz-badge avalanche-demo-lz-badge-${s}">${o.leadingZeros}</span>
        </td>
        <td class="avalanche-demo-bar-cell">
          <div class="avalanche-demo-bar avalanche-demo-bar-${s}" style="width:${h}%"></div>
        </td>
      </tr>`}).join("");t.innerHTML=`
    <table class="avalanche-demo-table">
      <thead>
        <tr>
          <th>Input</th>
          <th>Hash (first 16 bits)</th>
          <th>Leading 0s</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${l}
      </tbody>
    </table>
  `}function x(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}var w=[{label:"(none)",value:""},{label:"user_",value:"user_"},{label:"item-",value:"item-"},{label:"page/",value:"page/"}],y=20;function k(e){if(!e){console.error("avalanche-demo: mount element not found");return}u();let n="",c=w.map(l=>`<button class="avalanche-demo-chip" data-prefix="${l.value}">${l.label}</button>`).join("");e.innerHTML=`
    <div class="avalanche-demo">
      <div class="avalanche-demo-controls">
        <div class="avalanche-demo-input-group">
          <label class="avalanche-demo-input-label">Prefix (optional)</label>
          <input type="text" class="avalanche-demo-input"
                 placeholder="e.g. user_" value="">
        </div>
      </div>
      <div class="avalanche-demo-chips">
        Presets: ${c}
      </div>
      <div class="avalanche-demo-table-wrap"></div>
      <div class="avalanche-demo-callout">
        Even though the inputs are sequential (<strong>1, 2, 3, \u2026</strong>), the leading-zero
        counts bounce around randomly. The hash of <strong>"1"</strong> tells you
        <em>nothing</em> about the hash of <strong>"2"</strong>.
        This is why HyperLogLog works regardless of what your data looks like \u2014
        hashing erases all structure.
      </div>
    </div>
  `;let t=e.querySelector(".avalanche-demo-input"),r=e.querySelectorAll(".avalanche-demo-chip");function a(){f(e,n,y)}t.addEventListener("input",()=>{n=t.value,a()});for(let l of r)l.addEventListener("click",()=>{n=l.dataset.prefix||"",t.value=n,a()});a()}export{k as mount};
