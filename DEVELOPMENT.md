# tristancode.com — Development Notes

Developer documentation for the tristancode.com Hugo site. This captures architectural decisions, theme assignments, and ideas for future work.

## Quick Start

```bash
# From the repo root
cd tristancode-workspace
../hugo server --port 1313
```

Open `http://localhost:1313` in a browser. Hugo live-reloads on file changes.

## Architecture

- **Static site generator**: Hugo (binary at repo root: `./hugo`)
- **Theme**: Custom theme at `themes/tristancode-theme/`
- **Content**: Markdown files in `content/blog/` and `content/projects/`
- **Static assets**: `static/images/charts/` (blog chart PNGs), `static/drinky_cab/` (legacy interactive project)

### Directory Layout

```
tristancode-workspace/
├── hugo.toml                  # Site config
├── content/
│   ├── blog/
│   │   ├── _index.md          # Blog section page
│   │   ├── fixed-income-risk-part1-*.md
│   │   ├── fixed-income-risk-part2-*.md
│   │   ├── fixed-income-risk-part3-*.md
│   │   ├── fixed-income-risk-part4-*.md
│   │   ├── writing-dsls-python-scala.md
│   │   └── beaconspec-hulu-dsl-data-pipeline.md
│   └── projects/
│       ├── _index.md           # Projects section page
│       └── drinky-cab.md
├── static/
│   ├── images/charts/          # 15 PNG charts for the finance series
│   └── drinky_cab/             # Full legacy Drinky Cab interactive project
└── themes/tristancode-theme/
    ├── layouts/
    │   ├── _default/baseof.html   # Base template (theme switcher, generative JS)
    │   ├── _default/list.html     # Section list pages
    │   ├── _default/single.html   # Individual post/project pages
    │   ├── index.html             # Homepage
    │   └── partials/              # header.html, footer.html
    └── static/css/
        ├── style-graph.css        # Graph Paper theme
        ├── style-generative.css   # Generative / Data Art theme
        └── style-hulu.css         # Hulu / Pipeline theme
```

## Theme System

The site supports multiple visual themes. Each theme is a standalone CSS file that controls colors, typography, backgrounds, and layout nuances.

### Available Themes

| Theme ID | CSS File | Vibe | Key Visual |
|---|---|---|---|
| `graph` | `style-graph.css` | Notebook / technical | CSS grid-paper background, monospace headings, dashed borders |
| `generative` | `style-generative.css` | Data art / modern | JS-generated SVG (dots, curves, node network), purple accent, glow hover |
| `hulu` | `style-hulu.css` | Bold / streaming | Diagonal data-stream lines in green, terminal-style code blocks, green accents |

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
| Fixed-income risk series (Parts 1–4) | `graph` | Finance / quantitative feel; graph paper suits charts and formulas |
| Writing DSLs in Python & Scala | `hulu` | Hulu connection — DSL work was done at Hulu |
| BeaconSpec / Hulu DSL post | `hulu` | Directly about Hulu's data pipeline |
| Drinky Cab project | `generative` | Data science / creative analysis project |
| Homepage | `generative` (default) | Picker available; user can switch freely |
| Blog list | `generative` (default) | Picker available |

### How It Works (baseof.html)

1. **Server-side**: Hugo outputs `pageSkin` from `.Params.skin` into a `<script>` block
2. **Before render**: A blocking `<script>` in `<head>` sets the correct stylesheet link immediately (prevents flash of wrong theme)
3. **Client-side**: The theme picker (bottom-right circles) lets users switch between themes on pages without a fixed skin. Choice persists in `localStorage` under `site-skin`
4. **Generative JS**: Only runs when `currentSkin === 'generative'`; generates SVG dots, curves, rings, and a node-network graph

### Dark / Light Mode

All themes support both modes. The toggle in the header sets `data-theme="dark"` on `<html>` and persists to `localStorage`. CSS custom properties handle the color swap.

## Content Conventions

### Blog Posts

- **No dates, tags, or series navigation** — the site is intentionally minimalist and "timeless"
- `series` field is kept in front matter for potential future use but not rendered
- `weight` field controls ordering within a series
- Image paths use `/images/charts/filename.png` (Hugo absolute path from static root)
- Inter-post links use Hugo permalinks: `/blog/post-slug/`

### Projects

- The Drinky Cab project lives as static HTML/JS/CSS in `static/drinky_cab/`
- Its Markdown page (`content/projects/drinky-cab.md`) provides a description and links into the interactive components
- Interactive maps use Leaflet 0.7.7 via unpkg CDN
- Map tiles use OpenStreetMap (migrated from defunct OpenCycleMap)

## Important: Links and baseURL

`hugo.toml` sets `baseURL = 'https://tristancode.com/'` for production. All templates use `.RelPermalink` (not `.Permalink`) so that links are relative paths like `/blog/post-slug/` rather than absolute URLs like `https://tristancode.com/blog/post-slug/`. This ensures links work correctly both in local development (`hugo server`) and in production.

If you ever add a new template, always use `.RelPermalink` for internal links.

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
- [ ] Break the Drinky Cab project into a blog post series (data acquisition, geographic analysis, statistical modeling, visualization)
- [ ] Write a "making of this site" post covering the theme system and Hugo migration
- [ ] Add more interactive projects / tools / visualizations / games
- [ ] Consider adding a lightweight comment system (e.g. giscus, utterances) for blog posts

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

### Design & Theming
- [ ] Animate the generative SVG background subtly (slow drift, breathing opacity)
- [ ] Add theme-specific favicon / meta-theme-color
- [ ] Consider a print stylesheet for blog posts
- [ ] Experiment with code block copy-to-clipboard buttons
- [ ] Add a "reading progress" bar on long posts (optional, minimalist)
- [ ] Experiment with translucent content backdrop over background patterns (attempted, CSS stacking made it difficult — may revisit with a different approach)

### Technical
- [ ] Set up deployment pipeline (FTP sync to Network Solutions, or migrate to Netlify/Vercel/Cloudflare Pages)
- [ ] Add `robots.txt` and sitemap
- [ ] Add Open Graph / Twitter Card meta tags for social sharing
- [ ] Consider Hugo Modules for future dependency management
- [ ] Add a 404 page
- [ ] Image optimization (WebP conversion, lazy loading)
- [ ] Evaluate moving from Hugo syntax highlighting to a client-side highlighter for more language support

### Code Quality
- [ ] Extract shared CSS (reset, layout, typography) into a base file imported by each theme
- [ ] Move generative JS into a standalone file instead of inline in baseof.html
- [ ] Add CSS custom property documentation / design tokens reference
