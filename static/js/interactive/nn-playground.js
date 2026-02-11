import{b as Y,e as T,f as A,j as C,l as B}from"./chunk-37DNFNR4.js";function U(a){return 1/(1+Math.exp(-Math.max(-500,Math.min(500,a))))}function W(a){return a*(1-a)}function _(a){return()=>{a|=0,a=a+1831565813|0;let t=Math.imul(a^a>>>15,1|a);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}var $={and:{name:"AND",inputs:[[0,0],[0,1],[1,0],[1,1]],targets:[[0],[0],[0],[1]]},or:{name:"OR",inputs:[[0,0],[0,1],[1,0],[1,1]],targets:[[0],[1],[1],[1]]},xor:{name:"XOR",inputs:[[0,0],[0,1],[1,0],[1,1]],targets:[[0],[1],[1],[0]]}},F=class{constructor(t,n=2,e=42){this.epoch=0;this.layerSizes=t,this.learningRate=n;let r=_(e);this.weights=[],this.biases=[];for(let i=0;i<t.length-1;i++){let c=t[i],l=t[i+1],h=Math.sqrt(2/(c+l)),s=[];for(let u=0;u<c;u++){let y=[];for(let x=0;x<l;x++)y.push((r()*2-1)*h);s.push(y)}this.weights.push(s);let o=[];for(let u=0;u<l;u++)o.push(0);this.biases.push(o)}}getEpoch(){return this.epoch}setLearningRate(t){this.learningRate=t}forward(t){let n=[t.slice()],e=t;for(let r=0;r<this.weights.length;r++){let i=this.weights[r],c=this.biases[r],l=[];for(let h=0;h<i[0].length;h++){let s=c[h];for(let o=0;o<e.length;o++)s+=e[o]*i[o][h];l.push(U(s))}n.push(l),e=l}return{activations:n,output:e}}trainStep(t,n){let e=t.length,r=this.weights.length,i=this.weights.map(s=>s.map(o=>o.map(()=>0))),c=this.biases.map(s=>s.map(()=>0)),l=0,h=[];for(let s=0;s<e;s++){let o=this.forward(t[s]);h.push(o);let u=o.output;for(let d=0;d<u.length;d++)l+=(n[s][d]-u[d])**2;let y=[],x=[];for(let d=0;d<u.length;d++)x.push((u[d]-n[s][d])*W(u[d]));y[r-1]=x;for(let d=r-2;d>=0;d--){let v=o.activations[d+1],w=y[d+1],f=this.weights[d+1],b=[];for(let k=0;k<v.length;k++){let R=0;for(let L=0;L<w.length;L++)R+=w[L]*f[k][L];b.push(R*W(v[k]))}y[d]=b}for(let d=0;d<r;d++){let v=o.activations[d],w=y[d];for(let f=0;f<v.length;f++)for(let b=0;b<w.length;b++)i[d][f][b]+=v[f]*w[b];for(let f=0;f<w.length;f++)c[d][f]+=w[f]}}for(let s=0;s<r;s++){for(let o=0;o<this.weights[s].length;o++)for(let u=0;u<this.weights[s][o].length;u++)this.weights[s][o][u]-=this.learningRate*(i[s][o][u]/e);for(let o=0;o<this.biases[s].length;o++)this.biases[s][o]-=this.learningRate*(c[s][o]/e)}return this.epoch++,{loss:l/e,forwards:h}}snapshot(){return{weights:this.weights.map(t=>t.map(n=>n.slice())),biases:this.biases.map(t=>t.slice()),layerSizes:this.layerSizes.slice()}}};var Q=`
.nn-viz-svg {
  display: block;
  margin: 0 auto;
  overflow: visible;
}

.nn-viz-edge {
  fill: none;
  stroke-linecap: round;
  transition: stroke 0.15s ease, stroke-width 0.15s ease, opacity 0.15s ease;
}

.nn-viz-node {
  transition: fill 0.15s ease, stroke 0.15s ease;
}

.nn-viz-label {
  font-family: var(--font-mono, 'SF Mono', 'Fira Code', monospace);
  font-weight: 600;
  pointer-events: none;
  user-select: none;
}

.nn-viz-layer-label {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  fill: var(--text-muted, #94a3b8);
  text-anchor: middle;
}
`,D=!1;function Z(){if(D)return;let a=document.createElement("style");a.textContent=Q,document.head.appendChild(a),D=!0}var H=class{constructor(t,n){this.nodePositions=[];Z(),this.width=n?.width??400,this.height=n?.height??280,this.nodeRadius=n?.nodeRadius??18,this.paddingX=n?.paddingX??50,this.paddingY=n?.paddingY??40,this.showLabels=n?.showLabels??!0,this.duration=n?.duration??150,this.svg=T(t).append("svg").attr("class","nn-viz-svg").attr("width",this.width).attr("height",this.height).attr("viewBox",`0 0 ${this.width} ${this.height}`).attr("preserveAspectRatio","xMidYMid meet"),this.edgeGroup=this.svg.append("g").attr("class","nn-viz-edges"),this.nodeGroup=this.svg.append("g").attr("class","nn-viz-nodes"),this.labelGroup=this.svg.append("g").attr("class","nn-viz-labels");let e=getComputedStyle(document.documentElement);this.colors={accent:e.getPropertyValue("--accent").trim()||"#0d9488",bg:e.getPropertyValue("--bg").trim()||"#ffffff",text:e.getPropertyValue("--text").trim()||"#0f172a",textMuted:e.getPropertyValue("--text-muted").trim()||"#94a3b8",border:e.getPropertyValue("--border").trim()||"#cbd5e1"}}computePositions(t){let n=[],e=t.length,r=this.showLabels?20:0,i=this.width-2*this.paddingX,c=this.height-2*this.paddingY-r;for(let l=0;l<e;l++){let h=e===1?this.width/2:this.paddingX+l/(e-1)*i,s=t[l];for(let o=0;o<s;o++){let u=s===1?this.paddingY+r+c/2:this.paddingY+r+o/(s-1)*c;n.push({layer:l,index:o,x:h,y:u})}}return n}getNode(t,n){return this.nodePositions.find(e=>e.layer===t&&e.index===n)}init(t){this.nodePositions=this.computePositions(t.layerSizes),this.edgeGroup.selectAll("*").remove(),this.nodeGroup.selectAll("*").remove(),this.labelGroup.selectAll("*").remove();for(let n=0;n<t.weights.length;n++){let e=t.weights[n];for(let r=0;r<e.length;r++)for(let i=0;i<e[r].length;i++){let c=this.getNode(n,r),l=this.getNode(n+1,i);this.edgeGroup.append("line").attr("class","nn-viz-edge").attr("data-layer",n).attr("data-from",r).attr("data-to",i).attr("x1",c.x).attr("y1",c.y).attr("x2",l.x).attr("y2",l.y).attr("stroke",this.colors.border).attr("stroke-width",1).attr("opacity",.4)}}for(let n of this.nodePositions){let e=this.nodeGroup.append("g").attr("data-layer",n.layer).attr("data-index",n.index).attr("transform",`translate(${n.x},${n.y})`);e.append("circle").attr("class","nn-viz-node").attr("r",this.nodeRadius).attr("fill",this.colors.bg).attr("stroke",this.colors.border).attr("stroke-width",2),e.append("text").attr("class","nn-viz-label").attr("text-anchor","middle").attr("dy","0.35em").attr("font-size","12px").attr("fill",this.colors.textMuted).text("")}if(this.showLabels){let n=["Input",...t.layerSizes.slice(1,-1).map((e,r)=>`Hidden ${t.layerSizes.length>3?r+1:""}`).map(e=>e.trim()),"Output"];for(let e=0;e<t.layerSizes.length;e++){let r=this.getNode(e,0);this.labelGroup.append("text").attr("class","nn-viz-layer-label").attr("x",r.x).attr("y",this.paddingY-6).text(n[e])}}this.updateWeights(t)}updateWeights(t){let n=this.findMaxWeight(t);for(let e=0;e<t.weights.length;e++){let r=t.weights[e];for(let i=0;i<r.length;i++)for(let c=0;c<r[i].length;c++){let l=r[i][c],h=n>0?Math.abs(l)/n:0,s=l>=0?"#3b82f6":"#ef4444",o=.5+h*3.5,u=.15+h*.7;this.edgeGroup.select(`[data-layer="${e}"][data-from="${i}"][data-to="${c}"]`).attr("stroke",s).attr("stroke-width",o).attr("opacity",u)}}}updateActivations(t){for(let n of this.nodePositions){let e=this.nodeGroup.select(`[data-layer="${n.layer}"][data-index="${n.index}"]`);if(!t){e.select(".nn-viz-node").attr("fill",this.colors.bg).attr("stroke",this.colors.border),e.select(".nn-viz-label").text("");continue}let r=t[n.layer]?.[n.index]??0,i=A(this.colors.bg,this.colors.accent)(r),c=A(this.colors.border,this.colors.accent)(Math.min(r*1.5,1)),l=r>.55?"#fff":this.colors.text;e.select(".nn-viz-node").attr("fill",i).attr("stroke",c),e.select(".nn-viz-label").attr("fill",l).text(r.toFixed(2))}}findMaxWeight(t){let n=0;for(let e of t.weights)for(let r of e)for(let i of r)n=Math.max(n,Math.abs(i));return n}};var tt=`
.nn-playground {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.nn-playground-header {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.nn-playground-header label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  margin-right: 0.25rem;
}

.nn-playground-select {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.85rem;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border, #cbd5e1);
  background: var(--bg, #fff);
  color: var(--text, #0f172a);
  cursor: pointer;
}

.nn-playground-divider {
  width: 1px;
  height: 1.5rem;
  background: var(--border, #cbd5e1);
  margin: 0 0.25rem;
}

.nn-playground-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1rem;
}

@media (max-width: 600px) {
  .nn-playground-body {
    grid-template-columns: 1fr;
  }
}

.nn-playground-viz-container {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nn-playground-right {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.nn-playground-truth-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.nn-playground-truth-table th {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted, #94a3b8);
  padding: 0.35rem 0.5rem;
  text-align: center;
  border-bottom: 1px solid var(--border, #cbd5e1);
}

.nn-playground-truth-table td {
  font-family: var(--font-mono, monospace);
  font-size: 0.85rem;
  padding: 0.35rem 0.5rem;
  text-align: center;
  border-bottom: 1px solid var(--border, #cbd5e1);
}

.nn-playground-truth-table td.nn-pred {
  font-weight: 700;
}

.nn-playground-pred-good {
  color: var(--accent, #0d9488);
}

.nn-playground-pred-bad {
  color: #ef4444;
}

.nn-playground-pred-meh {
  color: #f59e0b;
}

.nn-playground-loss-container {
  height: 80px;
  position: relative;
}

.nn-playground-loss-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.nn-playground-loss-value {
  font-family: var(--font-mono, monospace);
  font-size: 0.8rem;
  color: var(--text-secondary, #475569);
  float: right;
}

.nn-playground-loss-svg {
  display: block;
  width: 100%;
  height: 60px;
}

.nn-playground-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.nn-playground-btn {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.45rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--border, #cbd5e1);
  cursor: pointer;
  transition: all 0.15s ease;
}
.nn-playground-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.nn-playground-btn-primary {
  background: var(--accent, #0d9488);
  color: #fff;
  border-color: var(--accent, #0d9488);
}
.nn-playground-btn-primary:hover:not(:disabled) {
  background: var(--accent-hover, #0f766e);
  border-color: var(--accent-hover, #0f766e);
}

.nn-playground-btn-secondary {
  background: transparent;
  color: var(--text-secondary, #475569);
}
.nn-playground-btn-secondary:hover:not(:disabled) {
  background: var(--accent-glow, rgba(13,148,136,0.1));
  color: var(--text, #0f172a);
}

.nn-playground-epoch {
  font-family: var(--font-mono, monospace);
  font-size: 0.8rem;
  color: var(--text-muted, #94a3b8);
  margin-left: auto;
}

.nn-playground-hint {
  font-size: 0.8rem;
  color: var(--text-muted, #94a3b8);
  font-style: italic;
  margin-top: 0.25rem;
}
`,O=!1;function et(){if(O)return;let a=document.createElement("style");a.textContent=tt,document.head.appendChild(a),O=!0}var j={single:{label:"1 neuron (no hidden layer)",layers:[2,1]},"hidden-4":{label:"4 hidden neurons",layers:[2,4,1]}};function X(a){return new F(a,2,42)}function nt(a){if(!a){console.error("nn-playground: mount element not found");return}et();let t={task:$.xor,architecture:j["hidden-4"].layers,engine:X(j["hidden-4"].layers),viz:null,lossHistory:[],playing:!1,animFrame:null,selectedSample:0};a.innerHTML=`
    <div class="nn-playground">
      <div class="nn-playground-header">
        <label>Task</label>
        <select class="nn-playground-select" data-control="task">
          <option value="and">AND</option>
          <option value="or">OR</option>
          <option value="xor" selected>XOR</option>
        </select>
        <div class="nn-playground-divider"></div>
        <label>Architecture</label>
        <select class="nn-playground-select" data-control="arch">
          <option value="single">No hidden layer</option>
          <option value="hidden-4" selected>4 hidden neurons</option>
        </select>
      </div>
      <div class="nn-playground-body">
        <div class="nn-playground-viz-container" data-el="viz"></div>
        <div class="nn-playground-right">
          <table class="nn-playground-truth-table">
            <thead>
              <tr><th>A</th><th>B</th><th>Expected</th><th>Prediction</th></tr>
            </thead>
            <tbody data-el="table-body"></tbody>
          </table>
          <div>
            <div class="nn-playground-loss-label">
              Loss
              <span class="nn-playground-loss-value" data-el="loss-value">\u2014</span>
            </div>
            <div class="nn-playground-loss-container" data-el="loss-chart"></div>
          </div>
        </div>
      </div>
      <div class="nn-playground-controls">
        <button class="nn-playground-btn nn-playground-btn-secondary" data-action="step">Step</button>
        <button class="nn-playground-btn nn-playground-btn-primary" data-action="play">Train</button>
        <button class="nn-playground-btn nn-playground-btn-secondary" data-action="reset">Reset</button>
        <span class="nn-playground-epoch" data-el="epoch">Epoch 0</span>
      </div>
      <div class="nn-playground-hint" data-el="hint">Click on a row in the truth table to see activations for that input.</div>
    </div>
  `;let n=a.querySelector('[data-el="viz"]'),e=a.querySelector('[data-el="table-body"]'),r=a.querySelector('[data-el="loss-chart"]'),i=a.querySelector('[data-el="loss-value"]'),c=a.querySelector('[data-el="epoch"]'),l=a.querySelector('[data-action="play"]'),h=a.querySelector('[data-action="step"]'),s=a.querySelector('[data-action="reset"]'),o=a.querySelector('[data-control="task"]'),u=a.querySelector('[data-control="arch"]'),y=T(r).append("svg").attr("class","nn-playground-loss-svg").attr("preserveAspectRatio","none"),x=y.append("path").attr("fill","none").attr("stroke","var(--accent, #0d9488)").attr("stroke-width",2);function d(){let p=t.lossHistory;if(p.length<2){x.attr("d","");return}let g=r.clientWidth||200,z=60;y.attr("viewBox",`0 0 ${g} ${z}`);let m=C().domain([0,p.length-1]).range([0,g]),S=C().domain([0,Math.max(.3,Y(p)??.3)]).range([z-2,2]),N=B().x((M,E)=>m(E)).y(M=>S(M));x.attr("d",N(p))}function v(p){let g=t.task,z="";for(let m=0;m<g.inputs.length;m++){let S=g.inputs[m],N=g.targets[m][0],M="\u2014",E="";if(p&&p[m]){let V=p[m].output[0];M=V.toFixed(4);let q=Math.abs(V-N);q<.15?E="nn-playground-pred-good":q<.35?E="nn-playground-pred-meh":E="nn-playground-pred-bad"}let K=m===t.selectedSample?' style="background: var(--accent-glow, rgba(13,148,136,0.08))"':"";z+=`<tr data-row="${m}"${K}>
        <td>${S[0]}</td>
        <td>${S[1]}</td>
        <td>${N}</td>
        <td class="nn-pred ${E}">${M}</td>
      </tr>`}e.innerHTML=z,e.querySelectorAll("tr").forEach(m=>{m.style.cursor="pointer",m.addEventListener("click",()=>{let S=parseInt(m.dataset.row??"0");t.selectedSample=S,b(),v(w())})})}function w(){return t.task.inputs.map(p=>t.engine.forward(p))}function f(){n.innerHTML="";let p=t.engine.snapshot(),g=Math.min(n.clientWidth||350,400);t.viz=new H(n,{width:g,height:240,nodeRadius:18,paddingX:45,paddingY:36}),t.viz.init(p)}function b(){if(!t.viz)return;let p=t.task.inputs[t.selectedSample],g=t.engine.forward(p);t.viz.updateActivations(g.activations)}function k(){let p=t.engine.trainStep(t.task.inputs,t.task.targets);return t.lossHistory.push(p.loss),p.forwards}function R(p){c.textContent=`Epoch ${t.engine.getEpoch()}`;let g=t.lossHistory[t.lossHistory.length-1];i.textContent=g!==void 0?g.toFixed(6):"\u2014",v(p),d(),t.viz&&(t.viz.updateWeights(t.engine.snapshot()),b())}function L(){let p=k();R(p)}function I(){if(t.playing)return;t.playing=!0,l.textContent="Pause";let p=10;function g(){if(!t.playing)return;let z=[];for(let S=0;S<p;S++)z=k();if(R(z),t.lossHistory[t.lossHistory.length-1]<1e-4||t.engine.getEpoch()>5e4){P();return}t.animFrame=requestAnimationFrame(g)}t.animFrame=requestAnimationFrame(g)}function P(){t.playing=!1,l.textContent="Train",t.animFrame!==null&&(cancelAnimationFrame(t.animFrame),t.animFrame=null)}function G(){P(),t.engine=X(t.architecture),t.lossHistory=[],t.selectedSample=0,f(),c.textContent="Epoch 0",i.textContent="\u2014",x.attr("d",""),v(null),b()}h.addEventListener("click",L),l.addEventListener("click",()=>{t.playing?P():I()}),s.addEventListener("click",G),o.addEventListener("change",()=>{t.task=$[o.value],G()}),u.addEventListener("change",()=>{t.architecture=j[u.value].layers,G()}),f(),v(null),b()}export{nt as mount};
