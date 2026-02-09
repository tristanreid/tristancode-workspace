# tristancode.com

Personal website of Tristan Reid — blog posts, tools, visualizations, and other fun things.

Built with [Hugo](https://gohugo.io/) and a custom theme.

## Quick Start

```bash
hugo server --port 1313
```

Then open [http://localhost:1313](http://localhost:1313). Hugo live-reloads on file changes.

## What's Here

### Blog

- **Fixed-Income Risk Series** (4 parts) — Exploring treasury yields, PCA, GARCH volatility modeling, and duration/convexity through a quantitative lens.
- **Writing DSLs in Python & Scala** — Building domain-specific languages for data pipelines.
- **BeaconSpec** — A DSL for Hulu's data pipeline monitoring.

### Projects

- **Drinky Cab** — Interactive maps and data visualizations exploring NYC bar and taxi data using Leaflet.

## Theme System

The site ships with three visual themes, switchable via a floating picker:

| Theme | Vibe |
|---|---|
| **Graph** | Notebook / technical — grid-paper background, monospace headings |
| **Generative** | Data art / modern — JS-generated SVG backgrounds, purple accents |
| **Hulu** | Bold / streaming — diagonal data-stream lines, terminal-style code blocks |

Individual posts can lock to a specific theme via the `skin` front matter field. All themes support dark and light mode.

## Project Structure

```
├── hugo.toml                     # Site configuration
├── content/
│   ├── blog/                     # Blog posts (Markdown)
│   └── projects/                 # Project pages (Markdown)
├── static/
│   ├── images/charts/            # Chart PNGs for the finance series
│   └── drinky_cab/               # Legacy interactive Drinky Cab project
└── themes/tristancode-theme/
    ├── layouts/                   # Hugo templates
    └── static/css/                # Theme stylesheets
```

## License

Content and code are the personal work of Tristan Reid.
