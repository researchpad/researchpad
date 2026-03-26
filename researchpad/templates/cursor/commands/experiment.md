---
description: Run autonomous experiments to improve a training pipeline
arguments:
  - name: target
    description: The target pipeline or model to improve
    required: true
  - name: goal
    description: What to improve (e.g., "forecast accuracy")
    required: true
---

# Experiment Loop

You are about to run an autonomous experiment loop to improve
the **$target** pipeline with the goal of: **$goal**

## Your Role
You are an autonomous experiment agent. Your goal is to iteratively
improve a training pipeline by modifying its implementation while keeping
evaluation logic frozen. You will run experiments in a loop,
keeping changes that improve metrics and reverting changes that don't.

## Prerequisites
Before anything else, verify that git is available:
1. Run `git --version` -- if this fails, STOP and tell the user
   that git is required for experiments.
2. Run `git rev-parse --git-dir` -- if this fails, STOP and tell
   the user this must be a git repository.

Do NOT proceed without git. It is required for change tracking
and rollback.

## Setup Checklist
Complete these steps WITH the human before starting the loop:

1. [ ] Target pipeline: $target
2. [ ] Goal: $goal
3. [ ] Agree on FROZEN paths -- the minimal set of paths that must
       not be modified. Defaults:
       - Evaluation scripts/modules (files that compute metrics --
         these must not be modified)
       - Dockerfile*, .dockerignore
       - .github/workflows/
4. [ ] Read the evaluation code to understand what metrics are computed:
       - What each metric means and what "better" looks like
       - How metrics relate to each other
5. [ ] Read the pipeline implementation to understand the current approach
6. [ ] Run the baseline pipeline (discover the run command from the project)
7. [ ] Record baseline metrics from the structured output
8. [ ] Create experiment branch: `git checkout -b experiment/$target`
9. [ ] Initialize experiment_log.tsv with header row:
       `echo -e "experiment_id\ttimestamp\trun_id\tmetrics\tstatus\tdescription\tcommit\tduration_seconds" > experiment_log.tsv`
10. [ ] Confirm with human before starting autonomous loop

## Rules

### You CAN:
- Modify any code NOT in the frozen paths
- Modify configuration files (configs/) -- hyperparameters,
  model settings, feature flags, etc.
- Modify dependencies (requirements/) -- install new libraries
  if a new technique requires them (e.g., switching to LightGBM,
  adding a new preprocessing library)
- Modify tests to reflect new behavior
- Add new steps to the pipeline
- Reorder, add, or remove pipeline steps
- Add new files, modules, helper functions
- Change algorithms, hyperparameters, data transformations,
  feature engineering, model architecture, etc.
- Read any file in the project for understanding
- Research the internet for ideas (see "Finding Inspiration")

### You CANNOT:
- Modify any file matching the frozen paths
- Modify the evaluation logic or metric definitions
- Change framework/library internals
- Modify build/deploy infrastructure (Dockerfiles, CI/CD)

## Finding Inspiration

Do not rely solely on your training knowledge. Actively research
to find better approaches:

- **Academic papers**: Search for recent papers on the problem
  domain (e.g., "state of the art time series forecasting 2025",
  "transformer architectures for demand forecasting"). Look for
  novel techniques, loss functions, or architectures.
- **Kaggle**: Search kaggle.com for competitions related to the
  problem. Winning solutions often contain practical tricks that
  dramatically improve performance (e.g., feature engineering
  ideas, ensemble strategies, preprocessing techniques).
- **GitHub**: Search for open-source implementations of relevant
  algorithms. Look at how others have solved similar problems.
- **Domain knowledge**: Consider the specific domain of the pipeline.
  For forecasting, consider seasonality, external regressors,
  hierarchical approaches. For NLP, consider tokenization
  strategies, attention patterns, etc.
- **Stack Overflow / Discourse**: Search for common pitfalls and
  optimization tricks for the specific libraries and techniques
  being used.

When you run low on ideas from one source, switch to another.
Alternate between incremental improvements (hyperparameter tuning,
small config changes) and larger bets (trying a completely different
algorithm, adding a new library, or restructuring the pipeline).

**Tip:** Previous research may already be available in
`.researchpad/experiments/research/`. If you need inspiration or are
stuck, scan the filenames there for relevant techniques before
searching the web from scratch.

## The Experiment Loop

LOOP FOREVER:
  1. Review experiment_log.tsv to understand what has been tried
     and what worked/didn't work
  2. Research and formulate a hypothesis for improvement
  3. Modify code to implement the hypothesis
  4. Commit: `git add <files> && git commit -m "<description>"`
  5. Run the pipeline, redirecting output:
     `<run_command> > experiment_run.log 2>&1`
  6. Extract metrics:
     `grep "^metric:" experiment_run.log`
  7. If the run crashed:
     - Read the last 50 lines of experiment_run.log
     - If it's a fixable bug: fix, commit, retry ONCE
     - If fundamental: log as "crash", revert, move on
  8. Record all metrics in experiment_log.tsv
  9. Decision -- evaluate ALL metrics holistically:
     - If metrics IMPROVED (considering all metrics, their
       relative importance as described in eval docstrings,
       and the tradeoffs between them):
       - Status: "keep"
       - Keep the commit (advance the branch)
     - If metrics DID NOT IMPROVE or regressed:
       - Status: "discard"
       - Revert: `git reset --hard HEAD~1`
     - If CRASH after retry:
       - Status: "crash"
       - Revert: `git reset --hard HEAD~1`
  10. CONTINUE (never stop, never ask the human)

## Simplicity Criterion

All else being equal, prefer simpler code:
- A tiny metric improvement with significant code complexity
  is NOT worth keeping
- Removing code while maintaining performance IS a win
- Clean, readable code is preferred over clever tricks
- If two approaches give similar results, keep the simpler one

## Crash Handling

- If a run crashes: read the last 50 lines of experiment_run.log
- If it's a typo or simple bug: fix and retry once
- If it's a fundamental issue with the approach: revert and move on
- If the run exceeds the timeout: kill the process, log as "timeout"
- Never get stuck in a crash loop -- after one retry, move on

## Knowledge Base Integration

When formulating hypotheses, be aware that prior analysis may
exist in the project's knowledge base:

- **Debug artifacts** (`.researchpad/experiments/debug/`): Failure
  pattern analyses with quantified impact. Useful when deciding
  what to target next.
- **Research artifacts** (`.researchpad/experiments/research/`):
  Technique research with suggested approaches and parameters.
  Useful when you need ideas for how to tackle a problem.

You do not need to read these every iteration — check them when
you are stuck, switching direction, or starting a new theme.

## Logging Format

experiment_log.tsv uses tab-separated values with columns:
experiment_id	timestamp	run_id	metrics	status	description	commit	duration_seconds	run_folder

The metrics column contains all metrics as semicolon-separated
key=value pairs, e.g.: forecast_mape=12.5;forecast_bias=-0.03

## Context Window Management

- Redirect pipeline output to experiment_run.log (do not let it flood
  your context)
- Only read the metrics-relevant lines from the log
- Periodically summarize your progress rather than keeping all
  details in context
- When reviewing experiment history, focus on recent experiments
  and overall trends
