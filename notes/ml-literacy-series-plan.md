# ML Literacy for Developers — Series Plan

## Origin and Context

This plan captures the brainstorming and design for a new set of blog series aimed at software developers who want to gain AI/ML literacy. The content emerged from a natural question: beyond the "Neural Nets from Scratch" series (which builds from first principles with PyTorch), what else do developers need to understand the ML landscape?

The answer is three distinct arcs:

1. **Exploring High-Dimensional Data** — A 6-post series following the real workflow of making sense of large, high-dimensional datasets. Three.js interactive 3D explorer as the signature piece. Primary dataset: entertainment data (IMDB/Rotten Tomatoes). Personal thread: learning word2vec at Hulu, training embedding models at Netflix, 13 years in entertainment tech.

2. **Classical ML Demystified** — A series on the algorithms that power most production ML (SVM, decision trees, random forests, gradient boosting, model evaluation). Code-heavy with scikit-learn and interactive D3 visualizations.

3. **How LLMs Actually Work** — A more conceptual series on the ideas behind modern language models, including in-context learning as Bayesian inference. Less code, more insight.

This document focuses primarily on Arc 1 (Exploring High-Dimensional Data), which is the most developed, with outline-level plans for Arcs 2 and 3.

---

## Arc 1: Exploring High-Dimensional Data

### The Big Idea: The Discovery Workflow

Most tutorials on dimensionality reduction show you the end result — a pretty UMAP plot with nice clusters — without the iterative discovery process that got there. This series follows the **actual workflow a developer would use** when confronted with a large, high-dimensional dataset and tasked with making sense of it.

The narrative spine: **You've been handed a large collection of documents with embeddings and metadata. Now what?** Each post is a step in the real workflow, and the reader builds up a toolkit incrementally.

The series arc:
- Post 1: Understand what embeddings are and why they matter
- Post 2: Get your bearings — statistics and distributions that work in high dimensions
- Post 3: Project to 2D/3D to see structure — PCA, t-SNE, UMAP
- Post 4: Build an interactive 3D explorer to fly through your data (the signature interactive piece)
- Post 5: Make sense of what you see — clustering, labeling, topic extraction
- Post 6: Go beyond the embedding — feature engineering with keywords, metadata, and graphs

### Personal Thread

The personal connections are central to the series' identity — this isn't a textbook, it's a practitioner sharing a decade of experience:

- **Hulu (~3 years)**: Learned about word2vec from Dr. Kevin Lin (now at Waymo) and Dr. Hang Li (now at Meta). Experimented with embeddings but didn't go deep.
- **Netflix (~10 years)**: Working on knowledge management systems, trained word2vec models on both Wikipedia data and Netflix internal documents. Found that even with just internal documents, the classic analogy relationships ("king/queen → man/woman" style) replicated — the embedding space captured real semantic structure in the company's own vocabulary. Also worked extensively with the arXiv API and Wikipedia API.
- **Entertainment industry (13 years total)**: Deep familiarity with entertainment data — movies, reviews, ratings, cast/crew networks. Natural affinity for IMDB/Rotten Tomatoes datasets.

This progression — learning the concept, experimenting, then applying it at scale on real problems — mirrors the reader's own learning journey.

### Dataset Strategy

#### Primary Dataset: Entertainment Data (IMDB / Rotten Tomatoes)

Entertainment data is the ideal primary dataset because it naturally contains **every feature type** the series needs to explore:

| Feature Type | Source | Used In |
|---|---|---|
| **Text** | Movie/TV reviews, synopses | Posts 1–5 (embeddings from review text) |
| **Keywords/tags** | Genres, content descriptors | Post 6 (structured categorical features) |
| **Graphs** | Actors, directors, co-starring relationships, production companies | Post 6 (graph features) |
| **Numerical** | Ratings, box office, runtime | Post 6 (continuous features) |
| **Temporal** | Release dates, review dates | Posts 2–4 (time-based coloring/filtering) |
| **Sentiment** | Star ratings as ground-truth labels | Post 5 (natural evaluation signal for clustering) |

This means a single dataset carries the whole series without feeling contrived. Each post reveals a new dimension of the same data, mirroring the actual experience of working with a dataset for months and gradually understanding its structure.

#### Secondary Dataset: Own Blog Posts

The author's own blog posts serve as a recurring tiny example:
- Small enough to be fully transparent (readers can verify results — they've read the posts)
- Natural cluster structure (HLL posts cluster together, neural nets posts cluster together, Hulu pipeline posts cluster together)
- Introduced in Post 1 as the "hello world" before scaling to the full entertainment dataset
- Useful for sanity-checking new techniques before applying them to larger data

#### Other Datasets (for future posts / cross-references)

- **arXiv papers**: Abstracts + metadata, co-authorship graphs, category labels. Natural connection to the author's experience with the arXiv API. Could appear as an alternative example in specific posts.
- **Wikipedia articles**: Clean text, hyperlink graph. Another dataset with personal connection. Could be used in the feature engineering post or in adjacent posts.

We intentionally avoid 20 Newsgroups (no personal connection, dated) and MNIST (fine as a one-off illustration in Post 3, but not the primary dataset).

### Tools and Libraries

| Tool | Role | Notes |
|---|---|---|
| **plotnine** | Primary plotting library | Grammar of graphics (ggplot2 syntax in Python). Beautiful output, principled composition of aesthetics/geometries/facets. Matches the iterative exploration workflow. |
| **seaborn** | Secondary / specific use cases | Use where it has specific strengths (e.g., `pairplot` for quick EDA, `heatmap` for correlation matrices). Not the default. |
| **scikit-learn** | Dimensionality reduction, clustering, preprocessing | PCA, t-SNE, UMAP (via `umap-learn`), k-means, DBSCAN, HDBSCAN, TF-IDF |
| **Three.js** | Interactive 3D data explorer | The signature interactive component of the series. Built as a TypeScript component in `interactive/src/`. |
| **sentence-transformers** | Generating document embeddings | For embedding the movie reviews / synopses. Pre-trained models keep this accessible. |
| **numpy / pandas** | Data manipulation | Standard toolkit |
| **networkx** | Graph analysis | Co-authorship / co-starring networks, community detection |
| **gensim** | Word2vec (Post 1 examples) | For the word2vec illustrations in the embeddings post |

### Skin / Theme

**Recommended: `stochastic`** — The data-viz / probability theme (scatter dots, bell curves, histograms, CDF S-curves, teal + orange palette) is a natural fit for a series about exploring data distributions and high-dimensional structure. It already has generative SVG elements that evoke data visualization.

Alternative: `graph` (technical/notebook feel). But `stochastic` feels more distinctive and visually connected to the subject matter.

---

### Post 1: What Embeddings Actually Are

**The foundation post.** What does it mean for a word, sentence, or document to be a vector? Why does this representation unlock so much of modern ML?

#### Personal Hook

Open with the Hulu story: learning about word2vec from Kevin Lin and Hang Li. The moment of first understanding — words as points in space, relationships as directions. Then fast-forward to Netflix, where training word2vec on internal documents revealed that the company's own vocabulary had geometric structure: analogies between teams, products, and concepts emerged naturally from the embedding space.

#### Narrative Arc

##### 1.1 — Words as Vectors: The word2vec Intuition

- The core idea: learn a vector for each word such that words used in similar contexts end up near each other
- The "king - man + woman = queen" example — not a parlor trick, but a deep fact about how language encodes relationships as directions in space
- Brief history: Bengio et al. (2003) neural language model → Mikolov et al. (2013) word2vec → the explosion of embedding methods
- **Code example**: Train a small word2vec model (gensim) on a manageable corpus. Show analogy queries, nearest neighbors, and the surprise of what the geometry captures.
- **Personal note**: "When I trained word2vec on our internal documents at Netflix, I found analogies between teams, products, and domain concepts that mirrored the company's actual organizational knowledge. The model had never seen an org chart — it learned the relationships from how people wrote about their work."

##### 1.2 — From Words to Documents

- Word embeddings capture word-level meaning; what about sentences and documents?
- Averaging word vectors (simple but lossy)
- Sentence-BERT / sentence-transformers: models trained to produce good sentence/document-level embeddings
- OpenAI's embedding API (mention as the commercial option developers encounter in practice)
- **Key concept**: Embeddings are a **learned compression** of meaning into a fixed-size vector. What they capture and what they lose depends on the training objective.

##### 1.3 — The Geometry of Meaning

- Cosine similarity: why angle matters more than magnitude
- What "similar" means in embedding space: topical similarity, stylistic similarity, functional similarity — depending on the model
- **Code example**: Embed the author's own blog posts using sentence-transformers. Compute pairwise cosine similarities. Show the similarity matrix — HLL posts cluster together, neural nets posts cluster together, Hulu pipeline posts cluster together. "These posts are about different things, and the embeddings know it."

##### 1.4 — Bi-Encoders vs. Cross-Encoders: Two Ways to Compare Text

- **Bi-encoders** (what we've been using): encode each text independently into a vector, compare with cosine similarity. Fast — you compute each embedding once, then compare millions of pairs with dot products.
- **Cross-encoders**: feed *both* texts into a single model together, get a relevance score. Much more accurate for pairwise comparison, but O(n²) — you can't pre-compute embeddings and reuse them.
- **The practical pattern**: Use bi-encoders (embeddings) to narrow a large corpus to a shortlist, then use a cross-encoder to rerank the shortlist. This is the retrieve-then-rerank pipeline that powers most modern search systems.
- **Personal note**: "At Netflix, I built a tool that used BAAI's `bge-reranker-large` cross-encoder to find the most relevant passage in a document for a given query. It worked by progressive narrowing — chunk the document into large pieces, cross-encode to find the best chunk, then re-chunk that winner into smaller pieces and cross-encode again, drilling down to the sentence level. The bi-encoder found the right *document*; the cross-encoder found the right *paragraph*."
- **Code example**: Quick demonstration of bi-encoder similarity vs. cross-encoder scoring on the same pairs. Show that the cross-encoder gives more nuanced results but can't scale to the full corpus.
- **Key insight**: Embeddings trade accuracy for speed. Cross-encoders are more accurate but require seeing both texts together. Most real systems use both — embeddings for the first pass, cross-encoders for refinement.

##### 1.5 — Now What?

- You've embedded 10,000 movie reviews. You have a matrix of shape (10000, 768). You can't visualize 768 dimensions. You can't even really reason about them.
- Introduce the entertainment dataset: what it contains, why we chose it, what questions we want to answer
- "The next post starts where most embedding tutorials end: you have the vectors. What do you actually *do* with them?"

#### Key Concepts Introduced
- Embedding as learned representation
- Cosine similarity
- The difference between word-level and document-level embeddings
- Bi-encoders vs. cross-encoders (the speed-accuracy tradeoff)
- The "vocabulary" of embedding models (what they can and can't represent)

#### Datasets Used
- Small word2vec example corpus (for the word-level illustrations)
- Author's blog posts (the "hello world" — ~40 documents)
- Introduction of the entertainment dataset (IMDB reviews)

---

### Post 2: First Contact — Statistics and Distributions in High Dimensions

**The "look before you leap" post.** Before you project, cluster, or classify, you need to understand what your data looks like in its native space. High-dimensional data breaks many 2D/3D intuitions.

#### Narrative Arc

##### 2.1 — The Impulse to Skip Ahead

- "You just embedded 10,000 movie reviews into 768-dimensional vectors. The natural impulse is to immediately run UMAP and look at the pretty plot. Resist that impulse."
- Why looking at the data first matters: garbage in, garbage out. Embedding models can produce degenerate outputs (all vectors nearly identical, norms wildly varying, a few outliers dominating structure). You need to detect these before projecting.

##### 2.2 — Statistics That Work in High Dimensions

- **Norms**: The distribution of vector magnitudes. Are they roughly uniform? Are there outliers?
- **Pairwise cosine similarities**: The distribution tells you whether your data has structure at all. If all cosine similarities are ~0.95, your embeddings are nearly identical and projection won't reveal much. If there's a wide spread, there's structure to find.
- **Variance per dimension**: Are some dimensions carrying most of the information? (This is a preview of PCA — the variance concentration question.)
- **Mean vector and deviation from it**: Is there a strong "average document"? How far do individual documents deviate?
- **plotnine examples**: Histogram of norms, density plot of pairwise cosine similarities, bar chart of variance by dimension (top 50)

##### 2.3 — The Curse of Dimensionality

- In high dimensions, most of the volume of a hypersphere is concentrated near the surface (the "shell" phenomenon)
- Distances converge: the ratio of maximum to minimum pairwise distance approaches 1 as dimensionality grows
- Nearest-neighbor becomes unreliable: "nearest" and "farthest" look almost the same
- **Show empirically**: Compute pairwise distance distributions in the movie review embeddings. Compare the spread at different dimensionalities (take random subsets of dimensions). The convergence is dramatic and real.
- "This isn't just a theoretical curiosity. It means that algorithms relying on distance (k-NN, k-means, even UMAP) behave differently than you'd expect from 2D experience."

##### 2.4 — Does This Dataset Have Structure?

- **The sniff test**: If pairwise cosine similarities are tightly clustered, there may not be meaningful structure to find. If there's a wide spread with modes, there's something there.
- **Explained variance by principal component**: How many dimensions do you actually need? If the top 50 PCs explain 90% of variance, your effective dimensionality is much lower than 768. (This previews Post 3.)
- **plotnine example**: Cumulative explained variance plot — "the elbow tells you how many dimensions matter"
- Apply to the movie review embeddings: "Our 768-dimensional embeddings have an effective dimensionality of about [X]. That's why projection will work."

##### 2.5 — Practical Takeaways

- Always check norms and cosine similarity distributions before projecting
- Look for outliers (documents with extreme norms or very low similarity to everything else)
- Estimate effective dimensionality to calibrate expectations for projection
- "Now that we know our data has structure, let's learn to see it."

#### Tools Introduced
- numpy (pairwise distances, norms)
- plotnine (all plots)
- scikit-learn PCA (just for variance analysis — the full treatment is Post 3)

#### Key Insight
The "boring" statistics post earns reader trust and teaches a diagnostic mindset. This is the same philosophy as the neural nets series' emphasis on inspecting activation distributions — look at what's actually happening inside, don't just look at the final output.

---

### Post 3: Projecting to See — PCA, t-SNE, UMAP

**The theory and practice of going from 768 dimensions to 2 or 3.** Three methods, three different tradeoffs, applied to the same dataset.

#### Narrative Arc

##### 3.1 — PCA: The Best Linear Projection

- Brief treatment — link to the fixed-income risk series for the deep dive
- PCA finds the directions of maximum variance. It's optimal among linear projections.
- **What PCA preserves**: Global structure, distances between well-separated groups
- **What PCA misses**: Nonlinear manifold structure. If the data lives on a curved surface in high-dimensional space, PCA "unfolds" it suboptimally.
- **plotnine example**: 2D PCA of movie review embeddings, colored by genre. "You can see broad separation — action reviews land differently from romance reviews — but the clusters overlap. PCA is giving us the best flat projection of a curved space."
- **Code**: scikit-learn `PCA(n_components=3)`, straightforward

##### 3.2 — t-SNE: Preserving Local Neighborhoods

- Developed by van der Maaten & Hinton (2008)
- What it optimizes: match the probability distribution of pairwise distances in high-D to the low-D projection. Points that are close in high-D should be close in low-D.
- **Why it produces clusters**: The heavy-tailed Student-t distribution in low-D allows separated clusters to form even when high-D distances are more continuous
- **The perplexity parameter**: Roughly "how many neighbors does each point care about?" Low perplexity → tight local clusters, high perplexity → more global structure
- **Critical caveat**: Don't trust the global layout. t-SNE can rotate, separate, or merge clusters arbitrarily. Only **within-cluster** structure is meaningful.
- **plotnine example**: Same data, multiple perplexity values. "Watch how the picture changes as we adjust perplexity. The clusters are real; their arrangement is not."

##### 3.3 — UMAP: Fast and (More) Faithful

- McInnes et al. (2018) — Uniform Manifold Approximation and Projection
- The topological intuition (brief, accessible): model the data as a fuzzy topological structure, then find a low-dimensional representation that preserves it
- **Why UMAP is often preferred over t-SNE**:
  - Much faster (scales better with dataset size)
  - Preserves more global structure (clusters that are close in high-D tend to stay close in low-D)
  - Better-defined mathematical foundations
- **Key parameters**: `n_neighbors` (local vs. global emphasis), `min_dist` (how tightly points cluster)
- **plotnine example**: Same data, varying `n_neighbors` and `min_dist`. "UMAP gives us the best balance of speed, local fidelity, and global structure."

##### 3.4 — Side-by-Side Comparison

- Same dataset, all three projections, same color scheme
- **PCA**: Broad strokes, everything overlaps in the middle
- **t-SNE**: Dramatic clusters, but arrangement is arbitrary
- **UMAP**: Clear clusters with meaningful spatial relationships between them
- "None of these is 'correct.' Each is a different lens on the same high-dimensional reality."

##### 3.5 — From 2D to 3D

- "2D projections collapse a lot of structure. Points that look overlapped in 2D may be clearly separated in 3D."
- Show 3D projections as static plotnine facets (multiple viewing angles)
- "But static images of 3D projections are frustrating — you always feel like you need to rotate. In the next post, we build a tool that lets you do exactly that."

#### Key Concepts Introduced
- Linear vs. nonlinear dimensionality reduction
- Local vs. global structure preservation
- The role of hyperparameters in shaping the projection
- Why no single projection is "ground truth"

#### References
- van der Maaten & Hinton (2008) — t-SNE
- McInnes, Healy & Melville (2018) — UMAP
- Link to Fixed-Income Risk PCA posts for deeper PCA treatment

---

### Post 4: Building a 3D Data Explorer with Three.js

**The interactive centerpiece of the series.** Take the 3D projections from Post 3 and build a tool that lets readers fly through their data.

#### Why Three.js

Three.js is the standard 3D library for the web. It's mature, well-documented, and handles the rendering pipeline that would be painful to build from scratch (cameras, lighting, picking, performance). For developers who've worked with D3 but not 3D, it's a natural next step — the mental model is similar (scene graph, bindable data, responsive to interaction) but with an extra dimension.

#### Narrative Arc

##### 4.1 — The Case for Interactive 3D

- Static UMAP plots are everywhere. They're fine for papers and presentations, but when you're *exploring* data, you need to rotate, zoom, and query.
- A 3D projection preserves more structure than 2D (strictly more information from the same reduction algorithm), and interactivity lets you see structure that's invisible from any single viewpoint.
- "This is the tool I wished I had every time I was staring at a matplotlib scatter plot trying to figure out what was behind those overlapping clusters."

##### 4.2 — Three.js Fundamentals for Developers

- Scene, camera, renderer — the minimum viable 3D application
- OrbitControls for mouse-driven rotation/zoom/pan
- Responsive canvas sizing
- **Code walkthrough**: 30 lines to get a rotating cube. Then replace the cube with data.

##### 4.3 — Rendering 10K+ Points Efficiently

- Naive approach: one `Mesh` per point. Works for 100 points, breaks at 10,000.
- `BufferGeometry` + `Points`: send all positions and colors to the GPU in a single buffer. Renders 100K+ points at 60fps.
- Color mapping: map a categorical variable (genre) or continuous variable (rating, year) to a color scale
- Point size: fixed vs. scaled by a feature (e.g., number of reviews)
- **Code**: The data pipeline from UMAP output → Three.js buffer geometry

##### 4.4 — Interaction: Hover, Click, Select

- **Raycasting**: Three.js's built-in ray-object intersection for identifying which point the mouse is near
- **Tooltip**: On hover, show document metadata (title, genre, rating, review snippet)
- **Click to select**: Highlight a point, show full details in a side panel
- **Lasso selection** (stretch goal): Draw a region, highlight all points inside, show aggregate stats
- **Camera bookmarks**: Save viewpoints that reveal particular structure, let readers jump between them

##### 4.5 — Coloring as a Question-Asking Tool

- The real power of the explorer: change what the colors represent and watch the structure shift
- Color by genre → "Do reviews cluster by genre?"
- Color by sentiment (star rating) → "Is sentiment structure the same as topic structure?"
- Color by year → "Has the embedding landscape shifted over time?"
- Color by source (IMDB vs. Rotten Tomatoes) → "Do the platforms have different semantic fingerprints?"
- Each recoloring is a new question asked of the same spatial arrangement

##### 4.6 — Putting It Together

- The complete component: load data, compute UMAP (or load pre-computed), render in Three.js, interact
- Embedded in the blog post via the `{{< interactive >}}` shortcode (same pattern as the `nn-playground`)
- "Fly through 10,000 movie reviews. Rotate to see the horror cluster hiding behind the comedy cluster. Click on the outlier floating by itself and discover it's a review that's actually about a completely different movie."

#### Implementation Notes

- Built as a TypeScript component in `interactive/src/`, following the existing architecture (entries, components, shared modules)
- Pre-computed UMAP coordinates stored as a JSON file in `static/data/` to avoid in-browser computation (UMAP on 10K points takes too long in the browser)
- Three.js added as a dependency in `interactive/package.json`
- Mobile-friendly: touch-based orbit controls, reasonable default viewpoint
- Dark/light mode support: adjust background color and point opacity based on `data-theme`

#### The Signature Piece

This interactive component is to the High-Dimensional Data series what the `nn-playground` is to the Neural Nets series — the thing readers come back to, share, and remember. The three.js explorer should feel like a genuine tool, not a demo.

---

### Post 5: Making Sense of Clusters

**You see clusters in your 3D explorer. Are they real? What do they mean?**

#### Narrative Arc

##### 5.1 — The Clustering Instinct

- "You've been flying through the data in the Three.js explorer. You see groups. Clumps. What look like islands in the point cloud. Are they real structure, or are they artifacts of the projection?"
- The fundamental question: how do we go from "I see groups" to "I can characterize these groups"?

##### 5.2 — Clustering Algorithms

- **k-means**: Fast, widely known, but assumes spherical clusters and requires choosing k
  - Elbow method and silhouette analysis for choosing k
  - "k-means is the 'good enough' algorithm — it works when clusters are roughly round and roughly equal-sized"
- **DBSCAN**: Density-based, finds arbitrary-shaped clusters, doesn't require k
  - `eps` and `min_samples` parameters — what they mean and how to choose
  - Natural handling of outliers (points not in any cluster)
  - "DBSCAN is the 'show me what's actually dense' algorithm"
- **HDBSCAN**: Hierarchical DBSCAN — more robust, fewer hyperparameters, handles variable-density clusters
  - "HDBSCAN is usually the right default for exploratory clustering"
- **Apply to the movie review embeddings**: Run all three on the UMAP-projected data. Compare results. Where do they agree? Where do they disagree? The disagreements are informative.

##### 5.3 — Evaluating Clusters

- Silhouette scores: do points fit their assigned cluster better than the nearest neighboring cluster?
- Cluster stability: bootstrap resampling — do the same clusters appear when you subsample the data?
- "A cluster that disappears when you remove 10% of the data was probably an artifact."

##### 5.4 — Labeling Clusters: What Are These Groups?

This is where the post gets genuinely interesting — going from "cluster 7" to "negative reviews of horror sequels."

- **Representative documents**: Find the nearest-to-centroid example in each cluster. Read it. What do these reviews have in common?
- **Enriched keywords**: TF-IDF over cluster vs. corpus. "These are the words that are surprisingly common in this cluster compared to the overall dataset." Use plotnine to visualize top keywords per cluster.
- **Topic models as an alternative lens**:
  - LDA (Latent Dirichlet Allocation): a generative model for topic discovery. "Imagine pulling topics from a hat, then pulling words from each topic."
  - NMF (Non-negative Matrix Factorization): a simpler decomposition approach. "Factor the document-term matrix into two non-negative matrices — one maps documents to topics, the other maps topics to words."
  - **The comparison**: Do LDA/NMF topics align with UMAP+HDBSCAN clusters? When they do, both methods are telling you the same story. When they don't, there's something interesting to investigate.
- **Cross-encoder refinement**: Use the cross-encoder (introduced in Post 1) to score cluster representatives against candidate labels or queries. "Given these 10 candidate topic labels, which one best describes the documents in this cluster?" The retrieve-then-rerank pattern from Post 1 applies here too — embeddings found the clusters, cross-encoders refine the labels.
- **LLM-assisted labeling**: Feed representative documents from each cluster to an LLM and ask "what do these have in common?" This is the practical, modern approach — and it connects the series to how developers actually work in 2026.

##### 5.5 — Updating the Three.js Explorer

- Add cluster assignments as a new coloring option in the 3D explorer
- Toggle between "color by genre" and "color by cluster" — do they align?
- "When the unsupervised clusters match the human-assigned genres, that validates both the embeddings and the clustering. When they don't — when a 'drama' and a 'thriller' cluster merge, or a 'comedy' cluster splits into 'romantic comedy' and 'dark comedy' — that's the embedding telling you something the genre labels don't capture."

#### Key Concepts Introduced
- Density-based vs. centroid-based clustering
- Cluster validation and stability
- Topic models (LDA, NMF) as an alternative to spatial clustering
- The practical problem of going from cluster IDs to human-readable labels

---

### Post 6: Feature Engineering — Beyond the Embedding

**Embeddings capture semantic similarity, but they're not the only signal. What if you have structured metadata and relational data alongside the text?**

#### Narrative Arc

##### 6.1 — The Limits of Embeddings Alone

- "Our movie review embeddings cluster nicely by topic and sentiment. But there's information they can't capture: who made the movie, what genre it was labeled as, when it was released, which actors appear together across films."
- Embeddings compress text into a fixed vector. That compression is lossy. Structured metadata and relational data carry signals the text doesn't.

##### 6.2 — Structured Features: Keywords, Tags, Metadata

- **Genre tags**: One-hot or multi-hot encoding of genre labels
- **Keyword features**: TF-IDF or binary presence of curated keyword lists
- **Numerical features**: Rating, runtime, release year, box office
- **The question**: If we add these features alongside the embedding, does the clustering improve? Does new structure emerge?
- **plotnine examples**: Before/after — UMAP with embeddings only vs. UMAP with embeddings + genre features

##### 6.3 — The Concatenation Problem

- Naive approach: stack embedding dimensions alongside keyword/metadata features into one long vector
- **Why this is problematic**:
  - Scale mismatch: 768 embedding dimensions will dominate 20 keyword features
  - Semantic mismatch: embedding dimensions are dense and continuous; keyword features are sparse and binary
  - Adding more features can actually *reduce* signal-to-noise ratio
- **Better approaches**:
  - Weighted concatenation with per-feature-type normalization
  - Separate projections per feature type, then combine the low-dimensional representations
  - Multi-view learning: learn a shared low-dimensional space that respects the structure of each feature type
  - Using structured features as **auxiliary information** (color/filter in the explorer) rather than merging into the embedding

##### 6.4 — Graph Features: Co-Starring Networks

This is where the entertainment data really shines.

- **Build the graph**: Actors and directors as nodes, co-appearance in a film as edges. Weight edges by number of collaborations.
- **Graph analysis with networkx**:
  - Degree centrality: who collaborates the most?
  - Community detection (Louvain): do actors cluster into communities? (They do — and the communities often correspond to genres, eras, or production companies)
  - **node2vec**: Learn embeddings of the graph itself — actors who occupy similar network positions get similar vectors
- **The key question**: Do graph communities align with embedding clusters?
  - When they align: the text and the network are telling the same story
  - When they don't: that's the interesting part. "These movies have similar reviews but completely different creative teams — why?"

##### 6.5 — Combining Everything

- **The full picture**: Embedding features + structured features + graph features
- Practical recipes:
  - Use embeddings for initial clustering
  - Use structured features and graph features to **refine, split, or relabel** clusters
  - Use the Three.js explorer with different coloring strategies to explore which features reveal which structure
- **The honest assessment**: More features doesn't always mean better understanding. The art is in knowing which features are relevant to your question.

##### 6.6 — The Series Payoff

- "We started with 768 opaque dimensions and a question: what's in this data?"
- "We learned to check our assumptions (Post 2), project to see structure (Post 3), explore interactively (Post 4), identify and label clusters (Post 5), and enrich our understanding with structured and relational data (Post 6)."
- "This workflow — embed, explore, cluster, label, enrich — is how practitioners actually make sense of large datasets. The specific tools change; the process doesn't."

#### Key Concepts Introduced
- Multi-modal feature combination
- The scale/semantic mismatch problem
- Graph feature extraction (degree, community, node embeddings)
- The principle of using features as lenses rather than concatenating everything

---

### Series Overview Table

| Post | Title | Focus | Signature Visualization |
|------|-------|-------|------------------------|
| **1** | What Embeddings Actually Are | word2vec → sentence embeddings → "now what?" | Cosine similarity matrix of blog posts |
| **2** | First Contact: Statistics and Distributions | Norms, pairwise similarity, curse of dimensionality | Distribution plots, variance analysis (plotnine) |
| **3** | Projecting to See: PCA, t-SNE, UMAP | Linear vs. nonlinear projection, tradeoffs | Side-by-side projections (plotnine) |
| **4** | Building a 3D Data Explorer with Three.js | Interactive 3D point cloud, color-as-question | Three.js interactive component |
| **5** | Making Sense of Clusters | Clustering, validation, labeling, topic models | Cluster-colored 3D explorer + keyword charts |
| **6** | Feature Engineering: Beyond the Embedding | Structured features, graph features, multi-view | Graph visualization + enriched explorer |

---

### Editorial Principles for Arc 1

1. **Personal thread throughout**: Each post connects back to the author's experience with embeddings and entertainment data. Not a textbook — a practitioner's notebook.

2. **Iterative discovery, not textbook presentation**: The series follows the real workflow. "First I tried this. Then I noticed that. So I tried this next." The reader learns the process, not just the tools.

3. **plotnine as the visual language**: Consistent, principled, beautiful plots throughout. The grammar of graphics is itself a way of thinking about data — composing aesthetics, geometries, and facets is composing questions.

4. **Three.js explorer as the signature piece**: This is the interactive component that readers come back to and share. It should feel like a real tool.

5. **One dataset, many lenses**: The entertainment data carries the whole series. Each post adds a new way to look at it. The accumulation of perspectives is the point.

6. **Honest about limitations**: Embeddings are not magic. UMAP clusters can be artifacts. More features can hurt. Every technique has failure modes, and we show them.

7. **Code is runnable**: Every code example in the series is self-contained and reproducible. Readers should be able to run the notebook alongside the post.

---

## Arc 2: Classical ML Demystified (Outline)

A series on the algorithms that power most production ML, aimed at developers who hear "machine learning" and think deep learning, but don't realize that a huge amount of production ML is still logistic regression, random forests, and gradient boosting.

### Planned Posts

#### SVM for Classification
- The geometric intuition: find the maximum-margin decision boundary
- Kernels: the trick that lets a linear classifier handle nonlinear boundaries
- **Interactive D3 visualization**: Drag points around, watch the margin and decision boundary change. Switch kernels (linear, RBF, polynomial) and see how the boundary transforms.
- Code with scikit-learn
- Connection to the entertainment data: classify movies by genre from review features

#### Decision Trees → Random Forests → Gradient Boosting
- Could be one post or a progression of 2-3 posts
- **Decision trees**: Completely transparent (you can print the rules!). Show overfitting — a deep tree memorizes the training data.
- **Random forests**: The "wisdom of crowds" fix. Bootstrap aggregation + feature randomization → diverse trees that generalize. The bias-variance tradeoff teaches itself here.
- **Gradient boosting (XGBoost/LightGBM)**: Fit the residuals, then fit the residuals of the residuals. The workhorse of Kaggle and production ML.
- The progression from bagging to boosting is a clean narrative arc.

#### Model Evaluation Done Right
- Precision, recall, F1, ROC curves, confusion matrices
- Cross-validation: why train/test isn't enough
- The "99% accuracy" trap (on a 99/1 class imbalance)
- Class imbalance strategies
- **The post that saves developers from deploying bad models.** Unglamorous but critical.

#### Possible Additional Posts
- **Naive Bayes**: Elegant, fast, gateway to Bayesian thinking. Build a spam filter in 30 lines. Connects forward to the ICL-as-Bayesian-inference post.
- **k-means and clustering**: Very visual, very intuitive. Different problem (unsupervised). Watching centroids converge. DBSCAN as contrast. (Some overlap with Arc 1 Post 5 — could be handled with cross-references.)
- **The bias-variance tradeoff, visually**: A standalone post. Interactive D3 slider — drag complexity, watch training curve and test curve diverge. Possibly the single most important idea in ML.

### Tools
- scikit-learn throughout
- plotnine for plots
- D3 for interactive visualizations (existing site infrastructure)
- Entertainment dataset where applicable, supplemented with synthetic data for visualization posts

### Skin / Theme
Likely `graph` (technical/notebook) or `stochastic`. TBD.

---

## Arc 3: How LLMs Actually Work (Outline)

A more conceptual series on the ideas behind modern language models. The audience is developers who use ChatGPT/Claude daily but want deeper understanding. Complements the "Neural Nets from Scratch" series (which builds from first principles) by focusing on phenomena and ideas that emerge at scale.

### Planned Posts

#### In-Context Learning as Bayesian Inference
- The central idea: the model isn't "learning" during the forward pass in the training sense, but it's doing something functionally equivalent to Bayesian posterior updating over a latent concept variable
- Xie et al. (2022) and subsequent work framing transformers as implicit Bayesian learners
- Simplified illustration: give the model a few (x, y) pairs from a hidden function → it "infers" the function. That's posterior updating.
- Connection to the Naive Bayes post in Arc 2 — Bayesian thinking as a through-line
- Less code-heavy than other series. The insight is conceptual: ICL is remarkable because it's doing approximate inference as a side effect of next-token prediction at scale.
- **The honest gap**: ICL only appears meaningfully in larger models. We explain the mechanism, acknowledge the scale requirement, and connect to the theoretical work on why transformers might have this capacity.

#### Possible Additional Posts (to be developed)

- **What embeddings actually are** — Could also live here instead of Arc 1, or be cross-referenced. The embedding post is a natural bridge between arcs.
- **Tokenization: the layer nobody thinks about** — BPE step by step, why tokenization choices affect everything, why LLMs struggle with counting letters.
- **RLHF and alignment** — Reward models, PPO, DPO. "The product engineering of AI."
- **Scaling laws and emergent abilities** — Kaplan et al., the phase-transition debate.
- **Attention is all you need (but why?)** — Could overlap with Neural Nets Part 3. Cross-reference.

### Skin / Theme
TBD. Possibly `chalkboard` (to match the Neural Nets series), possibly `theorem` (more formal/conceptual tone).

---

## Cross-Series Connections

The three arcs are distinct but connected. Key bridges:

| From | To | Connection |
|------|-----|-----------|
| Arc 1 Post 1 (Embeddings) | Arc 3 (ICL) | Embeddings are the shared representation that makes ICL possible |
| Arc 1 Post 5 (Clustering/Topics) | Arc 2 (Naive Bayes) | Topic models and Naive Bayes both rely on Bayesian generative models |
| Arc 1 Post 6 (Feature Engineering) | Arc 2 (Decision Trees) | Decision trees are the natural classifier for engineered features |
| Arc 1 Post 3 (PCA) | Neural Nets Series (PCA in fixed-income) | Explicit callback to existing published work |
| Arc 2 (Model Evaluation) | Arc 1 Post 5 (Cluster Evaluation) | Silhouette scores and cluster stability are the unsupervised analog of precision/recall |
| Arc 2 (SVM) | Arc 1 Post 3 (UMAP) | Both care about geometric structure in feature space |
| Arc 3 (ICL as Bayesian inference) | Arc 2 (Naive Bayes) | Bayesian thinking is the shared foundation |

### The Entertainment Data Thread

IMDB/Rotten Tomatoes data can recur across all three arcs:
- **Arc 1**: Embeddings of reviews, 3D exploration, clustering, feature engineering
- **Arc 2**: SVM and random forests for genre classification. Model evaluation on the classification task.
- **Arc 3**: Could embed reviews with different models and compare — what does the embedding space of a small model vs. a large model look like?

This gives the whole multi-series project a sense of continuity — the same dataset explored from multiple angles, each series revealing something new.

---

## Open Questions

1. **Arc 1 Post 4 (Three.js) scope**: Is Three.js fundamentals + the data explorer enough for one post, or should the Three.js basics be a separate "building 3D visualizations for the web" post? Leaning toward keeping it unified — developers can learn Three.js in the context of building something real.

2. **Arc 1 dataset acquisition**: Need to decide on the exact IMDB/Rotten Tomatoes data source. Options include the IMDB non-commercial datasets (title.basics, title.ratings, name.basics, etc.), the Large Movie Review Dataset (Maas et al.), and Rotten Tomatoes datasets on Kaggle. The co-starring graph would come from the IMDB cast/crew files. Need to check licenses.

3. **Arc 2 ordering**: Should model evaluation come before or after the algorithm posts? Arguments for "after" (you need something to evaluate first). Arguments for "before" (if you learn evaluation first, you can apply it properly from the start). Leaning toward "after" with forward references.

4. **Arc 3 depth**: The ICL-as-Bayesian-inference post is well-defined. The other Arc 3 posts are more speculative. Should Arc 3 be a full series, or is ICL a standalone essay with potential for expansion later?

5. **Skin decisions**: Arc 1 feels like `stochastic`. Arc 2 could be `graph` or `stochastic`. Arc 3 could be `chalkboard` or `theorem`. Should all ML-literacy content share a skin (unified visual identity) or differentiate by arc?

6. **Series naming**: Working titles. "Exploring High-Dimensional Data" is descriptive but not catchy. "Classical ML Demystified" is okay. "How LLMs Actually Work" is direct. Open to better titles.

7. **Implementation order**: Arc 1 has the clearest end-to-end design. Start there? Or start with the standalone posts (SVM, ICL) that don't require a 6-post commitment?

---

## Implementation Notes

### Experiments Directory

Following the pattern established for the Neural Nets series, experiments for these series should live in `experiments/`:

```
experiments/
├── makemore/          # Neural Nets series (existing)
├── embeddings/        # Arc 1: Exploring High-Dimensional Data
│   ├── .venv/         # Python virtual environment
│   ├── data/          # Downloaded/processed datasets
│   ├── notebooks/     # Jupyter notebooks for exploration and code examples
│   ├── scripts/       # Data acquisition and processing scripts
│   └── runs/          # Experiment outputs (UMAP coordinates, cluster assignments, etc.)
├── classical-ml/      # Arc 2: Classical ML Demystified
│   ├── .venv/
│   ├── data/
│   └── notebooks/
└── llm-concepts/      # Arc 3: How LLMs Actually Work
    ├── .venv/
    └── notebooks/
```

### Interactive Components

The Three.js data explorer follows the existing interactive component pattern:

```
interactive/
└── src/
    ├── components/
    │   ├── nn-playground.ts     # Existing (Neural Nets series)
    │   └── data-explorer-3d.ts  # New (Arc 1)
    └── entries/
        ├── nn-playground.ts     # Existing
        └── data-explorer-3d.ts  # New
```

Three.js added as a dependency in `interactive/package.json`. Pre-computed data (UMAP coordinates, cluster assignments, metadata) stored in `static/data/` as JSON files to keep the in-browser component fast.

---

## References and Research (to be expanded)

### Embeddings & Reranking
- Mikolov et al. (2013) — "Efficient Estimation of Word Representations in Vector Space" (word2vec)
- Bengio et al. (2003) — "A Neural Probabilistic Language Model"
- Reimers & Gurevych (2019) — Sentence-BERT
- Xiao et al. (2023) — BAAI BGE embedding and reranking models
- MTEB Leaderboard — https://huggingface.co/spaces/mteb/leaderboard
- Author's Netflix reranking tool: progressive cross-encoder narrowing for document-level search (pcra-dse/metaflows/relevant_sentences_metaflow.py)

### Dimensionality Reduction
- van der Maaten & Hinton (2008) — "Visualizing Data using t-SNE"
- McInnes, Healy & Melville (2018) — "UMAP: Uniform Manifold Approximation and Projection for Dimension Reduction"
- Wattenberg, Viégas & Johnson (2016) — "How to Use t-SNE Effectively" (distill.pub) — essential reading on t-SNE pitfalls

### Clustering
- Campello, Moulavi & Sander (2013) — HDBSCAN
- Blei, Ng & Jordan (2003) — "Latent Dirichlet Allocation"

### In-Context Learning
- Xie et al. (2022) — "An Explanation of In-context Learning as Implicit Bayesian Inference"
- Akyürek et al. (2023) — "What learning algorithm is in-context learning? Investigations with linear models"
- Olsson et al. (2022) — "In-context Learning and Induction Heads"

### Classical ML
- Cortes & Vapnik (1995) — Support Vector Networks
- Breiman (2001) — Random Forests
- Chen & Guestrin (2016) — XGBoost
- Friedman (2001) — Greedy Function Approximation: A Gradient Boosting Machine
