---
description: Research a topic and produce structured artifacts for the experiments knowledge base
arguments:
  - name: topic
    description: What to research (e.g., "demand forecasting with LightGBM ensembles")
    required: true
  - name: source_type
    description: "Where to focus: paper | kaggle | blog | github | general"
    required: false
---

# Research Topic

You are researching **$topic** and will produce **multiple focused
research artifacts** stored in the project's research knowledge base.

## Critical Rule: One Artifact Per Theme

DO NOT create a single monolithic artifact that mixes different source
types and themes together. Instead, **split your findings into multiple
smaller artifacts**, each covering a coherent theme or source cluster.

Good groupings:
- One artifact per competition (e.g., "M5 Winning Solutions", "VN2
  Winner Report")
- One artifact per technique theme (e.g., "Tweedie Loss for Zero-
  Inflated Targets", "Fourier Seasonality Features")
- One artifact per blog post or paper if it's substantial enough
- One artifact per open-source repo if it has distinct learnings

Bad groupings:
- One giant artifact mixing Kaggle solutions, academic papers, blog
  posts, and GitHub repos
- One artifact per individual bullet point (too granular)

Aim for **3-7 artifacts** for a broad topic. Each should be **concise
and self-contained** (200-500 lines max), so someone can read one
artifact and get the full picture on that specific theme without
needing context from other artifacts.

## Source Type Guidance

If a `source_type` was provided (`$source_type`), focus your search
accordingly:

| Source Type | What to Look For |
|-------------|-----------------|
| `kaggle` | Winning solutions from competitions related to the problem. Look for practical tricks (feature engineering, ensembles, preprocessing), competition write-ups, and public notebooks with high scores. |
| `paper` | Academic papers from arXiv, NeurIPS, ICML, KDD. Focus on recent publications (last 2 years) with practical applicability. Look for novel architectures, loss functions, training strategies, and ablation studies. |
| `blog` | Engineering blog posts from companies solving similar problems at scale (Uber, Airbnb, Meta, Google, Spotify, Instacart). Production-tested insights not found in papers. |
| `github` | Open-source implementations, especially well-starred repos with benchmarks. Look at how others structured similar pipelines, which libraries they chose, and what hyperparameters they used. |
| `general` | Broad search across all sources. Use when the topic doesn't fit neatly into one category. |

If no source type was specified, use `general` and search across all
source types.

## Step 1: Search and Gather

1. Search the web for the given topic, focusing on the specified source
   type. Cast a wide net — look at multiple sources.
2. For each relevant source, extract:
   - The key technique or finding
   - How it could apply to our problem
   - Specific parameters, implementation details, or configuration
3. Prioritize sources with concrete, reproducible results over vague
   guidance.

## Step 2: Cluster Into Themes

Before writing anything, group your findings into coherent themes.
Each theme becomes one artifact. Ask yourself:

- Could someone delete this artifact without losing context needed by
  the others?
- Does this artifact have a clear, specific title (not "General
  Findings")?
- Would someone searching for this specific topic find this artifact
  useful on its own?

If a theme only has 1-2 minor findings, merge it into a related theme
rather than creating a thin standalone artifact.

## Step 3: Write the Artifacts

Create the directory if it doesn't exist:
```
mkdir -p .researchpad/experiments/research
```

Write each artifact to `.researchpad/experiments/research/{date}-{slug}.md`
where `{date}` is today in YYYY-MM-DD format and `{slug}` is a
URL-friendly version of the theme (lowercase, hyphens, max 60 chars).

Each file MUST have this YAML frontmatter format:

```markdown
---
title: "{Specific, descriptive title of THIS theme}"
source_type: {paper|kaggle|blog|github|general}
source_url: "{Primary source URL for this artifact}"
date_retrieved: {YYYY-MM-DD}
tags: [{tag1}, {tag2}, {tag3}]
related_experiments: []
loop: ""
summary: "{One sentence summary of THIS artifact's key takeaway}"
---

# {Title}

## Key Findings
- Finding 1...
- Finding 2...

## Relevance to Our Problem
...

## Suggested Experiments
1. Try X with parameters Y
2. ...

## Sources
- [Source 1 title](url)
- [Source 2 title](url)
```

## Step 4: Confirm

After writing ALL artifacts:
1. Print a table listing each artifact: filename, title, source_type,
   and a one-line summary
2. Highlight the single most actionable finding across all artifacts
3. If specific experiments were suggested, highlight the most promising
   one

## Rules

- ALWAYS split into multiple artifacts (minimum 2 for any `general`
  topic). A single artifact is only acceptable for a narrow
  `source_type` search that genuinely yields one coherent theme.
- ALWAYS use the YAML frontmatter format exactly as shown above
- ALWAYS include at least 2 key findings per artifact
- ALWAYS suggest at least 1 concrete experiment per artifact
- Each artifact should have its OWN `source_type` reflecting the
  dominant source for that theme (e.g., a Kaggle-derived artifact gets
  `source_type: kaggle` even if the overall research was `general`)
- The `tags` field should contain 3-6 lowercase, hyphenated tags
- The `summary` field must be a single sentence (no line breaks)
- Do NOT fabricate sources — only include URLs you actually found
- If a source URL is not available, omit the `source_url` field
- Keep each artifact focused and concise — if it exceeds 500 lines,
  split it further
