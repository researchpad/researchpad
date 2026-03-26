# /research

Conduct background research on a topic relevant to your ML project. This command generates a structured research artifact and saves it to the research directory.

## Usage

```
/research
```

## What It Does

1. **Analyzes project context** -- Reads your codebase, recent experiments, and current challenges to determine what research would be most valuable.
2. **Gathers information** -- Searches for relevant techniques, papers, best practices, and implementation strategies.
3. **Synthesizes findings** -- Produces a structured Markdown document with a clear summary, key references, and actionable recommendations.
4. **Saves the artifact** -- Writes the research note to `.researchpad/experiments/research/` with a date-prefixed filename.

## Example

```
> /research
```

This might produce a file like:

```
.researchpad/experiments/research/2025-04-15-learning-rate-scheduling.md
```

With contents:

```markdown
# Learning Rate Scheduling Strategies

## Summary
Explored cosine annealing, warm restarts, and one-cycle policies
for improving convergence on the current dataset.

## Key Findings
- Cosine annealing with warm restarts showed 12% faster convergence
  in similar problem domains
- One-cycle policy is particularly effective for fine-tuning

## References
- Smith & Topin, 2019: Super-Convergence
- Loshchilov & Hutter, 2017: SGDR

## Recommendations
1. Try cosine annealing with T_0=10, T_mult=2
2. Compare against current StepLR schedule
```

## Artifact Format

Each research artifact is a Markdown file saved to:

- **`.researchpad/experiments/research/YYYY-MM-DD-topic.md`**

The file follows a consistent structure: title, summary, key findings, references, and recommendations. The dashboard renders these files in the Research panel.
