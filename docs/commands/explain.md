# /explain

Get a plain-language explanation of recent experiment results and their implications.

## Usage

```
/explain
```

## What It Does

1. **Reviews recent history** -- Reads the latest entries in `experiment_log.tsv` and any recent research or debug artifacts.
2. **Synthesizes context** -- Connects results across multiple experiments to identify patterns, trends, and key takeaways.
3. **Generates explanation** -- Produces a clear, non-technical summary of what happened, why it matters, and what to try next.
4. **Updates insights** -- Appends the most important findings to `.researchpad/experiments/insights.md`.

## Example

```
> /explain
```

Output might include:

> Over the last 5 experiments, reducing the learning rate from 1e-2 to 3e-4
> steadily improved validation accuracy from 0.82 to 0.89. The biggest jump
> came from adding gradient clipping (exp-043), which eliminated the NaN
> issues seen in exp-042. The model appears to be approaching a plateau --
> consider trying a different optimizer or augmenting the training data.

## Artifact Format

The `/explain` command appends to:

- **`.researchpad/experiments/insights.md`** -- New insights are added as sections at the end of the file

Unlike `/research` and `/debug`, this command does not create a new file. It updates the existing insights document, which the Dashboard displays in the Insights panel.

!!! note "Cumulative by design"
    Each `/explain` invocation adds to the insights file rather than replacing it. Over time, this builds a comprehensive record of your project's learnings.
