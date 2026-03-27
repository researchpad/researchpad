---
description: Explain an experiment by analyzing its git diff, metrics, and evaluation artifacts
arguments:
  - name: experiment_id
    description: The experiment ID to explain (e.g., exp_072)
    required: true
  - name: commit
    description: The git commit hash for the experiment
    required: true
  - name: output_path
    description: Path to the run's evaluation artifacts (e.g., data/2026-03-17T19:54:56/forecaster)
    required: false
---

# Explain Experiment

You are analyzing experiment **$experiment_id** (commit `$commit`) to produce
a detailed narrative explanation of what was tried, why, and what happened.

## Step 1: Gather Context

1. Read the experiment log entry:
   ```
   grep "$experiment_id" .researchpad/experiment_log.tsv
   ```

2. Get the commit summary:
   ```
   git show $commit --stat
   ```

3. Get the full diff:
   ```
   git diff $commit~1..$commit
   ```

4. If an `output_path` was provided (`$output_path`), list and review the
   evaluation artifacts in that directory to understand metric breakdowns.

## Step 2: Analyze

Based on the diff and context, determine:

- **What files were changed** and categorize them (model code, config,
  feature engineering, preprocessing, etc.)
- **What the hypothesis was** — infer from the description in the log
  and the nature of the code changes
- **What approach was taken** — describe the implementation changes
  in plain language, organized by intent
- **What parameters changed** — if config files were modified, list
  the before/after values

## Step 3: Produce Explanation

Write a structured explanation with these sections:

### Hypothesis
What was being tested and why. Connect it to the experiment goal
described in the log entry.

### Implementation
What code changes were made, organized by intent (not by file).
Highlight the key technical decisions.

### Results
What the metrics showed. Compare to the previous state. If evaluation
artifacts are available, include per-segment breakdowns that reveal
where improvements or regressions occurred.

### Verdict
Why the experiment was kept/discarded/crashed. Was the hypothesis
validated or invalidated?

### Implications
What this experiment teaches us for future work. What should be
tried next based on these results? What should be avoided?

## Output Format

Write the explanation as clear prose with markdown formatting.
Use metric values and specific numbers from the data. Be concise
but thorough — the goal is that someone reading this explanation
months later can understand exactly what happened and why.
