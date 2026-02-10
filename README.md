# tristancode.com

Personal website of Tristan Reid — blog posts, interactive visualizations, and explorations in data, code, and algorithms.

Built with [Hugo](https://gohugo.io/) and a custom multi-theme system. Hosted on [Netlify](https://www.netlify.com/).

## Quick Start

```bash
# Serve the site locally (live-reload on file changes)
hugo server --port 1313
```

Then open [http://localhost:1313](http://localhost:1313).

### Interactive Components

The site includes interactive TypeScript/D3 components embedded in blog posts. To develop these:

```bash
cd interactive
npm install        # first time only
npm run dev        # watch mode — rebuilds on change
npm run build      # production build (committed to static/js/)
npm test           # run tests
```

Built JS files are committed to `static/js/` so Netlify doesn't need to run npm during deploy.

## Blog Series

| Series | Parts | Skin | Topic |
|---|---|---|---|
| [Python for Fixed-Income Risk Analysis](content/blog/fixed-income-risk-exploring-treasury-yields.md) | 5 | `graph` | Treasury yields, PCA, GARCH volatility, duration & convexity |
| [Drinky Cab](content/blog/drinky-cab-88-million-taxi-rides.md) | 5 | `taxicab` | NYC bar and taxi data — mapping, spatial analysis, tipping |
| [HyperLogLog: Counting Unique Items the Clever Way](content/blog/hll-counting-unique-items-part1.md) | 4 | `stochastic` | The HLL algorithm from coin flips to a working implementation, with interactive visualizations |
| [Hulu Pipeline](content/blog/hulu-pipeline-12000-events-per-second.md) | 9 | `hulu` | Monitoring Hulu's data pipeline — DSLs, graph databases, troubleshooting at scale |

## Theme System

The site ships with seven visual themes. Each post can lock to a specific theme via the `skin` front matter field; pages without a skin show a floating picker for the reader to choose.

| Theme | Vibe |
|---|---|
| **Generative** | Data art / modern — JS-generated SVG backgrounds, purple accents |
| **Graph** | Notebook / technical — grid-paper background, monospace headings |
| **Hulu** | Bold / streaming — diagonal data-stream lines, terminal-style code blocks |
| **Chalkboard** | Lecture hall — handwritten headings (Caveat font), chalk/marker colors |
| **Theorem** | Published paper / LaTeX — STIX Two Text serif, warm ivory paper, QED squares |
| **Stochastic** | Probability / data-viz — scatter dots, bell curves, teal + orange palette |
| **Taxicab** | NYC taxi — JS-generated SVG taxicabs, yellow + black palette |

All themes support dark and light mode.

## Project Structure

```
tristancode-workspace/
├── hugo.toml                     # Site configuration
├── netlify.toml                  # Netlify build settings
├── content/
│   ├── blog/                     # Blog posts (Markdown + Hugo front matter)
│   └── projects/                 # Project pages
├── interactive/                  # TypeScript interactive components
│   └── src/
│       ├── components/           # Component implementations (D3, vanilla TS)
│       └── entries/              # Entry points (one per component)
├── static/
│   ├── js/                       # Built interactive component bundles
│   ├── images/charts/            # Chart PNGs for the finance series
│   └── drinky_cab/               # Legacy Drinky Cab interactive project
├── notes/                        # Working notes and research for upcoming posts
├── repos/                        # Reference codebases (read-only, not deployed)
└── themes/tristancode-theme/
    ├── layouts/                  # Hugo templates and shortcodes
    └── static/css/               # Theme stylesheets (one per theme + shared.css)
```

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed architecture notes, content conventions, theme system internals, deployment details, and the roadmap of planned content.

## License

Content and code are the personal work of Tristan Reid.
