import{a as A}from"./chunk-X6ICKQ43.js";var G=`
.trie-scanner {
  border: 2px solid var(--border, #d0d8e4);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 2rem 0;
  background: var(--bg, #fff);
  font-family: var(--font-body, system-ui, sans-serif);
}

.trie-scanner-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.trie-scanner-header h3 {
  margin: 0;
  font-family: var(--font-heading, var(--font-mono, monospace));
  font-size: 1.1rem;
  color: var(--text, #1e2a3a);
}

/* \u2500\u2500 Word list \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.trie-scanner-words {
  margin-bottom: 1rem;
}

.trie-scanner-words-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted, #8899aa);
  margin-bottom: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.trie-scanner-word-input-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.trie-scanner-word-input {
  flex: 1;
  padding: 0.4rem 0.7rem;
  border: 1.5px solid var(--border, #d0d8e4);
  border-radius: 6px;
  font-family: var(--font-mono, 'SF Mono', monospace);
  font-size: 0.9rem;
  background: var(--bg, #fff);
  color: var(--text, #1e2a3a);
  outline: none;
  transition: border-color 0.15s;
}
.trie-scanner-word-input:focus {
  border-color: var(--accent, #d94040);
}

.trie-scanner-btn {
  padding: 0.4rem 0.85rem;
  border: 1.5px solid var(--accent, #d94040);
  border-radius: 6px;
  background: var(--bg, #fff);
  color: var(--accent, #d94040);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.trie-scanner-btn:hover {
  background: var(--accent, #d94040);
  color: #fff;
}

.trie-scanner-btn-sm {
  padding: 0.25rem 0.55rem;
  font-size: 0.75rem;
}

.trie-scanner-btn-active {
  background: var(--accent, #d94040);
  color: #fff;
}

.trie-scanner-word-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.5rem;
  min-height: 1.8rem;
}

.trie-scanner-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  background: var(--accent, #d94040);
  color: #fff;
  font-family: var(--font-mono, 'SF Mono', monospace);
  font-size: 0.8rem;
  font-weight: 600;
}

.trie-scanner-tag-remove {
  cursor: pointer;
  opacity: 0.7;
  font-size: 0.9rem;
  line-height: 1;
}
.trie-scanner-tag-remove:hover {
  opacity: 1;
}

.trie-scanner-presets {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.trie-scanner-presets-label {
  font-size: 0.75rem;
  color: var(--text-muted, #8899aa);
  margin-right: 0.3rem;
  align-self: center;
}

/* \u2500\u2500 Options row \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.trie-scanner-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  align-items: center;
}

.trie-scanner-option {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--text, #1e2a3a);
  cursor: pointer;
  user-select: none;
}

.trie-scanner-option input[type="checkbox"] {
  accent-color: var(--accent, #d94040);
  width: 16px;
  height: 16px;
}

/* \u2500\u2500 Text area \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.trie-scanner-text-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted, #8899aa);
  margin-bottom: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.trie-scanner-textarea {
  width: 100%;
  min-height: 90px;
  padding: 0.7rem;
  border: 1.5px solid var(--border, #d0d8e4);
  border-radius: 6px;
  font-family: var(--font-body, system-ui, sans-serif);
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text, #1e2a3a);
  background: var(--bg, #fff);
  resize: vertical;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.trie-scanner-textarea:focus {
  border-color: var(--accent, #d94040);
}

/* \u2500\u2500 Results \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.trie-scanner-results {
  margin-top: 1rem;
}

.trie-scanner-results-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted, #8899aa);
  margin-bottom: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.trie-scanner-output {
  padding: 0.9rem;
  border: 1.5px solid var(--border, #d0d8e4);
  border-radius: 6px;
  font-family: var(--font-body, system-ui, sans-serif);
  font-size: 0.95rem;
  line-height: 1.8;
  color: var(--text, #1e2a3a);
  background: var(--bg, #fff);
  min-height: 3rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.trie-scanner-match {
  background: color-mix(in srgb, var(--accent, #d94040) 18%, transparent);
  border-bottom: 2px solid var(--accent, #d94040);
  padding: 0.05em 0.15em;
  border-radius: 2px;
  cursor: default;
  transition: background 0.15s;
}
.trie-scanner-match:hover {
  background: color-mix(in srgb, var(--accent, #d94040) 35%, transparent);
}

.trie-scanner-stats {
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
  margin-top: 0.7rem;
  font-size: 0.82rem;
  color: var(--text-muted, #8899aa);
}

.trie-scanner-stat-value {
  font-weight: 700;
  color: var(--accent, #d94040);
  font-family: var(--font-mono, 'SF Mono', monospace);
}

.trie-scanner-empty {
  color: var(--text-muted, #8899aa);
  font-style: italic;
}
`,O=!1;function K(){if(O)return;let m=document.createElement("style");m.textContent=G,document.head.appendChild(m),O=!0}var j=[{label:"Cities",words:["New York","New Orleans","San Francisco","San Jose","San Diego","Los Angeles","Las Vegas"],text:"The flight from New York to San Francisco takes about five hours. From there you can drive to San Jose or head south toward Los Angeles and San Diego. Meanwhile New Orleans is hosting its annual jazz festival, and Las Vegas is packed for a tech conference."},{label:"Programming",words:["map","reduce","filter","sort","slice","find","flat","join"],text:"First we filter the records by date, then map each one to its score. We sort the results and slice the top ten. To combine groups, we flat map nested arrays and reduce them into a single total. Finally we join the strings and find any anomalies."},{label:"Animals",words:["cat","car","card","cart","care","the","there","their","them"],text:"The cat sat on their card table. There was a cart outside, and the car was parked nearby. They showed care for them, and the cat purred happily there."},{label:"Overlap Demo",words:["New","New York","New York City","York"],text:"Welcome to New York City, the greatest city in the world. New York has something for everyone. York is also a city in England."}];function Q(m){K();let r=new A,l=!0,d=!1,k=!0,u=document.createElement("div");u.className="trie-scanner";let Y=a("div","trie-scanner-header");Y.appendChild(s("h3","Trie Text Scanner")),u.appendChild(Y);let w=a("div","trie-scanner-words");w.appendChild(s("div","Dictionary","trie-scanner-words-label"));let T=a("div","trie-scanner-word-input-row"),p=document.createElement("input");p.type="text",p.className="trie-scanner-word-input",p.placeholder="Add a word or phrase...",T.appendChild(p);let B=s("button","Add","trie-scanner-btn trie-scanner-btn-sm");T.appendChild(B);let F=s("button","Clear All","trie-scanner-btn trie-scanner-btn-sm");T.appendChild(F),w.appendChild(T);let E=a("div","trie-scanner-word-tags");w.appendChild(E);let M=a("div","trie-scanner-presets");M.appendChild(s("span","Try:","trie-scanner-presets-label"));let P=[];for(let e of j){let t=s("button",e.label,"trie-scanner-btn trie-scanner-btn-sm");P.push(t),M.appendChild(t)}w.appendChild(M),u.appendChild(w);let L=a("div","trie-scanner-options"),N=a("label","trie-scanner-option"),x=document.createElement("input");x.type="checkbox",x.checked=l,N.appendChild(x),N.appendChild(document.createTextNode("Word boundaries")),L.appendChild(N);let z=a("label","trie-scanner-option"),C=document.createElement("input");C.type="checkbox",C.checked=d,z.appendChild(C),z.appendChild(document.createTextNode("Case sensitive")),L.appendChild(z);let W=a("label","trie-scanner-option"),y=document.createElement("input");y.type="checkbox",y.checked=k,W.appendChild(y),W.appendChild(document.createTextNode("Resolve overlaps")),L.appendChild(W),u.appendChild(L);let H=a("div","");H.appendChild(s("div","Text to scan","trie-scanner-text-label"));let b=document.createElement("textarea");b.className="trie-scanner-textarea",b.placeholder="Type or paste text here, then watch the trie find all matches...",H.appendChild(b),u.appendChild(H);let S=a("div","trie-scanner-results");S.appendChild(s("div","Matches","trie-scanner-results-label"));let c=a("div","trie-scanner-output");S.appendChild(c);let h=a("div","trie-scanner-stats");S.appendChild(h),u.appendChild(S),m.appendChild(u);function R(e){let t=e.trim();if(!t)return;let n=d?t:t.toLowerCase();r.insert(n),v(),f()}function D(e){let t=r.getWords().filter(n=>n!==e);r.clear();for(let n of t)r.insert(n);v(),f()}function I(){r.clear(),v(),f()}function J(e){r.clear();for(let t of e.words){let n=d?t:t.toLowerCase();r.insert(n)}b.value=e.text,v(),f()}function v(){E.innerHTML="";let e=r.getWords();if(e.length===0){E.appendChild(s("span","No words loaded","trie-scanner-empty"));return}for(let t of e){let n=a("span","trie-scanner-tag");n.appendChild(document.createTextNode(t));let o=s("span","\xD7","trie-scanner-tag-remove");o.addEventListener("click",()=>D(t)),n.appendChild(o),E.appendChild(n)}}function f(){let e=b.value;if(!e||r.wordCount===0){c.innerHTML="",!e&&r.wordCount>0?c.appendChild(s("span","Enter some text to scan...","trie-scanner-empty")):e&&r.wordCount===0?c.appendChild(s("span","Add words to the dictionary first...","trie-scanner-empty")):c.appendChild(s("span","Add words and enter text to see matches","trie-scanner-empty")),h.innerHTML="";return}let t=r.findAllMatches(e,{wordBoundaries:l,caseSensitive:d}),n=t.length;k&&(t=A.resolveOverlaps(t)),V(e,t),q(n,t.length,e.length)}function V(e,t){if(c.innerHTML="",t.length===0){c.appendChild(document.createTextNode(e));return}let n=[...t].sort((i,g)=>i.start-g.start),o=0;for(let i of n){i.start>o&&c.appendChild(document.createTextNode(e.slice(o,i.start)));let g=a("span","trie-scanner-match");g.textContent=e.slice(i.start,i.end),g.title=`"${i.match}" \u2192 pattern "${i.pattern}" [${i.start}:${i.end}]`,c.appendChild(g),o=i.end}o<e.length&&c.appendChild(document.createTextNode(e.slice(o)))}function q(e,t,n){h.innerHTML="";let o=(i,g)=>{let $=a("span","");return $.innerHTML=`${i}: <span class="trie-scanner-stat-value">${g}</span>`,$};h.appendChild(o("Matches",t)),k&&e!==t&&h.appendChild(o("Before overlap resolution",e)),h.appendChild(o("Patterns",r.wordCount)),h.appendChild(o("Text length",`${n} chars`)),h.appendChild(o("Trie nodes",r.nodeCount))}p.addEventListener("keydown",e=>{e.key==="Enter"&&(R(p.value),p.value="")}),B.addEventListener("click",()=>{R(p.value),p.value=""}),F.addEventListener("click",I),P.forEach((e,t)=>{e.addEventListener("click",()=>J(j[t]))}),b.addEventListener("input",f),x.addEventListener("change",()=>{l=x.checked,f()}),C.addEventListener("change",()=>{d=C.checked;let e=r.getWords();r.clear();for(let t of e){let n=d?t:t.toLowerCase();r.insert(n)}v(),f()}),y.addEventListener("change",()=>{k=y.checked,f()}),v()}function a(m,r){let l=document.createElement(m);return r&&(l.className=r),l}function s(m,r,l=""){let d=document.createElement(m);return l&&(d.className=l),d.textContent=r,d}export{Q as mount};
