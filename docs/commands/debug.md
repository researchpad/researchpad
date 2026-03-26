# /debug

Analyze a failing or underperforming experiment and generate a structured debug report.

## Usage

```
/debug
```

## What It Does

1. **Identifies the failure** -- Reads recent experiment logs, error output, and stack traces to understand what went wrong.
2. **Analyzes root cause** -- Examines the code changes, configuration, data pipeline, and environment to pinpoint the probable cause.
3. **Generates recommendations** -- Produces a ranked list of suggested fixes with explanations.
4. **Saves a debug report** -- Writes a structured Markdown file to `.researchpad/experiments/debug/`.

## Example

```
> /debug
```

This might produce:

```
.researchpad/experiments/debug/2025-04-15-nan-loss-training.md
```

With contents:

```markdown
# Debug Report: NaN Loss During Training

## Error
RuntimeError: Loss became NaN at epoch 12, batch 847.

## Analysis
The learning rate of 1e-2 is too high for the current batch size (16).
Gradient norms exceeded 100.0 starting at epoch 10, indicating
gradient explosion before the NaN occurred.

## Suggested Fixes
1. Reduce learning rate to 1e-3 or lower
2. Add gradient clipping with max_norm=1.0
3. Increase batch size to 32 to stabilize gradients

## Related Experiments
- exp-041: Last successful run with lr=1e-3
- exp-042: Failed run with lr=1e-2
```

## Artifact Format

Each debug report is a Markdown file saved to:

- **`.researchpad/experiments/debug/YYYY-MM-DD-description.md`**

Reports follow a structured format with sections for the error, analysis, suggested fixes, and related experiments. The Dashboard displays these in the Debug panel.

!!! tip "Run /debug right after a failure"
    The command works best when run immediately after a failed experiment, while the error context and recent code changes are still available.
