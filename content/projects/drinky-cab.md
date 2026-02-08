---
title: "Drinky Cab"
description: "Do drunk people tip taxi drivers better? A data investigation using 88.6M NYC taxi rides."
skin: generative
---

A data science investigation into the question: *do drunk people tip taxi drivers better?*

Using 174 million NYC taxi records (obtained via FOIL request), NY State liquor license data, and interactive geographic visualizations built with Leaflet.js, this project builds a "drinkiness" model based on pickup location and time, then looks for correlations with tipping behavior.

Along the way, it covers:

- **Interactive heatmaps** of liquor license concentration across NYC
- **Spatial analysis** using k-d trees for efficient nearest-neighbor lookups
- **Geographic anomaly detection** (JFK airport holds 47 liquor licenses in one building)
- **Custom distance norms** — "stumbling distance" via street-graph routing
- **Data cleaning at scale** — filtering 174M records down to 88.6M usable non-cash rides

The punchline: after all that work, drunk people tip about 0.06% *less* on average. But the distribution tells a more interesting story — drunk riders are more likely to leave *no tip at all* (3.10% vs 2.61%) and also more likely to leave an *exorbitant* tip (3.50% vs 3.37%). Extreme views.

**[View the interactive presentation →](/drinky_cab/index.html)**

The interactive maps are also available standalone:

- [Bar coverage map](/drinky_cab/nyc_bar_coverage.html) — circle overlays by license type
- [Heatmap](/drinky_cab/nyc_bar_heatmap.html) — weighted liquor license concentration
- [Cluster map](/drinky_cab/nyc_bar_clusters.html) — zoomable clusters with establishment details
- [Heatmap (no airports)](/drinky_cab/nyc_bar_heatmap_no_airports.html) — after removing JFK/harbor anomalies
