import{d as p,e as l}from"./chunk-JSVLZHI4.js";var d=`
.hash-explorer {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.hash-explorer-input-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  align-items: center;
}

.hash-explorer-input-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  white-space: nowrap;
}

.hash-explorer-input {
  flex: 1;
  font-family: var(--font-mono, monospace);
  font-size: 1rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 6px;
  background: var(--bg, #fff);
  color: var(--text, #0f172a);
  outline: none;
  transition: border-color 0.15s ease;
}
.hash-explorer-input:focus {
  border-color: var(--accent, #0d9488);
  box-shadow: 0 0 0 3px var(--accent-glow, rgba(13,148,136,0.1));
}

.hash-explorer-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 1.25rem;
}

.hash-explorer-chip {
  font-family: var(--font-mono, monospace);
  font-size: 0.8rem;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  border: 1px solid var(--border, #cbd5e1);
  background: transparent;
  color: var(--text-secondary, #475569);
  cursor: pointer;
  transition: all 0.15s ease;
}
.hash-explorer-chip:hover {
  background: var(--accent-glow, rgba(13,148,136,0.1));
  border-color: var(--accent, #0d9488);
  color: var(--accent, #0d9488);
}

.hash-explorer-results {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.hash-explorer-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.hash-explorer-row-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-width: 7rem;
  flex-shrink: 0;
}

.hash-explorer-row-value {
  font-family: var(--font-mono, monospace);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text, #0f172a);
  word-break: break-all;
  line-height: 1.6;
}

.hash-explorer-bit-zero {
  color: var(--accent, #0d9488);
  font-weight: 700;
}

.hash-explorer-bit-one-first {
  color: var(--accent-secondary, #f97316);
  font-weight: 700;
}

.hash-explorer-bit-rest {
  color: var(--text-muted, #94a3b8);
}

.hash-explorer-bit-space {
  display: inline-block;
  width: 0.3em;
}

.hash-explorer-zeros-count {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.hash-explorer-zeros-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.8rem;
  height: 1.8rem;
  border-radius: 6px;
  font-family: var(--font-mono, monospace);
  font-size: 1rem;
  font-weight: 700;
  background: var(--accent, #0d9488);
  color: #fff;
}

.hash-explorer-estimate {
  font-weight: 700;
  color: var(--accent, #0d9488);
}

.hash-explorer-empty {
  color: var(--text-muted, #94a3b8);
  font-style: italic;
  font-size: 0.9rem;
  padding: 1rem 0;
}

.hash-explorer-divider {
  border: none;
  border-top: 1px solid var(--border, #cbd5e1);
  margin: 0.25rem 0;
}
`,h=!1;function u(){if(h)return;let e=document.createElement("style");e.textContent=d,document.head.appendChild(e),h=!0}function m(e){return(e>>>0).toString(16).padStart(8,"0")}function x(e){return(e>>>0).toString(2).padStart(32,"0")}function f(e){let o=l(parseInt(e,2)>>>0,32),s=e==="0".repeat(32),a=[];for(let r=0;r<32;r++)r>0&&r%4===0&&a.push('<span class="hash-explorer-bit-space"></span>'),r<o?a.push(`<span class="hash-explorer-bit-zero">${e[r]}</span>`):r===o&&!s?a.push(`<span class="hash-explorer-bit-one-first">${e[r]}</span>`):a.push(`<span class="hash-explorer-bit-rest">${e[r]}</span>`);return a.join("")}function v(e){return e.match(/.{2}/g)?.join(" ")||e}function i(e,o){let s=e.querySelector(".hash-explorer-results");if(o.length===0){s.innerHTML='<div class="hash-explorer-empty">Type something above to see its hash...</div>';return}let a=p(o,0),r=m(a),t=x(a),n=l(a,32),c=Math.pow(2,n);s.innerHTML=`
    <div class="hash-explorer-row">
      <span class="hash-explorer-row-label">Hash (hex)</span>
      <span class="hash-explorer-row-value">${v(r)}</span>
    </div>
    <hr class="hash-explorer-divider">
    <div class="hash-explorer-row">
      <span class="hash-explorer-row-label">Hash (binary)</span>
      <span class="hash-explorer-row-value">${f(t)}</span>
    </div>
    <hr class="hash-explorer-divider">
    <div class="hash-explorer-row">
      <span class="hash-explorer-row-label">Leading zeros</span>
      <span class="hash-explorer-row-value">
        <span class="hash-explorer-zeros-count">
          <span class="hash-explorer-zeros-badge">${n}</span>
        </span>
      </span>
    </div>
    <div class="hash-explorer-row">
      <span class="hash-explorer-row-label">Estimate</span>
      <span class="hash-explorer-row-value">
        <span class="hash-explorer-estimate">2<sup>${n}</sup> = ${c.toLocaleString()}</span>
      </span>
    </div>
  `}var g=["1","2","3","hello","hello!","hellp","user_42","alice@example.com"];function b(e){if(!e){console.error("hash-explorer: mount element not found");return}u();let o=g.map(r=>{let t=r.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");return`<button class="hash-explorer-chip" data-input="${t}">${t}</button>`}).join("");e.innerHTML=`
    <div class="hash-explorer">
      <div class="hash-explorer-input-row">
        <span class="hash-explorer-input-label">Type anything:</span>
        <input type="text" class="hash-explorer-input"
               placeholder="hello" value="hello">
      </div>
      <div class="hash-explorer-chips">
        Try: ${o}
      </div>
      <div class="hash-explorer-results"></div>
    </div>
  `;let s=e.querySelector(".hash-explorer-input"),a=e.querySelectorAll(".hash-explorer-chip");s.addEventListener("input",()=>{i(e,s.value)});for(let r of a)r.addEventListener("click",()=>{let t=r.dataset.input||"";s.value=t,i(e,t),s.focus()});i(e,s.value)}export{b as mount};
