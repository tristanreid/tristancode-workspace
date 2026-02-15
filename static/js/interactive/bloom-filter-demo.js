function G(e,t,r){let n=2166136261^t;for(let i=0;i<e.length;i++)n^=e.charCodeAt(i),n=Math.imul(n,16777619);return(n>>>0)%r}function H(e,t,r){return Array.from({length:t},(n,i)=>G(e,i*2654435769,r))}function g(e,t){return{bits:new Uint8Array(e),m:e,k:t,items:[]}}function k(e,t){let r=H(t,e.k,e.m);for(let n of r)e.bits[n]=1;return e.items.push(t),r}function J(e,t){let r=H(t,e.k,e.m);return{found:r.every(i=>e.bits[i]===1),positions:r}}function B(e,t){let r=g(e.m,e.k);for(let n=0;n<e.m;n++)r.bits[n]=e.bits[n]|t.bits[n];return r.items=[...new Set([...e.items,...t.items])],r}function Q(e){let t=0;for(let r=0;r<e.m;r++)e.bits[r]&&t++;return t/e.m}var V=`
.bloom-demo {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.bloom-demo-filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

@media (max-width: 580px) {
  .bloom-demo-filters {
    grid-template-columns: 1fr;
  }
}

.bloom-demo-filter {
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 8px;
  padding: 0.75rem;
  background: var(--bg, #fff);
}

.bloom-demo-filter-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem;
}

.bloom-demo-filter-title-a { color: var(--accent, #0d9488); }
.bloom-demo-filter-title-b { color: #8b5cf6; }
.bloom-demo-filter-title-merged { color: #e87b35; }

.bloom-demo-input-row {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.bloom-demo-input {
  font-family: var(--font-mono, monospace);
  font-size: 0.85rem;
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 5px;
  background: var(--bg-secondary, #f1f5f9);
  color: var(--text, #0f172a);
  flex: 1;
  min-width: 0;
}
.bloom-demo-input:focus {
  outline: 2px solid var(--accent, #0d9488);
  outline-offset: -1px;
}

.bloom-demo-btn {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  border: 1px solid var(--accent, #0d9488);
  background: var(--accent, #0d9488);
  color: #fff;
}
.bloom-demo-btn:hover {
  background: var(--accent-hover, #0f766e);
  border-color: var(--accent-hover, #0f766e);
}

.bloom-demo-btn-purple {
  border-color: #8b5cf6;
  background: #8b5cf6;
}
.bloom-demo-btn-purple:hover {
  background: #7c3aed;
  border-color: #7c3aed;
}

.bloom-demo-btn-orange {
  border-color: #e87b35;
  background: #e87b35;
}
.bloom-demo-btn-orange:hover {
  background: #d4691f;
  border-color: #d4691f;
}

.bloom-demo-btn-secondary {
  background: transparent;
  color: var(--accent, #0d9488);
}
.bloom-demo-btn-secondary:hover {
  background: var(--accent, #0d9488);
  color: #fff;
}

.bloom-demo-bits {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin: 0.5rem 0;
}

.bloom-demo-bit {
  width: 14px;
  height: 14px;
  border-radius: 2px;
  transition: background 0.2s, transform 0.2s;
  flex-shrink: 0;
}

.bloom-demo-bit-off {
  background: var(--border, #cbd5e1);
}

.bloom-demo-bit-on-a {
  background: var(--accent, #0d9488);
}

.bloom-demo-bit-on-b {
  background: #8b5cf6;
}

.bloom-demo-bit-on-merged {
  background: #e87b35;
}

.bloom-demo-bit-highlight {
  transform: scale(1.4);
  box-shadow: 0 0 4px rgba(0,0,0,0.3);
}

.bloom-demo-items {
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
  color: var(--text-muted, #94a3b8);
  margin-top: 0.25rem;
  line-height: 1.4;
  min-height: 1.4em;
}

.bloom-demo-stats {
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
  color: var(--text-secondary, #475569);
  margin-top: 0.25rem;
}

.bloom-demo-merge-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.bloom-demo-merged-panel {
  border: 2px solid #e87b35;
  border-radius: 8px;
  padding: 0.75rem;
  background: var(--bg, #fff);
  margin-bottom: 1rem;
  display: none;
}

.bloom-demo-check-section {
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 8px;
  padding: 0.75rem;
  background: var(--bg, #fff);
}

.bloom-demo-check-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary, #475569);
  margin-bottom: 0.5rem;
}

.bloom-demo-check-result {
  font-family: var(--font-mono, monospace);
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;
  border-radius: 5px;
  margin-top: 0.5rem;
  display: none;
}

.bloom-demo-check-positive {
  background: rgba(13,148,136,0.08);
  color: var(--accent, #0d9488);
  border: 1px solid var(--accent, #0d9488);
}

.bloom-demo-check-negative {
  background: rgba(100,116,139,0.06);
  color: var(--text-secondary, #475569);
  border: 1px solid var(--border, #cbd5e1);
}

.bloom-demo-check-false-positive {
  background: rgba(239,68,68,0.08);
  color: #ef4444;
  border: 1px solid #ef4444;
}

.bloom-demo-explanation {
  font-size: 0.85rem;
  color: var(--text-secondary, #475569);
  line-height: 1.5;
  padding: 0.75rem 1rem;
  margin-top: 0.75rem;
  background: var(--blockquote-bg, rgba(249,115,22,0.04));
  border-left: 3px solid var(--blockquote-border, #f97316);
  border-radius: 0 6px 6px 0;
  display: none;
}
`,w=!1;function W(){if(w)return;let e=document.createElement("style");e.textContent=V,document.head.appendChild(e),w=!0}function X(e,t,r,n){e.innerHTML="";let i=new Set(n??[]);for(let s=0;s<t.m;s++){let m=document.createElement("div");m.className="bloom-demo-bit",t.bits[s]?m.classList.add(r):m.classList.add("bloom-demo-bit-off"),i.has(s)&&m.classList.add("bloom-demo-bit-highlight"),e.appendChild(m)}}function Z(e){if(!e){console.error("bloom-filter-demo: mount element not found");return}W();let t=48,r=3,n=g(t,r),i=g(t,r),s=null,m=["cat","dog","fish"],S=["bird","snake","dog"];e.innerHTML=`
    <div class="bloom-demo">
      <div class="bloom-demo-filters">
        <div class="bloom-demo-filter">
          <div class="bloom-demo-filter-title bloom-demo-filter-title-a">Filter A</div>
          <div class="bloom-demo-input-row">
            <input class="bloom-demo-input" data-input="a" placeholder="Type a word..." />
            <button class="bloom-demo-btn" data-add="a">Add</button>
          </div>
          <div class="bloom-demo-bits" data-bits="a"></div>
          <div class="bloom-demo-items" data-items="a"></div>
          <div class="bloom-demo-stats" data-stats="a"></div>
        </div>
        <div class="bloom-demo-filter">
          <div class="bloom-demo-filter-title bloom-demo-filter-title-b">Filter B</div>
          <div class="bloom-demo-input-row">
            <input class="bloom-demo-input" data-input="b" placeholder="Type a word..." />
            <button class="bloom-demo-btn bloom-demo-btn-purple" data-add="b">Add</button>
          </div>
          <div class="bloom-demo-bits" data-bits="b"></div>
          <div class="bloom-demo-items" data-items="b"></div>
          <div class="bloom-demo-stats" data-stats="b"></div>
        </div>
      </div>

      <div class="bloom-demo-merge-row">
        <button class="bloom-demo-btn bloom-demo-btn-orange" data-merge>Merge (Bitwise OR)</button>
        <button class="bloom-demo-btn bloom-demo-btn-secondary" data-reset>Reset All</button>
      </div>

      <div class="bloom-demo-merged-panel" data-merged-panel>
        <div class="bloom-demo-filter-title bloom-demo-filter-title-merged">Merged Filter (A | B)</div>
        <div class="bloom-demo-bits" data-bits="merged"></div>
        <div class="bloom-demo-items" data-items="merged"></div>
        <div class="bloom-demo-stats" data-stats="merged"></div>
      </div>

      <div class="bloom-demo-check-section">
        <div class="bloom-demo-check-title">Check Membership</div>
        <div class="bloom-demo-input-row">
          <input class="bloom-demo-input" data-input="check" placeholder="Check a word..." />
          <button class="bloom-demo-btn bloom-demo-btn-secondary" data-check>Check</button>
        </div>
        <div class="bloom-demo-check-result" data-check-result></div>
      </div>

      <div class="bloom-demo-explanation" data-explanation></div>
    </div>
  `;let x=e.querySelector('[data-input="a"]'),L=e.querySelector('[data-input="b"]'),E=e.querySelector('[data-input="check"]'),q=e.querySelector('[data-add="a"]'),A=e.querySelector('[data-add="b"]'),F=e.querySelector("[data-merge]"),C=e.querySelector("[data-reset]"),$=e.querySelector("[data-check]"),z=e.querySelector('[data-bits="a"]'),I=e.querySelector('[data-bits="b"]'),j=e.querySelector('[data-bits="merged"]'),N=e.querySelector('[data-items="a"]'),P=e.querySelector('[data-items="b"]'),R=e.querySelector('[data-items="merged"]'),O=e.querySelector('[data-stats="a"]'),U=e.querySelector('[data-stats="b"]'),D=e.querySelector('[data-stats="merged"]'),T=e.querySelector("[data-merged-panel]"),a=e.querySelector("[data-check-result]"),f=e.querySelector("[data-explanation]");function y(o,d,l,b,c,u){X(d,o,c,u),l.textContent=o.items.length>0?`Items: ${o.items.join(", ")}`:"No items yet";let h=Q(o),K=o.bits.reduce((Y,_)=>Y+_,0);b.textContent=`${K}/${o.m} bits set (${(h*100).toFixed(0)}%)`}function p(o,d){y(n,z,N,O,"bloom-demo-bit-on-a",o),y(i,I,P,U,"bloom-demo-bit-on-b",d),s&&(T.style.display="block",y(s,j,R,D,"bloom-demo-bit-on-merged"))}function v(o){let d=o==="a"?x:L,l=d.value.trim().toLowerCase();if(!l)return;let c=k(o==="a"?n:i,l);d.value="",s&&(s=B(n,i)),p(o==="a"?c:void 0,o==="b"?c:void 0),setTimeout(()=>p(),800)}q.addEventListener("click",()=>v("a")),A.addEventListener("click",()=>v("b")),x.addEventListener("keydown",o=>{o.key==="Enter"&&v("a")}),L.addEventListener("keydown",o=>{o.key==="Enter"&&v("b")}),F.addEventListener("click",()=>{s=B(n,i),p(),f.style.display="block",f.textContent="The merged filter is the bitwise OR of both arrays. Any item in either filter will test positive in the merged filter \u2014 that's what makes Bloom filter merge so simple."}),C.addEventListener("click",()=>{n=g(t,r),i=g(t,r),s=null,T.style.display="none",a.style.display="none",f.style.display="none",p()}),$.addEventListener("click",M),E.addEventListener("keydown",o=>{o.key==="Enter"&&M()});function M(){let o=E.value.trim().toLowerCase();if(!o)return;let d=s??n,{found:l,positions:b}=J(d,o),c=d.items.includes(o);if(a.style.display="block",l&&c)a.className="bloom-demo-check-result bloom-demo-check-positive",a.innerHTML=`<strong>"${o}"</strong> \u2014 Probably in set \u2714 (true positive)`;else if(l&&!c)a.className="bloom-demo-check-result bloom-demo-check-false-positive",a.innerHTML=`<strong>"${o}"</strong> \u2014 Probably in set... but it's NOT! \u2718 False positive! Positions [${b.join(", ")}] all happen to be set by other items.`,f.style.display="block",f.textContent=`False positive: "${o}" hashes to positions [${b.join(", ")}], which were all set by other items. The filter says "probably yes" but the answer is actually "no." This is the fundamental trade-off: Bloom filters never miss a real member, but sometimes report false membership.`;else{a.className="bloom-demo-check-result bloom-demo-check-negative";let u=b.filter(h=>!d.bits[h]);a.innerHTML=`<strong>"${o}"</strong> \u2014 Definitely NOT in set \u2714 (position${u.length>1?"s":""} [${u.join(", ")}] ${u.length>1?"are":"is"} 0)`}}for(let o of m)k(n,o);for(let o of S)k(i,o);p()}export{Z as mount};
