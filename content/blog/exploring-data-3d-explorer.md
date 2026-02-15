---
title: "Building a 3D Data Explorer with Three.js"
description: "Take 10,000 movie review embeddings, project them to 3D with UMAP, and build an interactive tool to fly through your data. Color is the question; rotation is the answer."
weight: 40
series: "Exploring High-Dimensional Data"
series_weight: 90
skin: stochastic
draft: false
---

In [the last post](/blog/exploring-data-projecting-to-see/), we ended with a tease: 3D projections capture more structure than 2D, but static images of 3D data are deeply unsatisfying. You're looking at a shadow of a shadow, and you can't rotate to see what's behind the cluster in front.

This is the post where we fix that.

Below are our 10,000 IMDB review embeddings, projected to 3D with UMAP and colored by sentiment. Drag to rotate, use the +/− buttons (or pinch) to zoom, and hover any point to read the review.

{{< interactive component="data-explorer-3d" >}}

**A few things to try:**

1. **Switch to "Rating" coloring** and look for the gradient. The extreme ratings (1–2 and 9–10) occupy distinct territories, while the middle ratings are dispersed throughout.

2. **Zoom in on a cluster edge** and hover individual points. The boundary regions contain reviews that are genuinely ambivalent — they could plausibly go either way.

3. **Rotate to look "behind" a large cluster.** There's almost always smaller structure hidden behind the dominant groups. From the default viewpoint, you might see what looks like two clusters; rotate 90 degrees and it separates into four.

4. **Find the outliers.** Points floating far from any cluster are often anomalous — a review of the wrong movie, a list rather than prose, or a review in a language the embedding model handles differently.

---

## What the Structure Tells Us

After spending some time flying through the data, some patterns emerge:

**The sentiment separation is real but not absolute.** Positive and negative reviews form distinct regions, but there's a substantial mixing zone. This makes sense — many reviews are nuanced. A 6/10 review might praise the acting but criticize the plot. The embedding captures that complexity; it doesn't reduce to a simple positive/negative binary.

**Rating is a gradient, not a partition.** Color by rating and you'll see a smooth transition from one end to the other, not discrete clusters. This tells you something about what the embedding model learned: it captured intensity of sentiment, not just polarity.

**There are sub-clusters within sentiment groups.** Zoom in on the positive reviews and you'll find they're not uniform — there are pockets. Some of these correspond to genre (horror fans write differently from romance fans), some to writing style (formal critics vs. casual viewers), and some to the specific aspects being praised.

These are exactly the kind of patterns that are invisible in a 2D static plot and hard to quantify with aggregate statistics. The human visual system is remarkably good at spotting structure in 3D point clouds — we just need the right tools.

---

## Why 3D? Why Interactive?

A 2D projection of 768-dimensional data throws away a lot of structure. A 3D projection throws away slightly less. But the real argument for 3D isn't mathematical — it's perceptual. When you can rotate a 3D point cloud, you're effectively seeing it from *every* 2D viewpoint. Structure that's invisible from one angle reveals itself from another.

The problem with static 3D plots is that you're stuck with a single viewpoint chosen by the author. And 3D scatter plots in matplotlib or ggplot are famously hard to read — the depth cues are wrong, the occlusion is confusing, and you spend more time trying to parse the perspective than understanding the data.

Interactive 3D fixes all of this. You drag to rotate, zoom to get closer, and suddenly the data *makes sense* spatially. It's the difference between looking at a photograph of a sculpture and walking around it.

This is the tool I wished I had every time I was staring at a matplotlib scatter plot trying to figure out what was behind those overlapping clusters.

---

## Coloring as a Question-Asking Tool

Here's the insight that transforms a 3D scatter plot from a pretty picture into an actual analysis tool: **changing what the colors represent is the same as asking a different question about the same spatial arrangement.**

The spatial layout comes from UMAP — it captures the semantic relationships between reviews. Reviews that are near each other in 3D space have similar meaning. That structure doesn't change when you recolor.

But the *story* you see changes completely:

- **Color by sentiment** → "Do positive and negative reviews cluster together?" You'll see the answer immediately: there are distinct regions, but with significant overlap and a mixing zone in between.

- **Color by rating (1–10)** → "Is there a gradient?" The 1s and 10s are well-separated, but the middle ratings (4–7) blur together — which makes intuitive sense. The difference between a 5/10 and a 6/10 review is often just a matter of emphasis, not a fundamentally different opinion.

Each recoloring is a hypothesis test you can evaluate visually in half a second. In a traditional analysis, you'd compute cluster purity metrics and correlation coefficients. Here, you just rotate the data and look.

---

## How It's Built

Now let's look at how the explorer works under the hood. If you're a developer, this is the part you can adapt for your own data.

### Three.js in 60 Seconds

[Three.js](https://threejs.org/) is the standard 3D library for the web. If you've worked with D3 for 2D data visualization, the mental model is similar: you build a scene graph, bindable data, responsive to interaction — just with an extra dimension.

The minimum viable Three.js application has three pieces:

```typescript
import * as THREE from 'three';

// 1. Scene: the container for everything
const scene = new THREE.Scene();

// 2. Camera: your viewpoint into the scene
const camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 100);
camera.position.set(0, 0, 3);  // step back from the origin

// 3. Renderer: turns the scene into pixels
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

// Render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
```

That gives you a blank canvas. To make it interactive, Three.js provides `OrbitControls`:

```typescript
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;   // smooth inertia
controls.dampingFactor = 0.08;
controls.autoRotate = true;      // gentle spin until the user grabs it
controls.autoRotateSpeed = 0.5;
```

Drag to orbit, scroll (or pinch) to zoom, right-click to pan. The damping gives it a physical feel, like a globe on a stand.

### Rendering 10,000 Points

The naive approach — creating a separate 3D object for each review — works fine for 100 points but falls apart at 10,000. Each `Mesh` object means a separate draw call to the GPU, and draw calls are expensive.

The solution is `BufferGeometry` + `Points`: pack all 10,000 positions into a single typed array, send it to the GPU in one buffer, and let WebGL render them all in a single draw call.

```typescript
// positions: a Float32Array of [x,y,z, x,y,z, ...] for 10K points
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position',
  new THREE.Float32BufferAttribute(positions, 3));

// Colors: another buffer, one RGB triplet per point
const colors = new Float32Array(count * 3);
const colorAttr = new THREE.BufferAttribute(colors, 3);
geometry.setAttribute('pointColor', colorAttr);

const points = new THREE.Points(geometry, material);
scene.add(points);
```

This renders 10,000 points at 60fps with no perceptible lag. The same approach scales to 100K+ points before you need to start thinking about optimization.

### Custom Shaders for Better-Looking Points

The default `PointsMaterial` renders square pixels. For data visualization, we want round dots with soft edges — it makes the point cloud look less like a 1995 screensaver and more like a professional visualization.

A custom shader is surprisingly simple. The vertex shader positions each point and scales it:

```glsl
// vertex shader
attribute vec3 pointColor;
varying vec3 vColor;
uniform float uSize;
uniform float uScale;

void main() {
  vColor = pointColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float depth = clamp(-mv.z, 1.0, 10.0);
  gl_PointSize = uSize * uScale * (3.0 / depth);  // distance attenuation
  gl_Position = projectionMatrix * mv;
}
```

And the fragment shader turns each square point into a round disc with smooth edges:

```glsl
// fragment shader
varying vec3 vColor;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;              // clip to circle
  float alpha = smoothstep(0.5, 0.3, d);  // soft edge
  gl_FragColor = vec4(vColor, alpha * 0.8);
}
```

The `gl_PointCoord` is the position within each point's square (0 to 1 in x and y). We measure the distance from the center, discard anything outside the circle, and use `smoothstep` for anti-aliased edges. The slight transparency helps with depth perception when points overlap.

### Hover and Raycasting

Static visualizations show you the shape of the data. Interactive visualizations let you ask "what *is* that point?" Three.js includes a `Raycaster` that can identify which point in a `Points` geometry the mouse is near:

```typescript
const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.03;  // hover radius

function onPointerMove(event) {
  // Convert mouse position to normalized device coordinates
  mouse.x = (event.clientX / width)  *  2 - 1;
  mouse.y = (event.clientY / height) * -2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObject(points);

  if (hits.length > 0) {
    const index = hits[0].index;
    showTooltip(metadata[index], event.clientX, event.clientY);
  }
}
```

The raycaster fires a ray from the camera through the mouse position and checks which points it intersects. For 10,000 points, this is fast enough to run on every `pointermove` event without any spatial indexing tricks.

---

## The Full Pipeline

For reference, here's the complete stack from raw data to interactive visualization:

1. **Embeddings**: `sentence-transformers` with `all-mpnet-base-v2` → 768-dimensional vectors for each review
2. **Projection**: `umap-learn` with `n_components=3, n_neighbors=15, min_dist=0.1` → 3D coordinates
3. **Data export**: Normalize coordinates to [-1, 1], export as JSON with metadata (~2MB for 10K points)
4. **Rendering**: Three.js with `BufferGeometry` + custom shaders for round, anti-aliased points
5. **Interaction**: `OrbitControls` for camera, `Raycaster` for hover, +/− buttons for zoom
6. **Build**: esbuild bundles the TypeScript component to an ES module loaded by the blog post

The UMAP projection is pre-computed in Python and served as static JSON — running UMAP in the browser would work for smaller datasets, but 10K points with 768 dimensions takes about 30 seconds on a good machine, which is too long for a page load.

---

## Key Takeaways

1. **Interactive 3D exploration is worth the effort.** It reveals structure that no single 2D viewpoint can show, and it's fast enough for real analysis.

2. **BufferGeometry + Points** is the pattern for efficient point clouds in Three.js. One draw call for thousands of points.

3. **Custom shaders are more accessible than they seem.** A 10-line fragment shader is the difference between square pixels and professional-looking data visualization.

4. **Coloring is questioning.** The most powerful feature of an interactive explorer isn't the rotation — it's the ability to instantly recolor by a different variable and see how the spatial structure relates to different metadata.

5. **Human pattern recognition is a legitimate analysis tool** when paired with the right visualization. You can spot clusters, gradients, outliers, and sub-structure in seconds that would take pages of statistical tests to confirm.

---

## References

- [Three.js documentation](https://threejs.org/docs/) — The Scene, Camera, Renderer pattern
- [Three.js examples](https://threejs.org/examples/) — Particularly the Points/BufferGeometry examples
- [WebGL Shaders and GLSL](https://webglfundamentals.org/) — For understanding the vertex/fragment shader pipeline
- McInnes, Healy & Melville (2018) — ["UMAP: Uniform Manifold Approximation and Projection"](https://arxiv.org/abs/1802.03426) — The algorithm behind the 3D projection

---

*Previous: [Projecting to See — PCA, t-SNE, UMAP](/blog/exploring-data-projecting-to-see/)*

*Next: [Making Sense of Clusters](/blog/exploring-data-clustering/)*
