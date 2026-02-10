import{e as L,g as C,h as N,l as G}from"./chunk-MO3EAYAC.js";function E(){return{children:new Map,isTerminal:!1,words:[]}}var _=class{constructor(){this.root=E();this._words=[]}insert(r){if(!r)return!1;let e=this.root;for(let n of r)e.children.has(n)||e.children.set(n,E()),e=e.children.get(n);return e.isTerminal?!1:(e.isTerminal=!0,e.words.push(r),this._words.push(r),!0)}search(r){let e=this.root;for(let n of r){if(!e.children.has(n))return!1;e=e.children.get(n)}return e.isTerminal}startsWith(r){let e=this.root;for(let n of r){if(!e.children.has(n))return!1;e=e.children.get(n)}return!0}getWords(){return[...this._words]}get wordCount(){return this._words.length}get nodeCount(){let r=0,e=n=>{r++;for(let i of n.children.values())e(i)};return e(this.root),r}get totalChars(){return this._words.reduce((r,e)=>r+e.length,0)}toHierarchy(){let r=(e,n,i)=>{let h=[...e.children.keys()].sort().map(l=>r(e.children.get(l),l,i+l));return{id:i||"__root__",char:n,path:i,isTerminal:e.isTerminal,words:[...e.words],children:h}};return r(this.root,"","")}clear(){this.root=E(),this._words=[]}};var j=`
.trie-viz-svg {
  display: block;
  margin: 0 auto;
  overflow: visible;
}

.trie-viz-link {
  fill: none;
  stroke: var(--border, #cbd5e1);
  stroke-width: 2.5;
  stroke-linecap: round;
}

.trie-viz-node-root .trie-viz-circle {
  fill: var(--text-muted, #94a3b8);
  stroke: var(--text-muted, #94a3b8);
  stroke-width: 2;
}
.trie-viz-node-root .trie-viz-label {
  display: none;
}

.trie-viz-node-internal .trie-viz-circle {
  fill: var(--bg, #fff);
  stroke: var(--accent, #0d9488);
  stroke-width: 2.5;
}
.trie-viz-node-internal .trie-viz-label {
  fill: var(--text, #0f172a);
  font-family: var(--font-mono, 'SF Mono', 'Fira Code', monospace);
  font-size: 16px;
  font-weight: 700;
}

.trie-viz-node-terminal .trie-viz-circle {
  fill: var(--accent, #0d9488);
  stroke: var(--accent, #0d9488);
  stroke-width: 2.5;
}
.trie-viz-node-terminal .trie-viz-label {
  fill: #fff;
  font-family: var(--font-mono, 'SF Mono', 'Fira Code', monospace);
  font-size: 16px;
  font-weight: 700;
}

/* Subtle ring on terminal nodes */
.trie-viz-node-terminal .trie-viz-ring {
  fill: none;
  stroke: var(--accent, #0d9488);
  stroke-width: 2;
  opacity: 0.3;
}

/* Highlight state (for search path visualization) */
.trie-viz-node-highlight .trie-viz-circle {
  stroke: var(--accent-secondary, #f97316);
  stroke-width: 3.5;
}
.trie-viz-link-highlight {
  stroke: var(--accent-secondary, #f97316) !important;
  stroke-width: 3.5 !important;
}
`,V=!1;function R(){if(V)return;let a=document.createElement("style");a.textContent=j,document.head.appendChild(a),V=!0}var M=class{constructor(r,e){this.nodeRadius=20;this.rootRadius=10;this.padding=36;R(),this.nodeSpacing=e?.nodeSpacing??56,this.levelHeight=e?.levelHeight??72,this.duration=e?.duration??400,this.maxHeight=e?.maxHeight??600,this.svg=L(r).append("svg").attr("class","trie-viz-svg").attr("preserveAspectRatio","xMidYMin meet").attr("width","100%");let n=this.svg.append("g").attr("class","trie-viz-content");this.linkGroup=n.append("g").attr("class","trie-viz-links"),this.nodeGroup=n.append("g").attr("class","trie-viz-nodes");let i=getComputedStyle(document.documentElement);this.colors={accent:i.getPropertyValue("--accent").trim()||"#d94040",bg:i.getPropertyValue("--bg").trim()||"#ffffff",text:i.getPropertyValue("--text").trim()||"#1e2a3a",textMuted:i.getPropertyValue("--text-muted").trim()||"#8899aa",border:i.getPropertyValue("--border").trim()||"#d0d8e4"}}update(r){let e=C(r);N().nodeSize([this.nodeSpacing,this.levelHeight])(e);let i=0,v=0,h=0;e.each(t=>{let b=t;i=Math.min(i,b.x),v=Math.max(v,b.x),h=Math.max(h,b.y)});let l=this.padding+this.nodeRadius,k=v-i+2*l,f=h+2*l;this.svg.attr("viewBox",`${i-l} ${-l} ${k} ${f}`).attr("height",Math.min(f,this.maxHeight));let w=e.links(),p=G().x(t=>t.x).y(t=>t.y),x=this.linkGroup.selectAll(".trie-viz-link").data(w,t=>t.target.data.id);x.enter().append("path").attr("class","trie-viz-link").attr("d",p).attr("fill","none").attr("stroke",this.colors.border).attr("stroke-width",2.5).attr("stroke-linecap","round").attr("opacity",0).transition().duration(this.duration).attr("opacity",1),x.transition().duration(this.duration).attr("d",p),x.exit().transition().duration(this.duration/2).attr("opacity",0).remove();let y=e.descendants(),m=this.nodeGroup.selectAll(".trie-viz-node").data(y,t=>t.data.id),{accent:u,bg:z,text:H,textMuted:g,border:o}=this.colors,s=this.nodeRadius,d=this.rootRadius,c=this.duration,T=m.enter().append("g").attr("class",t=>$(t)).attr("transform",t=>`translate(${t.x},${t.y})`).attr("opacity",0);T.filter(t=>t.data.isTerminal).append("circle").attr("class","trie-viz-ring").attr("r",s+5).attr("fill","none").attr("stroke",u).attr("stroke-width",2).attr("opacity",.3),T.append("circle").attr("class","trie-viz-circle").attr("r",t=>t.data.id==="__root__"?d:s).attr("fill",t=>t.data.id==="__root__"?g:t.data.isTerminal?u:z).attr("stroke",t=>t.data.id==="__root__"?g:u).attr("stroke-width",t=>t.data.id==="__root__"?2:2.5),T.append("text").attr("class","trie-viz-label").attr("text-anchor","middle").attr("dy","0.35em").attr("fill",t=>t.data.isTerminal?"#fff":H).attr("font-family","'SF Mono', 'Fira Code', monospace").attr("font-size","16px").attr("font-weight","700").text(t=>t.data.char);let S=m.merge(T);S.attr("class",t=>$(t)).transition().duration(c).attr("opacity",1).attr("transform",t=>`translate(${t.x},${t.y})`),S.select(".trie-viz-circle").transition().duration(c).attr("r",t=>t.data.id==="__root__"?d:s).attr("fill",t=>t.data.id==="__root__"?g:t.data.isTerminal?u:z).attr("stroke",t=>t.data.id==="__root__"?g:u),S.select(".trie-viz-label").transition().duration(c).attr("fill",t=>t.data.isTerminal?"#fff":H),S.each(function(t){let b=L(this),I=!b.select(".trie-viz-ring").empty();t.data.isTerminal&&!I&&b.insert("circle",".trie-viz-circle").attr("class","trie-viz-ring").attr("r",s+5).attr("fill","none").attr("stroke",u).attr("stroke-width",2).attr("opacity",0).transition().duration(c).attr("opacity",.3)}),m.exit().transition().duration(c/2).attr("opacity",0).remove()}highlightPath(r){this.clearHighlights();let e=new Set,n="";e.add("__root__");for(let i of r)n+=i,e.add(n);this.nodeGroup.selectAll(".trie-viz-node").classed("trie-viz-node-highlight",i=>e.has(i.data.id)),this.linkGroup.selectAll(".trie-viz-link").classed("trie-viz-link-highlight",i=>e.has(i.target.data.id))}clearHighlights(){this.nodeGroup.selectAll(".trie-viz-node").classed("trie-viz-node-highlight",!1),this.linkGroup.selectAll(".trie-viz-link").classed("trie-viz-link-highlight",!1)}};function $(a){let r="trie-viz-node";return a.data.id==="__root__"?`${r} trie-viz-node-root`:a.data.isTerminal?`${r} trie-viz-node-terminal`:`${r} trie-viz-node-internal`}var F=`
.trie-explorer {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.trie-explorer-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.trie-explorer-input {
  flex: 1;
  min-width: 120px;
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
.trie-explorer-input:focus {
  border-color: var(--accent, #0d9488);
  box-shadow: 0 0 0 3px var(--accent-glow, rgba(13,148,136,0.1));
}

.trie-explorer-btn {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  border: 1px solid var(--border, #cbd5e1);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.trie-explorer-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.trie-explorer-btn-primary {
  background: var(--accent, #0d9488);
  color: #fff;
  border-color: var(--accent, #0d9488);
}
.trie-explorer-btn-primary:hover:not(:disabled) {
  background: var(--accent-hover, #0f766e);
  border-color: var(--accent-hover, #0f766e);
}

.trie-explorer-btn-secondary {
  background: transparent;
  color: var(--text-secondary, #475569);
}
.trie-explorer-btn-secondary:hover:not(:disabled) {
  background: var(--accent-glow, rgba(13,148,136,0.1));
  color: var(--text, #0f172a);
}

.trie-explorer-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 1rem;
  align-items: center;
}

.trie-explorer-examples-label {
  font-size: 0.8rem;
  color: var(--text-muted, #94a3b8);
  margin-right: 0.25rem;
}

.trie-explorer-chip {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.8rem;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  border: 1px solid var(--border, #cbd5e1);
  background: transparent;
  color: var(--text-secondary, #475569);
  cursor: pointer;
  transition: all 0.15s ease;
}
.trie-explorer-chip:hover {
  background: var(--accent-glow, rgba(13,148,136,0.1));
  border-color: var(--accent, #0d9488);
  color: var(--accent, #0d9488);
}
.trie-explorer-chip:disabled {
  opacity: 0.4;
  cursor: default;
}

.trie-explorer-viz {
  min-height: 80px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trie-explorer-empty {
  color: var(--text-muted, #94a3b8);
  font-style: italic;
  font-size: 0.9rem;
  padding: 2rem 0;
  text-align: center;
}

.trie-explorer-stats {
  border-top: 1px solid var(--border, #cbd5e1);
  padding-top: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
}

.trie-explorer-stat {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.trie-explorer-stat-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.trie-explorer-stat-value {
  font-family: var(--font-mono, monospace);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text, #0f172a);
}

.trie-explorer-stat-highlight {
  color: var(--accent, #0d9488);
}

.trie-explorer-words {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #475569);
}

.trie-explorer-words-list {
  font-family: var(--font-mono, monospace);
  color: var(--text, #0f172a);
}

.trie-explorer-feedback {
  font-size: 0.8rem;
  height: 1.2em;
  margin-bottom: 0.5rem;
  transition: opacity 0.2s ease;
}
.trie-explorer-feedback-ok {
  color: var(--accent, #0d9488);
}
.trie-explorer-feedback-dup {
  color: var(--accent-secondary, #f97316);
}
`,A=!1;function B(){if(A)return;let a=document.createElement("style");a.textContent=F,document.head.appendChild(a),A=!0}var P={"Cars & Cards":["cat","car","card","care","cart","cast"],"TH- words":["the","there","their","they","them","then"],"Tea & Top":["to","top","toy","tea","ten","team"],Code:["int","into","interface","internal","input"]};function q(a){return new Promise(r=>setTimeout(r,a))}function W(a){if(!a){console.error("trie-explorer: mount element not found");return}B();let r=new _,e=!1,n=Object.keys(P).map(o=>`<button class="trie-explorer-chip" data-example="${o}">${o}</button>`).join("");a.innerHTML=`
    <div class="trie-explorer">
      <div class="trie-explorer-controls">
        <input type="text" class="trie-explorer-input"
               placeholder="Type a word..." autocomplete="off" spellcheck="false">
        <button class="trie-explorer-btn trie-explorer-btn-primary" data-btn="add">Add</button>
        <button class="trie-explorer-btn trie-explorer-btn-secondary" data-btn="reset">Clear</button>
      </div>
      <div class="trie-explorer-examples">
        <span class="trie-explorer-examples-label">Examples:</span>
        ${n}
      </div>
      <div class="trie-explorer-feedback">&nbsp;</div>
      <div class="trie-explorer-viz"></div>
      <div class="trie-explorer-stats" style="display:none">
        <div class="trie-explorer-stat">
          <span class="trie-explorer-stat-label">Words</span>
          <span class="trie-explorer-stat-value" data-stat="words">0</span>
        </div>
        <div class="trie-explorer-stat">
          <span class="trie-explorer-stat-label">Nodes</span>
          <span class="trie-explorer-stat-value" data-stat="nodes">0</span>
        </div>
        <div class="trie-explorer-stat">
          <span class="trie-explorer-stat-label">Total characters</span>
          <span class="trie-explorer-stat-value" data-stat="chars">0</span>
        </div>
        <div class="trie-explorer-stat">
          <span class="trie-explorer-stat-label">Prefix savings</span>
          <span class="trie-explorer-stat-value trie-explorer-stat-highlight" data-stat="savings">\u2014</span>
        </div>
        <div class="trie-explorer-words">
          <span class="trie-explorer-words-list" data-stat="word-list"></span>
        </div>
      </div>
    </div>
  `;let i=a.querySelector(".trie-explorer-input"),v=a.querySelector('[data-btn="add"]'),h=a.querySelector('[data-btn="reset"]'),l=a.querySelector(".trie-explorer-viz"),k=a.querySelector(".trie-explorer-stats"),f=a.querySelector(".trie-explorer-feedback"),w=a.querySelectorAll(".trie-explorer-chip");l.innerHTML='<div class="trie-explorer-empty">Add a word to start building the trie</div>';let p=null;function x(){return p||(l.innerHTML="",p=new M(l)),p}function y(o,s){f.textContent=o,f.className=`trie-explorer-feedback trie-explorer-feedback-${s}`,setTimeout(()=>{f.innerHTML="&nbsp;"},2e3)}function m(){let o=r.wordCount;if(o===0){k.style.display="none";return}k.style.display="";let s=r.nodeCount-1,d=r.totalChars,c=d>0?Math.round((1-s/d)*100):0;a.querySelector('[data-stat="words"]').textContent=String(o),a.querySelector('[data-stat="nodes"]').textContent=String(s),a.querySelector('[data-stat="chars"]').textContent=String(d),a.querySelector('[data-stat="savings"]').textContent=c>0?`${c}%`:"\u2014",a.querySelector('[data-stat="word-list"]').textContent=r.getWords().join(", ")}function u(o){let s=o.trim().toLowerCase();if(!s)return!1;let d=r.insert(s);return d?(x().update(r.toHierarchy()),m(),y(`Added "${s}"`,"ok")):y(`"${s}" already in trie`,"dup"),d}function z(){r.clear(),p&&(l.innerHTML="",p=null),l.innerHTML='<div class="trie-explorer-empty">Add a word to start building the trie</div>',m(),f.innerHTML="&nbsp;",i.value="",i.focus()}async function H(o){let s=P[o];if(!(!s||e)){e=!0,g(!1),r.clear(),p&&(l.innerHTML="",p=null),f.innerHTML="&nbsp;",m();for(let d=0;d<s.length;d++){await q(d===0?200:500);let c=s[d];i.value=c,r.insert(c),x().update(r.toHierarchy()),m(),y(`Added "${c}"`,"ok")}await q(300),i.value="",e=!1,g(!0),i.focus()}}function g(o){i.disabled=!o,v.disabled=!o,h.disabled=!o,w.forEach(s=>s.disabled=!o)}v.addEventListener("click",()=>{u(i.value),i.value="",i.focus()}),i.addEventListener("keydown",o=>{o.key==="Enter"&&(u(i.value),i.value="")}),h.addEventListener("click",z);for(let o of w)o.addEventListener("click",()=>{let s=o.dataset.example||"";H(s)})}export{W as mount};
