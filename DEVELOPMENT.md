# tristancode.com — Development Notes

Developer documentation for the tristancode.com Hugo site. This captures architectural decisions, theme assignments, and ideas for future work.

## Quick Start

```bash
# Install Hugo if you haven't already
brew install hugo

# From the repo root
hugo server --port 1313
```

Open `http://localhost:1313` in a browser. Hugo live-reloads on file changes.

## Architecture

- **Static site generator**: Hugo (install via `brew install hugo`)
- **Theme**: Custom theme at `themes/tristancode-theme/`
- **Content**: Markdown files in `content/blog/` and `content/projects/`
- **Static assets**: `static/images/charts/` (blog chart PNGs), `static/drinky_cab/` (legacy interactive project), `static/js/` (built interactive components)
- **Interactive components**: TypeScript + D3 sources in `interactive/src/`, built to `static/js/`
- **Working notes**: Research and planning documents in `notes/`

### Directory Layout

```
tristancode-workspace/
├── hugo.toml                  # Site config
├── netlify.toml               # Netlify build settings
├── content/
│   ├── blog/
│   │   ├── _index.md          # Blog section page
│   │   ├── fixed-income-risk-*.md  # Fixed-income risk series (5 parts)
│   │   ├── drinky-cab-*.md    # Drinky Cab series (5 parts)
│   │   ├── hll-*.md           # HyperLogLog series (4 parts)
│   │   ├── hulu-pipeline-*.md # Hulu Pipeline series (7 new parts)
│   │   ├── writing-dsls-python-scala.md       # Hulu Pipeline part 3
│   │   └── beaconspec-hulu-dsl-data-pipeline.md  # Hulu Pipeline part 2
│   └── projects/
│       ├── _index.md           # Projects section page
│       └── drinky-cab.md       # Now points to the blog series
├── interactive/               # TypeScript interactive components
│   └── src/
│       ├── components/        # Component implementations (D3, vanilla TS)
│       ├── entries/           # Entry points (one per component)
│       └── hll-sim.ts         # HLL simulation engine (shared by components)
├── static/
│   ├── js/hll/                # Built interactive component bundles
│   ├── images/charts/         # 15 PNG charts for the finance series
│   └── drinky_cab/            # Full legacy Drinky Cab interactive project
├── notes/                     # Working notes and research for upcoming posts
│   ├── archive/               # Completed planning docs
│   ├── entity-detection-research.md
│   ├── mergeable-operations-research.md
│   └── neural-nets-research.md
└── themes/tristancode-theme/
    ├── layouts/
    │   ├── _default/baseof.html   # Base template (theme switcher, generative JS)
    │   ├── _default/list.html     # Section list pages
    │   ├── _default/single.html   # Individual post/project pages
    │   ├── index.html             # Homepage
    │   ├── shortcodes/interactive.html  # {{</* interactive component="name" */>}}
    │   └── partials/              # header.html, footer.html, series-nav.html
    └── static/css/
        ├── shared.css             # Shared reset, layout, typography
        ├── style-graph.css        # Graph Paper theme
        ├── style-generative.css   # Generative / Data Art theme
        ├── style-hulu.css         # Hulu / Pipeline theme
        ├── style-chalkboard.css   # Chalkboard / Whiteboard theme
        ├── style-theorem.css      # Theorem / LaTeX Paper theme
        ├── style-stochastic.css   # Stochastic / Data-Viz theme
        └── style-taxicab.css      # Taxicab / NYC theme
```

## Theme System

The site supports multiple visual themes. Each theme is a standalone CSS file that controls colors, typography, backgrounds, and layout nuances.

### Available Themes

| Theme ID | CSS File | Vibe | Key Visual |
|---|---|---|---|
| `graph` | `style-graph.css` | Notebook / technical | CSS grid-paper background, monospace headings, dashed borders |
| `generative` | `style-generative.css` | Data art / modern | JS-generated SVG (dots, curves, node network), purple accent, glow hover |
| `hulu` | `style-hulu.css` | Bold / streaming | Diagonal data-stream lines in green, terminal-style code blocks, green accents |
| `chalkboard` | `style-chalkboard.css` | Lecture hall / chalk | Handwritten headings (Caveat font), ruled lines; dark = slate-green chalkboard + chalk pastels, light = whiteboard + marker colors |
| `theorem` | `style-theorem.css` | Published paper / LaTeX | STIX Two Text serif typography, warm ivory paper, QED squares on blockquotes, asterism section breaks |
| `stochastic` | `style-stochastic.css` | Probability / data-viz | JS-generated SVG (scatter dots, bell curves, histograms, CDF S-curves), teal + orange palette |
| `taxicab` | `style-taxicab.css` | NYC taxi / Drinky Cab | JS-generated SVG cute taxicabs scattered at random positions, sizes, and angles; yellow + black palette |

### Per-Post Theme Assignment

Each blog post can specify its own theme via the `skin` front matter field:

```yaml
---
title: "My Post"
skin: graph
---
```

When a page has a `skin` value, it overrides the user's saved preference and the floating theme picker is hidden. Pages without a `skin` (like the homepage and section lists) use the saved preference or the default (`generative`).

### Current Assignments

| Content | Skin | Rationale |
|---|---|---|
| Fixed-income risk series (Parts 1–5) | `graph` | Finance / quantitative feel; graph paper suits charts and formulas |
| HyperLogLog series (Parts 1–4) | `stochastic` | Probability / data-viz theme matches the statistical content |
| Hulu Pipeline series (Parts 1–9) | `hulu` | Directly about Hulu's data pipeline |
| Tries series | `graph` | Data structure / technical content suits the graph-paper theme |
| Drinky Cab series | `taxicab` | NYC taxi theme with scattered SVG cabs — perfect match for the subject |
| Drinky Cab project page | `taxicab` | Matches the series skin |
| Writing Agent Skills series (Parts 1–2) | `generative` | Modern / AI-forward aesthetic fits the AI tooling subject matter |
| Homepage | `generative` (default) | Picker available; user can switch freely |
| Blog list | `generative` (default) | Picker available |

### How It Works (baseof.html)

1. **Server-side**: Hugo outputs `pageSkin` from `.Params.skin` into a `<script>` block
2. **Before render**: A blocking `<script>` in `<head>` sets the correct stylesheet link immediately (prevents flash of wrong theme)
3. **Client-side**: The theme picker (bottom-right circles) lets users switch between themes on pages without a fixed skin. Choice persists in `localStorage` under `site-skin`
4. **Generative JS**: Only runs when `currentSkin === 'generative'`; generates SVG dots, curves, rings, and a node-network graph
5. **Stochastic JS**: Only runs when `currentSkin === 'stochastic'`; generates SVG scatter dots, bell curves, histograms, CDF S-curves, and axis tick marks
6. **Taxicab JS**: Only runs when `currentSkin === 'taxicab'`; generates cute SVG taxicabs with body, cabin, windows, wheels, roof light, checker stripe, headlights/taillights

### Dark / Light Mode

All themes support both modes. The toggle in the header sets `data-theme="dark"` on `<html>` and persists to `localStorage`. CSS custom properties handle the color swap.

## Content Conventions

### Blog Posts

- **No dates or tags** — the site is intentionally minimalist and "timeless"
- `series` field groups posts into multi-part series (rendered in both list and single templates)
- `weight` field controls ordering within a series
- `draft: true` marks posts that are in progress (build with `hugo server --buildDrafts` to preview)
- Image paths use `/images/charts/filename.png` (Hugo absolute path from static root)
- Inter-post links use Hugo permalinks: `/blog/post-slug/`

### Series

Blog posts with a `series` front matter field are automatically grouped:

- **Blog list page** (`list.html`): Series are shown as headed sections with ordered post lists, followed by standalone posts
- **Homepage** (`index.html`): Series appear as single entries linking to the first post, with a "N-part series" label
- **Within posts** (`series-nav.html`): The existing series navigation partial shows all posts in the series with "← you are here"

Current series:

| Series | Posts | Skin | Status |
|---|---|---|---|
| Python for Fixed-Income Risk Analysis | 5 | `graph` | Published |
| HyperLogLog: Counting Unique Items the Clever Way | 4 | `stochastic` | Published |
| Hulu Pipeline | 9 | `hulu` | Published |
| Tries: Searching Text the Clever Way | 6 | `graph` | Published |
| Entity Detection: Finding What Matters in Text | 4 | `graph` | Published |
| Mergeable Operations in Distributed Computation | 3 | `graph` | Published |
| Drinky Cab | 5 | `taxicab` | Published |
| Writing Agent Skills | 2 | `generative` | Written |

### Projects

- The Drinky Cab project has been converted to a blog series; the project page now links to the series
- Static assets (HTML/JS/CSS/images) remain in `static/drinky_cab/` and are referenced directly from the blog posts
- Interactive maps use Leaflet 0.7.7 via unpkg CDN
- Map tiles use OpenStreetMap (migrated from defunct OpenCycleMap)

## Important: Links and baseURL

`hugo.toml` sets `baseURL = 'https://tristancode.com/'` for production. All templates use `.RelPermalink` (not `.Permalink`) so that links are relative paths like `/blog/post-slug/` rather than absolute URLs like `https://tristancode.com/blog/post-slug/`. This ensures links work correctly both in local development (`hugo server`) and in production.

If you ever add a new template, always use `.RelPermalink` for internal links.

## Deployment

The site is hosted on **Netlify** with automatic deploys from the `main` branch on GitHub.

- **Repo**: `tristanreid/tristancode-workspace` on GitHub
- **Build command**: `hugo --minify`
- **Publish directory**: `public/`
- **Hugo version**: Pinned in `netlify.toml` (currently 0.155.2)
- **Custom domain**: `tristancode.com` (DNS managed by Netlify)
- **HTTPS**: Automatic via Netlify's Let's Encrypt integration

### Deploy workflow

1. Push to `main` — Netlify auto-builds and deploys
2. Preview deploys are generated for pull requests

### Interactive components

The TypeScript interactive components (`interactive/src/`) are **pre-built and committed** to `static/js/hll/`. This avoids npm install issues on Netlify's build environment.

When editing interactive components locally:

```bash
cd interactive && npm run build
```

Then commit the updated JS files along with your source changes.

### Configuration files

- `netlify.toml` — Build settings, Hugo version, caching headers
- `hugo.toml` — Hugo configuration, base URL, menu, markup settings

### Previous hosting

Previously hosted on Network Solutions shared hosting, deployed via SFTP. Migrated to Netlify in February 2026 for free HTTPS, automatic deploys, and global CDN.

## Legacy Migration Notes

The original site at `repos/tristancode-ftp` (read-only) used:
- PHP with deprecated `mysql_*` functions
- Twitter Bootstrap 2.x
- jQuery 1.8.2
- Apache `.htaccess` routing

We preserved only the Drinky Cab project. Everything else was rebuilt from scratch in Hugo.

### Drinky Cab Asset Fixes

During migration, these changes were required:
- CSS/JS paths changed from `../css/` and `../js/` to co-located paths
- All CDN links updated from `http://` to `https://`
- Leaflet upgraded from custom CDN to `unpkg.com/leaflet@0.7.7`
- Map tiles changed from defunct `tile2.opencyclemap.org` to `tile.openstreetmap.org`
- Google Fonts import changed from `http://` to `https://`

## Roadmap

Multiple streams of work:

### Stream 1: Entity Resolution → Mergeable Operations

**Entity Resolution** (next up) — A series on dictionary-based entity detection: how it works, scoring and disambiguation, scaling with Tries in Spark, and moving from batch to real-time. Builds directly on the Trie series. Research in `notes/entity-detection-research.md`.

**Mergeable Operations** (follows Entity Resolution) — A "capstone" series tying together HLL, Tries, and Entity Resolution through the lens of mergeable/composable operations in distributed computation. Covers monoids, approximate data structures, and Algebird. Research in `notes/mergeable-operations-research.md`.

### Stream 2: Writing Agent Skills (written — ready for review)

A two-part series on writing Agent Skills for Cursor and Claude Code, using the Google Workspace skill as a real example. Covers the open standard, writing SKILL.md files, the shared library pattern, distribution with installers, the venv bootstrap pattern, credential protection, and working with Google APIs.

| # | Post | File | Status |
|---|------|------|--------|
| 1 | Giving Your AI a Google Account: Writing Agent Skills for Cursor and Claude Code | `agent-skills-giving-your-ai-a-google-account.md` | Written |
| 2 | Shipping a Skill: Installers, Bootstraps, and Google OAuth | `agent-skills-shipping-installers-bootstraps-oauth.md` | Written |

Skin: `generative`. Companion repo: `repos/google-workspace-skills/` (sanitized public version at [github.com/tristanreid/google-workspace-skills](https://github.com/tristanreid/google-workspace-skills) — not pushed yet).

### Stream 3: Neural Nets from Scratch (drafting phase — Parts 1–2 drafted)

A multi-part series from personal history through original experiments with small language models. Starts with the "Minds, Brains and Computers" seminar at Duke, builds simple nets from scratch, tours Karpathy's tutorials, then experiments with Mixture-of-Experts, chain-of-thought, and Toolformer-style tool use. Research in `notes/neural-nets-research.md`.

**Current status:**
- Part 1 (`neural-nets-origin-story.md`) — Draft complete
- Part 2 (`neural-nets-simpler-than-you-think.md`) — Draft complete, interactive `nn-playground` component built
- Parts 3–6 — Research complete, drafting not started

**Interactive components built:**
- `nn-engine.ts` — Reusable neural net engine (forward pass, backpropagation, configurable architecture)
- `nn-viz.ts` — Reusable D3 network visualizer (nodes, edges colored by weight, activation fill)
- `nn-playground` — Interactive widget: task selector (AND/OR/XOR), architecture selector (single neuron / hidden layer), live training with loss curve and truth table

**Completed:**
- Part 2 Python code verified — fixed addition example (switched from batch GD to stochastic SGD)
- Unit tests for `nn-engine.ts` — 16 tests (vitest), all passing
- Narrative plan written — `notes/neural-nets-narrative-plan.md`
- Skin decided — `chalkboard` (compared with `theorem`, chalkboard fits the personal/exploratory tone)

**Next step:**
- Draft Part 3 — "A Tour of Karpathy's Tutorials" (separate focused session; handoff in `notes/neural-nets-part3-handoff.md`)

---

## Future Ideas

### Content
- [x] Break the Drinky Cab project into a blog post series (5 parts: intro, mapping, taxi data, stumbling distance, results)
- [ ] Write a "making of this site" post covering the theme system and Hugo migration
- [ ] Add more interactive projects / tools / visualizations / games
- [ ] Consider adding a lightweight comment system (e.g. giscus, utterances) for blog posts

### Blog Series: Hulu Pipeline — Monitoring the Data Pipeline

A 9-part series expanding on the [Monitoring the Data Pipeline at Hulu](https://www.youtube.com/watch?v=VjXwoHUCvOQ) talk from Hadoop Summit 2014 ([slides](https://docs.google.com/presentation/d/1yETDcfD1IADBHgor0LDEjwqcDoGlt2Epdjlm0DajUrM/edit)). The two existing DSL posts become parts 2 and 3 of this series. Posts 1–6 form the main narrative arc; 7–9 are supplementary deep-dives.

| # | Post | File | Status |
|---|------|------|--------|
| 1 | 12,000 Events Per Second: Inside Hulu's Beacon Data Pipeline | `hulu-pipeline-12000-events-per-second.md` | Written |
| 2 | Why Hulu Built a DSL for Its Data Pipeline | `beaconspec-hulu-dsl-data-pipeline.md` | Existing (updated) |
| 3 | Building Your First DSL: Python & Scala | `writing-dsls-python-scala.md` | Existing (updated) |
| 4 | The Email Explosion: Why Monitoring Is Harder Than You Think | `hulu-pipeline-email-explosion-monitoring.md` | Written |
| 5 | Pattern Matching in Graphs: Introduction to Neo4j and Cypher | `hulu-pipeline-neo4j-cypher-graph-queries.md` | Written |
| 6 | Think Like a User: Graph-Based Troubleshooting | `hulu-pipeline-graph-troubleshooting.md` | Written |
| 7 | MVEL and User-Defined Jobs | `hulu-pipeline-mvel-user-jobs.md` | Written |
| 8 | The Reporting Layer: Self-Service Analytics | `hulu-pipeline-reporting-layer.md` | Written |
| 9 | From Batch to Stream: What 2014's Lessons Mean Today | `hulu-pipeline-batch-to-stream.md` | Written |

Skin: `hulu`. Full plan in `notes/archive/hulu-pipeline-series-plan.md`.

### Blog Series: Neural Nets from Scratch

A seven-part series on neural networks, starting from personal history and building toward original experiments with small language models. Unified by a "conditional computation under a budget" spine — each of Parts 4–7 explores a different routing decision. All experiments are CPU-first (no GPU required). makemore is the canonical codebase spine.

| # | Post | File | Status |
|---|------|------|--------|
| 1 | Minds, Brains and Computers | `neural-nets-origin-story.md` | Draft |
| 2 | Neural Nets Are Simpler Than You Think | `neural-nets-simpler-than-you-think.md` | Draft |
| 3 | A Tour of Karpathy's Tutorials | — | Research complete |
| 4 | Building a Mixture-of-Experts Model | — | Research complete |
| 5 | Adaptive Computation: Learning When to Think Harder | — | Research complete |
| 6 | The Economics of Tool Use | — | Research complete |
| 7 | Programs That Write Programs: Neuro-Symbolic Computing | — | NEW — needs research |

Skin: `chalkboard`. Research in `notes/neural-nets-research.md`. Narrative plan in `notes/neural-nets-narrative-plan.md`. Revised series plan (incorporating researcher feedback) in `notes/neural-nets-revised-series-plan.md`.

#### Part 1: Origin Story — "Minds, Brains and Computers"
- Personal memoir: took the seminar "Minds, Brains and Computers" at Duke as an undergrad
- Wrote neural nets in BASIC — the formative experience that inspired switching major from Cognitive Psychology to Computer Science
- Covers AI winters, connectionism, the disappointment of finding neural nets "unfashionable" in the CS curriculum

#### Part 2: Neural Nets Are Simpler Than You Think
- Builds a single neuron (AND gate), breaks it on XOR, fixes it with a hidden layer, teaches it arithmetic
- Interactive `nn-playground` component lets readers train live networks in the browser
- Demystifies the gap between "a neural net" and "an LLM"

#### Part 3: A Tour of Karpathy's Tutorials
- **Three conceptual deltas** (not a full survey): counting → learned model, MLP → stable deep training, local computation → attention
- makemore as the spine codebase; nanoGPT acknowledged as deprecated, nanochat as modern reference
- Establishes the baseline transformer that Parts 4–7 modify

#### Part 4: Building a Mixture-of-Experts Model *(in progress)*
- Implementation: `experiments/makemore/makemore_moe.py` — MoE-FFN as a drop-in replacement for the transformer FFN
- Dataset: `experiments/makemore/build_domain_mix.py` generates 24K examples across names/arithmetic/code
- Four experiments: dense baseline, MoE top-1 (with/without load balancing), MoE top-2
- Run script: `experiments/makemore/run_moe_experiments.sh` (~15-25 min on M-series Mac)
- Blog draft: `content/blog/neural-nets-mixture-of-experts.md` — structured with placeholder sections for experimental results
- Routing analysis: per-domain expert utilization breakdown (names vs. arithmetic vs. code)
- Key lesson: expert collapse without auxiliary loss, partial specialization with it

#### Part 5: Adaptive Computation: Learning When to Think Harder
- Reframed from "thinking" to adaptive computation / deliberation under budget (ACT, early-exit)
- **Algorithmic task suite** (parity, addition-with-carry, parenthesis matching) with variable difficulty
- Key plot: accuracy vs. measured compute — "more compute helps more on harder inputs"
- Test MoE + depth interaction: does the router allocate more compute to harder inputs?

#### Part 6: The Economics of Tool Use
- Updated premise: tool use is not niche — Toolformer, RAG, ReAct, Self-RAG are well-established
- **Toy calculator experiment** with `<CALL_TOOL>` / `<NO_TOOL>` policy token and cost term
- Simplified "dream state": compare no-tool vs. tool outputs, upweight divergences in training
- Routing unification: MoE + adaptive depth + tool use as three faces of "allocate your compute budget"

#### Part 7: Programs That Write Programs — Neuro-Symbolic Computing (NEW)
- DreamCoder: wake-sleep cycle combining neural networks with program synthesis
- Library learning: the system discovers reusable abstractions ("map," "fold") automatically
- Toy implementation on list-processing tasks — CPU-friendly (search-based, not gradient-based)
- The most fundamental routing question: when to use learned patterns vs. symbolic programs

### Blog Series: Tries — Searching Text the Clever Way

A 6-part series on the trie data structure, from intuition through production-scale usage. Features reusable D3 interactive trie visualizer and open-source packages. **Published.**

| # | Post | File | Status |
|---|------|------|--------|
| 1 | What Is a Trie? The Data Structure That Shares Its Homework | `trie-what-is-a-trie.md` | Published |
| 2 | Building an Interactive Trie Visualizer with D3 | `trie-visualizing-with-d3.md` | Published |
| 3 | Scanning Text with a Trie | `trie-scanning-text.md` | Published |
| 4 | Broadcasting a Trie in Spark | `trie-broadcasting-in-spark.md` | Published |
| 5 | Building a Trie-Powered Autocomplete with React | `trie-autocomplete-react.md` | Published |
| 6 | Shrinking the Trie for the Wire | `trie-shrinking-for-the-wire.md` | Published |

Skin: `graph`. Planning docs archived to `notes/archive/`.

**Open-source packages** (in `packages/`):
- `trie-match-python` → [github.com/tristanreid/trie-match-python](https://github.com/tristanreid/trie-match-python) — pip-installable, Spark-broadcast-friendly
- `trie-match-scala` → [github.com/tristanreid/trie-match-scala](https://github.com/tristanreid/trie-match-scala) — sbt/Maven, Spark broadcast + UDF
- `trie-viz` → [github.com/tristanreid/trie-viz](https://github.com/tristanreid/trie-viz) — D3 trie visualizer npm package
- `react-trie-autocomplete` → [github.com/tristanreid/react-trie-autocomplete](https://github.com/tristanreid/react-trie-autocomplete) — React autocomplete + packed radix trie (v0.2.0: `RadixTrie`, `packTrie`/`unpackTrie`, `src`/`packed` props, `triepack` CLI, server utilities)

### Blog Series: Entity Detection — Finding What Matters in Text

A 4-part series on dictionary-based entity detection: finding known entities in unstructured text, scoring matches for confidence, scaling with tries in Spark, and evolving from batch to real-time. Builds directly on the Trie series.

| # | Post | File | Status |
|---|------|------|--------|
| 1 | The "You" Problem — Why Entity Detection Is Harder Than Ctrl+F | `entity-detection-the-you-problem.md` | Written |
| 2 | Scoring Entity Matches — When Finding Isn't Enough | `entity-detection-scoring-matches.md` | Written |
| 3 | Entity Detection at Scale — The Broadcast Pattern | `entity-detection-at-scale.md` | Written |
| 4 | From Batch to Real-Time — Entity Detection in a Web App | `entity-detection-batch-to-realtime.md` | Written |

Skin: `graph`. Research in `notes/entity-detection-research.md`.

### Stream 4: ML Literacy for Developers (planning phase)

Multiple series aimed at software developers gaining AI/ML literacy. Three arcs planned, with Arc 1 most developed.

**Arc 1: Exploring High-Dimensional Data** — A 6-post series following the real workflow of making sense of large, high-dimensional datasets. Signature interactive: Three.js 3D data explorer. Primary dataset: IMDB/Rotten Tomatoes (entertainment data). Personal thread: learning word2vec at Hulu, training embedding models at Netflix.

| # | Post | Status |
|---|------|--------|
| 1 | What Embeddings Actually Are | Planning |
| 2 | First Contact: Statistics and Distributions | Planning |
| 3 | Projecting to See: PCA, t-SNE, UMAP | Planning |
| 4 | Building a 3D Data Explorer with Three.js | Planning |
| 5 | Making Sense of Clusters | Planning |
| 6 | Feature Engineering: Beyond the Embedding | Planning |

Skin: `stochastic` (likely). Tools: plotnine, scikit-learn, Three.js, sentence-transformers, networkx.

**Arc 2: Classical ML Demystified** — SVM, decision trees/forests/boosting, model evaluation. Code-heavy with scikit-learn and D3 interactive visualizations. Planning stage.

**Arc 3: How LLMs Actually Work** — In-context learning as Bayesian inference, plus other conceptual posts TBD. Less code, more insight. Early planning.

Full plan in `notes/ml-literacy-series-plan.md`.

### Blog Series: Elasticsearch — Lessons Learned & Open-Source Loader

Posts covering what I've learned working with Elasticsearch, including problem areas and operational pitfalls. Open-source the loader with alias support as a companion project.

### Blog Series: Mergeable Operations in Distributed Computation

A three-part "capstone" series tying together HLL, Tries, and Entity Detection through the lens of mergeable operations. The core idea: some operations can be split across machines, computed independently, and combined — and understanding which ones is the key to scalable computation.

| # | Post | File | Status |
|---|------|------|--------|
| 1 | Split, Process, Combine | `mergeable-operations-split-process-combine.md` | Written |
| 2 | Sketches: Trading Precision for Scalability | `mergeable-operations-sketches.md` | Written |
| 3 | When Abstract Algebra Becomes Practical | `mergeable-operations-algebird.md` | Written |

Skin: `graph`. Research in `notes/mergeable-operations-research.md`. Narrative plan in `notes/mergeable-operations-narrative-plan.md`.

#### Part 1: Split, Process, Combine
- Which operations survive distribution (sum, max) and which break (mean, median)
- The mean trick: carrying (sum, count) pairs to make non-mergeable operations mergeable
- Case studies: HLL merge, trie broadcast pattern, entity score aggregation
- The two rules: associativity and commutativity

#### Part 2: Sketches: Trading Precision for Scalability
- HLL, Count-Min Sketch, Bloom filters, T-Digest — four sketches, four merge operations
- The shared contract: fixed memory, bounded error, associative commutative merge
- T-Digest as the "carry more state" pattern taken to its logical extreme

#### Part 3: When Abstract Algebra Becomes Practical
- The reveal: everything in Parts 1-2 is a monoid
- Algebird and Scalding: define the merge, get distributed computation for free
- Personal experience with Algebird at scale — composability as an engineering tool
- The broader lesson: "is this a monoid?" is the most important question in distributed system design

### Design & Theming
- [ ] Animate the generative SVG background subtly (slow drift, breathing opacity)
- [ ] Add theme-specific favicon / meta-theme-color
- [ ] Consider a print stylesheet for blog posts
- [x] Experiment with code block copy-to-clipboard buttons
- [ ] Add a "reading progress" bar on long posts (optional, minimalist)
- [ ] Experiment with translucent content backdrop over background patterns (attempted, CSS stacking made it difficult — may revisit with a different approach)

### Technical
- [x] Set up deployment pipeline — migrated to Netlify with auto-deploy from GitHub
- [x] Add `robots.txt` and sitemap
- [x] Add Open Graph / Twitter Card meta tags for social sharing
- [ ] Consider Hugo Modules for future dependency management
- [x] Add a 404 page
- [x] Image optimization (lazy loading via render hook)
- [ ] Evaluate moving from Hugo syntax highlighting to a client-side highlighter for more language support

### Code Quality
- [x] Extract shared CSS (reset, layout, typography) into a base file imported by each theme (`css/shared.css`)
- [ ] Move generative JS into a standalone file instead of inline in baseof.html
- [ ] Add CSS custom property documentation / design tokens reference
