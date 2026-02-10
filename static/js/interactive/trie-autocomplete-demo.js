function S(){return{children:new Map,entries:[]}}var N=class{constructor(){this.root=S();this._size=0;this._nodeCount=1}insert(s,d=0){let a=this.root,l=s.toLowerCase();for(let n of l)a.children.has(n)||(a.children.set(n,S()),this._nodeCount++),a=a.children.get(n);a.entries.push({text:s,score:d}),this._size++}search(s,d=10){let a=this.root,l=s.toLowerCase();for(let e of l){if(!a.children.has(e))return[];a=a.children.get(e)}let n=[],u=e=>{for(let r of e.entries)n.push(r);for(let r of e.children.values())u(r)};return u(a),n.sort((e,r)=>r.score-e.score||e.text.localeCompare(r.text)),n.slice(0,d)}get size(){return this._size}get nodeCount(){return this._nodeCount}};function A(g,s,d=10){let a=s.toLowerCase(),l=g.filter(n=>n.text.toLowerCase().startsWith(a));return l.sort((n,u)=>u.score-n.score||n.text.localeCompare(u.text)),l.slice(0,d)}var H=`
.trie-ac-demo {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.trie-ac-demo-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  color: var(--text-muted, #64748b);
  font-size: 0.9rem;
}

.trie-ac-demo-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border, #d0d8e4);
  border-top-color: var(--accent, #d94040);
  border-radius: 50%;
  animation: trie-ac-spin 0.7s linear infinite;
}

@keyframes trie-ac-spin {
  to { transform: rotate(360deg); }
}

.trie-ac-demo-build-stats {
  font-size: 0.8rem;
  color: var(--text-muted, #64748b);
  margin-bottom: 1rem;
  font-family: var(--font-mono, monospace);
  line-height: 1.6;
}

.trie-ac-demo-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
@media (max-width: 640px) {
  .trie-ac-demo-panels {
    grid-template-columns: 1fr;
  }
}

.trie-ac-panel {
  position: relative;
  display: flex;
  flex-direction: column;
}

.trie-ac-panel-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  font-family: var(--font-mono, monospace);
}
.trie-ac-panel-title.trie {
  color: var(--accent, #d94040);
}
.trie-ac-panel-title.filter {
  color: var(--text-muted, #64748b);
}

.trie-ac-panel-input {
  width: 100%;
  padding: 0.6rem 0.85rem;
  font-size: 1rem;
  font-family: inherit;
  border: 1.5px solid var(--border, #d0d8e4);
  border-radius: 6px;
  background: var(--bg, #fff);
  color: var(--text, #0f172a);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.trie-ac-panel-input:focus {
  border-color: var(--accent, #d94040);
}
.trie-ac-panel-input::placeholder {
  color: var(--text-muted, #8899aa);
}

.trie-ac-panel-dropdown {
  position: absolute;
  top: calc(0.8rem + 0.5rem + 1rem + 0.6rem * 2 + 3px + 4px);
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--bg, #fff);
  border: 1.5px solid var(--border, #d0d8e4);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 100;
  max-height: 240px;
  overflow-y: auto;
  list-style: none;
  padding: 4px 0;
  margin: 4px 0 0 0;
}

.trie-ac-panel-item {
  padding: 0.4rem 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.1s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text, #0f172a);
}
.trie-ac-panel-item:hover,
.trie-ac-panel-item[data-highlighted="true"] {
  background: var(--bg-hover, #f0f4f8);
}

.trie-ac-panel-item .match-bold {
  font-weight: 700;
}
.trie-ac-panel-item .score {
  color: var(--text-muted, #8899aa);
  font-size: 0.75rem;
  margin-left: 0.5rem;
  flex-shrink: 0;
}

.trie-ac-panel-no-match {
  padding: 0.4rem 0.75rem;
  color: var(--text-muted, #8899aa);
  font-style: italic;
  font-size: 0.85rem;
}

.trie-ac-panel-stats {
  font-size: 0.78rem;
  color: var(--text-muted, #64748b);
  margin-top: 0.5rem;
  font-family: var(--font-mono, monospace);
  min-height: 1.4em;
}
.trie-ac-panel-stats .time-value {
  font-weight: 700;
}
.trie-ac-panel-stats .time-value.fast {
  color: #16a34a;
}
.trie-ac-panel-stats .time-value.slow {
  color: var(--accent, #d94040);
}

.trie-ac-demo-hint {
  font-size: 0.8rem;
  color: var(--text-muted, #94a3b8);
  margin-top: 0.75rem;
}
`,F="/data/trie-demo/words.json";function k(g,s,d,a,l){let n=document.createElement("div");n.className="trie-ac-panel";let u=document.createElement("div");u.className=`trie-ac-panel-title ${d}`,u.textContent=s,n.appendChild(u);let e=document.createElement("input");e.type="text",e.className="trie-ac-panel-input",e.placeholder=a,e.setAttribute("autocomplete","off"),n.appendChild(e);let r=document.createElement("ul");r.className="trie-ac-panel-dropdown",r.style.display="none",n.appendChild(r);let v=document.createElement("div");v.className="trie-ac-panel-stats",n.appendChild(v);let c=!1,o=-1,i=[],b=0;function C(){if(r.innerHTML="",i.length===0&&e.value.length>=1){let m=document.createElement("li");m.className="trie-ac-panel-no-match",m.textContent="No matches",r.appendChild(m),r.style.display="block";return}if(i.length===0){r.style.display="none";return}let t=e.value;for(let m=0;m<i.length;m++){let p=i[m],y=document.createElement("li");y.className="trie-ac-panel-item",y.dataset.highlighted=String(m===o);let L=document.createElement("span"),M=p.text.toLowerCase(),z=t.toLowerCase(),T=M.indexOf(z);if(T>=0&&t.length>0){L.appendChild(document.createTextNode(p.text.slice(0,T)));let f=document.createElement("span");f.className="match-bold",f.textContent=p.text.slice(T,T+t.length),L.appendChild(f),L.appendChild(document.createTextNode(p.text.slice(T+t.length)))}else L.textContent=p.text;if(y.appendChild(L),p.score>0){let f=document.createElement("span");f.className="score",f.textContent=p.score.toFixed(2),y.appendChild(f)}y.addEventListener("mousedown",f=>{f.preventDefault(),e.value=p.text,c=!1,r.style.display="none",x()}),y.addEventListener("mouseenter",()=>{o=m,E()}),r.appendChild(y)}r.style.display="block"}function E(){let t=r.querySelectorAll(".trie-ac-panel-item");t.forEach((m,p)=>{m.dataset.highlighted=String(p===o)}),o>=0&&t[o]&&t[o].scrollIntoView({block:"nearest"})}function h(t){return t<1e3?t+" \xB5s":(t/1e3).toFixed(1)+" ms"}function w(){if(e.value.length===0){v.innerHTML="";return}let t=b<1e3?"fast":"slow";v.innerHTML=`${i.length} result${i.length!==1?"s":""} in <span class="time-value ${t}">${h(b)}</span>`}function x(){let t=e.value;if(t.length<1){i=[],b=0,c=!1,r.style.display="none",w();return}let{results:m,micros:p}=l(t);i=m,b=p,o=-1,w()}return e.addEventListener("input",()=>{x(),c=!0,C()}),e.addEventListener("focus",()=>{e.value.length>=1&&i.length>0&&(c=!0,C())}),e.addEventListener("blur",()=>{setTimeout(()=>{c=!1,r.style.display="none"},150)}),e.addEventListener("keydown",t=>{if(!c||i.length===0){t.key==="ArrowDown"&&i.length>0&&(c=!0,C(),t.preventDefault());return}switch(t.key){case"ArrowDown":t.preventDefault(),o=o<i.length-1?o+1:0,E();break;case"ArrowUp":t.preventDefault(),o=o>0?o-1:i.length-1,E();break;case"Enter":t.preventDefault(),o>=0&&o<i.length&&(e.value=i[o].text,c=!1,r.style.display="none",x());break;case"Escape":c=!1,o=-1,r.style.display="none";break}}),{panel:n,input:e}}function $(g){if(!g)return;if(!document.getElementById("trie-ac-demo-styles")){let e=document.createElement("style");e.id="trie-ac-demo-styles",e.textContent=H,document.head.appendChild(e)}g.innerHTML="";let s=document.createElement("div");s.className="trie-ac-demo";let d=document.createElement("div");d.className="trie-ac-demo-loading",d.innerHTML='<div class="trie-ac-demo-spinner"></div><span>Fetching 235,000-word dictionary...</span>',s.appendChild(d);let a=document.createElement("div");a.className="trie-ac-demo-build-stats",a.style.display="none",s.appendChild(a);let l=document.createElement("div");l.className="trie-ac-demo-panels",l.style.display="none",s.appendChild(l);let n=document.createElement("div");n.className="trie-ac-demo-hint",n.style.display="none",n.textContent="Type the same prefix in both boxes and compare the search times",s.appendChild(n),g.appendChild(s);let u=performance.now();fetch(F).then(e=>{if(!e.ok)throw new Error(`HTTP ${e.status}`);return e.json()}).then(e=>{let r=(performance.now()-u).toFixed(0),v=performance.now(),c=new N;for(let h of e)c.insert(h.text,h.score);let o=(performance.now()-v).toFixed(0);d.style.display="none",a.style.display="block",l.style.display="grid",n.style.display="block",a.innerHTML=`${c.size.toLocaleString()} words loaded \xB7 Fetched in ${r} ms \xB7 Trie built in ${o} ms (${c.nodeCount.toLocaleString()} nodes)`;let i=h=>{let w=performance.now(),x=c.search(h,10),t=Math.round((performance.now()-w)*1e3);return{results:x,micros:t}},b=h=>{let w=performance.now(),x=A(e,h,10),t=Math.round((performance.now()-w)*1e3);return{results:x,micros:t}},{panel:C}=k("trie","Trie \xB7 O(L)","trie","Search with trie...",i),{panel:E}=k("filter","Array.filter \xB7 O(N)","filter","Search with filter...",b);l.appendChild(C),l.appendChild(E)}).catch(e=>{d.innerHTML=`<span style="color:var(--accent,#d94040)">Failed to load dictionary: ${e.message}</span>`})}export{$ as mount};
