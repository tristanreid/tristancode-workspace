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
│   └── trie-data-structure-research.md
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
| Drinky Cab | 5 | `taxicab` | Published |
| HyperLogLog: Counting Unique Items the Clever Way | 4 | `stochastic` | Published |
| Hulu Pipeline | 9 | `hulu` | Published |
| Tries: Searching Text the Clever Way | 5 (4 written) | `graph` | In progress |

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

A multi-part series on neural networks, starting from personal history and building toward original experiments with small language models.

#### Part 1: Origin Story — "Minds, Brains and Computers"
- Personal significance: took the seminar "Minds, Brains and Computers" at Duke as an undergrad
- Wrote neural nets in BASIC — this was the experience that inspired switching major from Cognitive Psychology to Computer Science
- Set the stage: neural nets have been personally meaningful for decades, long before the current wave

#### Part 2: Neural Nets Are Simpler Than You Think
- Incredibly simple implementations from scratch
- Play around with teaching simple things, like basic arithmetic
- Key point for readers: when people say LLMs are "bad at math," it's not necessarily because of their underlying architecture — demonstrate that even small nets can learn arithmetic patterns
- Demystify the gap between "a neural net" and "an LLM"

#### Part 3: A Tour of Karpathy's Tutorials
- Walk through Andrej Karpathy's tutorials and his simple LLM implementations
- Establish these as the foundation for the experiments that follow
- Reproduce key results, annotate with personal observations

#### Part 4: Building a Mixture-of-Experts Model
- Starting from Karpathy's simple LLM, add a routing mechanism that dispatches to specialized "expert" sub-networks
- Explore: does specialization emerge naturally? Can you see different experts learning different domains?
- Keep it small and interpretable — the goal is understanding, not benchmark scores

#### Part 5: Adding "Thinking" — Chain-of-Thought from Architecture
- Build on the MoE model from Part 4
- Experiment with giving the model a mechanism for intermediate reasoning steps (internal scratchpad, recurrent passes, etc.)
- Can a small model learn to "think before answering"?
- Explore whether the expert routing from Part 4 interacts with thinking (e.g., does the model learn to route "hard" problems through more computation?)

#### Part 6+: Toolformer and the Economics of Tool Use
- Explore Toolformer and related ideas: models that learn to emit special tokens to invoke external tools (calculators, search, databases)
- Central question: tool-augmented lookup seems incredibly useful and scalable — why isn't this the dominant approach at major AI companies? Is this a Bitter Lesson situation where human curation of tool use is an inferior approach to just scaling up?
- Are there frameworks where the AI is somehow aware of its own computational costs and can weigh them against the cost of using a tool?
- Original idea to explore: a "dream" state with an adversarial process that tries to find cases where tool outputs differ from what the model would predict on its own. If the adversary can't find divergences, the model is discouraged from using the tool (since it already "knows" the answer). This naturally routes tool calls to cases where they actually add value, and favors whichever path (internal computation vs. tool) is cheaper for a given query.
- This connects back to the MoE/thinking work: tool use is essentially another form of routing — sending a sub-problem to an external expert

### Blog Series: Tries — Searching Text the Clever Way

A 6-part series on the trie data structure, from intuition through production-scale usage. Features reusable D3 interactive trie visualizer and open-source packages.

| # | Post | File | Status |
|---|------|------|--------|
| 1 | What Is a Trie? The Data Structure That Shares Its Homework | `trie-what-is-a-trie.md` | Written |
| 2 | Building an Interactive Trie Visualizer with D3 | `trie-visualizing-with-d3.md` | Written |
| 3 | Scanning Text with a Trie | `trie-scanning-text.md` | Written |
| 4 | Broadcasting a Trie in Spark | `trie-broadcasting-in-spark.md` | Written |
| 5 | Building a Trie-Powered Autocomplete with React | `trie-autocomplete-react.md` | Written |
| 6 | Shrinking the Trie for the Wire | `trie-shrinking-for-the-wire.md` | Written |

Skin: `graph`. Full plan in `notes/trie-series-plan.md`. Research in `notes/trie-data-structure-research.md`.

**Open-source packages** (in `packages/`):
- `trie-match-python` → [github.com/tristanreid/trie-match-python](https://github.com/tristanreid/trie-match-python) — pip-installable, Spark-broadcast-friendly
- `trie-match-scala` → [github.com/tristanreid/trie-match-scala](https://github.com/tristanreid/trie-match-scala) — sbt/Maven, Spark broadcast + UDF
- `trie-viz` → [github.com/tristanreid/trie-viz](https://github.com/tristanreid/trie-viz) — D3 trie visualizer npm package
- `react-trie-autocomplete` → [github.com/tristanreid/react-trie-autocomplete](https://github.com/tristanreid/react-trie-autocomplete) — React autocomplete + packed radix trie (v0.2.0: `RadixTrie`, `packTrie`/`unpackTrie`, `src`/`packed` props, `triepack` CLI, server utilities)

### Blog Series: Entity Resolution

Posts on entity resolution — how it works, why it's generally useful, and how the Trie data structure can be applied to make entity matching fast and memory-efficient at scale.

### Blog Series: Elasticsearch — Lessons Learned & Open-Source Loader

Posts covering what I've learned working with Elasticsearch, including problem areas and operational pitfalls. Open-source the loader with alias support as a companion project.

### Blog Post/Series: Mergeable Operations in Distributed Computation

An explainer (possibly multi-part) on **mergeable data structures** and why they matter for distributed systems. The core idea: some operations can be split across machines, computed independently, and combined — and understanding which ones is the key to scalable computation.

#### Key themes:
- **Map/Reduce intuition**: why "split, process, combine" is the fundamental pattern of distributed computation
- **What makes an operation mergeable**: associativity and commutativity — but explained through intuition, not abstract algebra. The goal is to make readers *feel* why `max(a, b)` is mergeable but `median(a, b)` isn't, without reaching for group theory
- **HyperLogLog as a case study**: the merge operation (element-wise max of registers) is trivially parallelizable — you can count unique visitors across 1,000 servers and combine the results with no coordination. Connect back to the HLL series
- **Tries as a case study**: another mergeable data structure — compact, serializable, and efficient to broadcast in Spark. Connect to the Trie series
- **Algebird and the Twitter/Scalding ecosystem**: Oscar Boykin's work on [Algebird](https://github.com/twitter/algebird) — a Scala library that provides abstract algebraic structures (monoids, groups, etc.) for aggregation in distributed systems. Used heavily with Scalding for MapReduce pipelines. Personal experience: worked with Algebird + Scalding and found it genuinely fascinating — the library makes the algebra *practical* rather than theoretical
- **Sketches and approximate data structures**: Count-Min Sketch, Bloom filters, HLL — all mergeable, all trading exactness for massive scalability
- **The broader lesson**: the most powerful data structures for big data aren't the ones that are most precise — they're the ones whose operations compose cleanly across machine boundaries

#### Tone:
- Accessible and intuitive, not academic. The reader should come away understanding *why* mergeability matters without needing an algebra textbook
- Use concrete examples: "imagine you have 100 servers each counting visitors..."
- Reference Algebird and abstract algebra as fascinating further reading, not as prerequisites

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
