import{a as G}from"./chunk-X6ICKQ43.js";import{e as L,g as E,h as _,m as C}from"./chunk-37DNFNR4.js";var j=`
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
`,V=!1;function R(){if(V)return;let r=document.createElement("style");r.textContent=j,document.head.appendChild(r),V=!0}var M=class{constructor(i,n){this.nodeRadius=20;this.rootRadius=10;this.padding=36;R(),this.nodeSpacing=n?.nodeSpacing??56,this.levelHeight=n?.levelHeight??72,this.duration=n?.duration??400,this.maxHeight=n?.maxHeight??600,this.svg=L(i).append("svg").attr("class","trie-viz-svg").attr("preserveAspectRatio","xMidYMin meet").attr("width","100%");let u=this.svg.append("g").attr("class","trie-viz-content");this.linkGroup=u.append("g").attr("class","trie-viz-links"),this.nodeGroup=u.append("g").attr("class","trie-viz-nodes");let t=getComputedStyle(document.documentElement);this.colors={accent:t.getPropertyValue("--accent").trim()||"#d94040",bg:t.getPropertyValue("--bg").trim()||"#ffffff",text:t.getPropertyValue("--text").trim()||"#1e2a3a",textMuted:t.getPropertyValue("--text-muted").trim()||"#8899aa",border:t.getPropertyValue("--border").trim()||"#d0d8e4"}}update(i){let n=E(i);_().nodeSize([this.nodeSpacing,this.levelHeight])(n);let t=0,h=0,x=0;n.each(e=>{let b=e;t=Math.min(t,b.x),h=Math.max(h,b.x),x=Math.max(x,b.y)});let d=this.padding+this.nodeRadius,k=h-t+2*d,m=x+2*d;this.svg.attr("viewBox",`${t-d} ${-d} ${k} ${m}`).attr("height",Math.min(m,this.maxHeight));let z=n.links(),c=C().x(e=>e.x).y(e=>e.y),g=this.linkGroup.selectAll(".trie-viz-link").data(z,e=>e.target.data.id);g.enter().append("path").attr("class","trie-viz-link").attr("d",c).attr("fill","none").attr("stroke",this.colors.border).attr("stroke-width",2.5).attr("stroke-linecap","round").attr("opacity",0).transition().duration(this.duration).attr("opacity",1),g.transition().duration(this.duration).attr("d",c),g.exit().transition().duration(this.duration/2).attr("opacity",0).remove();let y=n.descendants(),v=this.nodeGroup.selectAll(".trie-viz-node").data(y,e=>e.data.id),{accent:p,bg:w,text:H,textMuted:f,border:a}=this.colors,o=this.nodeRadius,s=this.rootRadius,l=this.duration,T=v.enter().append("g").attr("class",e=>$(e)).attr("transform",e=>`translate(${e.x},${e.y})`).attr("opacity",0);T.filter(e=>e.data.isTerminal).append("circle").attr("class","trie-viz-ring").attr("r",o+5).attr("fill","none").attr("stroke",p).attr("stroke-width",2).attr("opacity",.3),T.append("circle").attr("class","trie-viz-circle").attr("r",e=>e.data.id==="__root__"?s:o).attr("fill",e=>e.data.id==="__root__"?f:e.data.isTerminal?p:w).attr("stroke",e=>e.data.id==="__root__"?f:p).attr("stroke-width",e=>e.data.id==="__root__"?2:2.5),T.append("text").attr("class","trie-viz-label").attr("text-anchor","middle").attr("dy","0.35em").attr("fill",e=>e.data.isTerminal?"#fff":H).attr("font-family","'SF Mono', 'Fira Code', monospace").attr("font-size","16px").attr("font-weight","700").text(e=>e.data.char);let S=v.merge(T);S.attr("class",e=>$(e)).transition().duration(l).attr("opacity",1).attr("transform",e=>`translate(${e.x},${e.y})`),S.select(".trie-viz-circle").transition().duration(l).attr("r",e=>e.data.id==="__root__"?s:o).attr("fill",e=>e.data.id==="__root__"?f:e.data.isTerminal?p:w).attr("stroke",e=>e.data.id==="__root__"?f:p),S.select(".trie-viz-label").transition().duration(l).attr("fill",e=>e.data.isTerminal?"#fff":H),S.each(function(e){let b=L(this),q=!b.select(".trie-viz-ring").empty();e.data.isTerminal&&!q&&b.insert("circle",".trie-viz-circle").attr("class","trie-viz-ring").attr("r",o+5).attr("fill","none").attr("stroke",p).attr("stroke-width",2).attr("opacity",0).transition().duration(l).attr("opacity",.3)}),v.exit().transition().duration(l/2).attr("opacity",0).remove()}highlightPath(i){this.clearHighlights();let n=new Set,u="";n.add("__root__");for(let t of i)u+=t,n.add(u);this.nodeGroup.selectAll(".trie-viz-node").classed("trie-viz-node-highlight",t=>n.has(t.data.id)),this.linkGroup.selectAll(".trie-viz-link").classed("trie-viz-link-highlight",t=>n.has(t.target.data.id))}clearHighlights(){this.nodeGroup.selectAll(".trie-viz-node").classed("trie-viz-node-highlight",!1),this.linkGroup.selectAll(".trie-viz-link").classed("trie-viz-link-highlight",!1)}};function $(r){let i="trie-viz-node";return r.data.id==="__root__"?`${i} trie-viz-node-root`:r.data.isTerminal?`${i} trie-viz-node-terminal`:`${i} trie-viz-node-internal`}var F=`
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
`,A=!1;function B(){if(A)return;let r=document.createElement("style");r.textContent=F,document.head.appendChild(r),A=!0}var N={"Cars & Cards":["cat","car","card","care","cart","cast"],"TH- words":["the","there","their","they","them","then"],"Tea & Top":["to","top","toy","tea","ten","team"],Code:["int","into","interface","internal","input"]};function P(r){return new Promise(i=>setTimeout(i,r))}function I(r){if(!r){console.error("trie-explorer: mount element not found");return}B();let i=new G,n=!1,u=Object.keys(N).map(a=>`<button class="trie-explorer-chip" data-example="${a}">${a}</button>`).join("");r.innerHTML=`
    <div class="trie-explorer">
      <div class="trie-explorer-controls">
        <input type="text" class="trie-explorer-input"
               placeholder="Type a word..." autocomplete="off" spellcheck="false">
        <button class="trie-explorer-btn trie-explorer-btn-primary" data-btn="add">Add</button>
        <button class="trie-explorer-btn trie-explorer-btn-secondary" data-btn="reset">Clear</button>
      </div>
      <div class="trie-explorer-examples">
        <span class="trie-explorer-examples-label">Examples:</span>
        ${u}
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
  `;let t=r.querySelector(".trie-explorer-input"),h=r.querySelector('[data-btn="add"]'),x=r.querySelector('[data-btn="reset"]'),d=r.querySelector(".trie-explorer-viz"),k=r.querySelector(".trie-explorer-stats"),m=r.querySelector(".trie-explorer-feedback"),z=r.querySelectorAll(".trie-explorer-chip");d.innerHTML='<div class="trie-explorer-empty">Add a word to start building the trie</div>';let c=null;function g(){return c||(d.innerHTML="",c=new M(d)),c}function y(a,o){m.textContent=a,m.className=`trie-explorer-feedback trie-explorer-feedback-${o}`,setTimeout(()=>{m.innerHTML="&nbsp;"},2e3)}function v(){let a=i.wordCount;if(a===0){k.style.display="none";return}k.style.display="";let o=i.nodeCount-1,s=i.totalChars,l=s>0?Math.round((1-o/s)*100):0;r.querySelector('[data-stat="words"]').textContent=String(a),r.querySelector('[data-stat="nodes"]').textContent=String(o),r.querySelector('[data-stat="chars"]').textContent=String(s),r.querySelector('[data-stat="savings"]').textContent=l>0?`${l}%`:"\u2014",r.querySelector('[data-stat="word-list"]').textContent=i.getWords().join(", ")}function p(a){let o=a.trim().toLowerCase();if(!o)return!1;let s=i.insert(o);return s?(g().update(i.toHierarchy()),v(),y(`Added "${o}"`,"ok")):y(`"${o}" already in trie`,"dup"),s}function w(){i.clear(),c&&(d.innerHTML="",c=null),d.innerHTML='<div class="trie-explorer-empty">Add a word to start building the trie</div>',v(),m.innerHTML="&nbsp;",t.value="",t.focus()}async function H(a){let o=N[a];if(!(!o||n)){n=!0,f(!1),i.clear(),c&&(d.innerHTML="",c=null),m.innerHTML="&nbsp;",v();for(let s=0;s<o.length;s++){await P(s===0?200:500);let l=o[s];t.value=l,i.insert(l),g().update(i.toHierarchy()),v(),y(`Added "${l}"`,"ok")}await P(300),t.value="",n=!1,f(!0),t.focus()}}function f(a){t.disabled=!a,h.disabled=!a,x.disabled=!a,z.forEach(o=>o.disabled=!a)}h.addEventListener("click",()=>{p(t.value),t.value="",t.focus()}),t.addEventListener("keydown",a=>{a.key==="Enter"&&(p(t.value),t.value="")}),x.addEventListener("click",w);for(let a of z)a.addEventListener("click",()=>{let o=a.dataset.example||"";H(o)})}export{I as mount};
