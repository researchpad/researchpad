---
description: Perform deep outlier and error analysis on the most recent experiment run
arguments:
  - name: target
    description: "The target pipeline or model to analyze (e.g., 'forecaster')"
    required: true
  - name: focus
    description: "What to focus on (e.g., 'worst performing items', 'high bias categories')"
    required: false
---

# Debug Analysis

You are performing a deep outlier and error analysis on the **$target**
pipeline to identify specific failure patterns and suggest targeted experiments.

Focus area: **$focus**

## Step 1: Discover Evaluation Artifacts

Explore the project to understand how evaluation works:

1. Find where the project computes metrics (evaluation scripts, test
   harnesses, metric functions)
2. Understand what metrics are computed, what each means, and what
   "better" looks like
3. Identify what evaluation artifacts are produced (CSVs, TSVs, parquet
   files, logs)
4. Understand how the artifacts are structured (columns, granularity)

## Step 2: Locate the Most Recent Run

Find the latest run directory:

1. Check `experiment_log.tsv` for the most recent experiment with a
   `run_folder` entry
2. If no `run_folder` is logged, look for the latest timestamped
   directory under the storage root (e.g., `data/`)
3. Verify the run folder exists and contains evaluation outputs

## Step 3: Systematic Artifact Review

For each evaluation task's outputs, read and analyze:

- **Accuracy breakdowns**: Look at per-category, per-subcategory, and
  other granularity breakdowns. Identify which segments have the worst
  metrics.
- **Outlier lists**: Read the worst-performing items. Look for common
  attributes (same category? same price tier? seasonal? new items?
  low baseline demand?).
- **Pipeline diagnostics**: Check the exclusion funnel. Are important
  items being filtered out? Is the training set representative?
- **Feature importance**: Do the important features make domain sense?
  Is the model over-relying on one feature?

If a `focus` was specified, prioritize artifacts and analysis relevant
to that focus area.

## Step 4: Pattern Identification

Cross-reference the findings to identify root cause patterns:

- Is poor performance **broad** (weak across most items) or
  **concentrated** (specific segments dragging down aggregate metrics)?
- What do the worst performers have in common?
- Are there data quality issues (missing features, short history,
  extreme values)?
- What percentage of total error is attributable to each pattern?

## Step 5: Write Debug Artifacts — One Per Pattern

### Critical Rule: One Artifact Per Failure Pattern

DO NOT create a single monolithic artifact that lists all patterns in
one file. Instead, **write one separate artifact per distinct failure
pattern** you identify.

Each pattern should be a self-contained issue that could be
independently investigated, experimented on, and resolved. Someone
should be able to:
- Read one artifact and fully understand that specific problem
- Delete a resolved artifact without affecting understanding of others
- Assign different patterns to different experiments

Good split examples:
- "Boost model regression-to-mean on extreme VR" (one artifact)
- "Christmas week systematic under-prediction" (separate artifact)
- "Near-dead SKU over-prediction" (separate artifact)

Bad:
- One giant "Full Analysis" file with all patterns concatenated
- Splitting sub-patterns that share the same root cause (e.g., don't
  split "VR < 0.25" and "VR > 5.0" if both stem from the same
  regression-to-mean issue)

Additionally, write ONE brief **summary artifact** that provides an
overview of all patterns with an error attribution table and links to
the individual pattern files. This summary should be short (under 100
lines) and serve as an index.

### File Naming

Create the directory if it doesn't exist:
```
mkdir -p .researchpad/experiments/debug
```

- Summary: `.researchpad/experiments/debug/{date}-{target}-summary.md`
- Patterns: `.researchpad/experiments/debug/{date}-{target}-{pattern-slug}.md`

where `{date}` is today in YYYY-MM-DD format and `{pattern-slug}` is a
short URL-friendly description of the pattern (lowercase, hyphens, max
60 chars).

### Summary Artifact Format

```markdown
---
title: "{target} Debug Summary"
date: {YYYY-MM-DD}
analyzed_experiment: {experiment_id}
analyzed_run_folder: "{path to run folder}"
status: active
loop: "{loop label}"
tags: [summary]
---

# Debug Summary

{2-3 sentence overview of overall performance and key numbers}

## Error Attribution

| # | Pattern | Abs Error | % of Total | SKUs | Artifact |
|---|---------|-----------|-----------|------|----------|
| 1 | {name}  | {value}   | {pct}     | {n}  | {filename} |
| 2 | ...     | ...       | ...       | ...  | ...      |

## Pipeline Health

{Brief funnel stats: input -> filtered -> training -> test}

## Component Decomposition

{Which pipeline component (baseline/boost/uplift) drives most error}
```

### Pattern Artifact Format

Each pattern file MUST have this YAML frontmatter format:

```markdown
---
title: "{Specific, descriptive title of THIS pattern}"
date: {YYYY-MM-DD}
analyzed_experiment: {experiment_id from the run analyzed}
analyzed_run_folder: "{path to run folder}"
status: active
resolved_by: null
loop: "{loop label, e.g. forecaster}"
tags: [{tag1}, {tag2}, {tag3}]
---

# {Pattern Title}

## Pattern Identified

{Clear description of the failure pattern}

## Affected Population

- Count: {N} items ({X}% of test set)
- Contribution to overall error: {Y}% of total error
- Group metric: {value} vs overall {value}

## Root Cause Analysis

{Detailed analysis of why this pattern exists}

## Data Evidence

| Metric | Affected Group | Overall |
|--------|---------------|---------|
| ...    | ...           | ...     |

## Suggested Experiments

1. {Specific approach to address this pattern}
2. {Alternative approach}
```

## Step 6: Confirm

After writing ALL artifacts:
1. Print a table listing each artifact filename and its one-line
   summary
2. Highlight the single most impactful pattern (by error contribution)
3. Highlight the most promising suggested experiment
4. Quantify the potential impact (e.g., "addressing these 234 SKUs
   could reduce overall SMAPE by ~2pp")

## Rules

- ALWAYS split into one artifact per pattern plus one summary
- ALWAYS use the YAML frontmatter format exactly as shown above
- ALWAYS include quantified impact for each pattern
- ALWAYS suggest at least 1 concrete experiment per pattern
- Use actual numbers from the evaluation artifacts — do NOT estimate
- The `status` field should always be `active` for new analyses
- The `resolved_by` field should always be `null` for new analyses
- The `tags` should describe the type of issue found (e.g., outliers,
  cold-start, data-quality, bias)
- Keep each pattern artifact focused and concise (under 150 lines)
- If you cannot find evaluation artifacts, explain what you looked for
  and suggest how the user can generate them
