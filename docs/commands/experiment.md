# /experiment

Run a standard experiment iteration. This command analyzes your current code, executes the training run, logs results, and updates the experiment tracker.

## Usage

```
/experiment
```

There is also a bolder variant:

```
/experiment-bold
```

The `-bold` variant uses more aggressive hyperparameter changes and architectural modifications.

## What It Does

1. **Reads project context** -- Scans your codebase to understand the current model architecture, dataset, and training configuration.
2. **Plans the iteration** -- Determines what to change based on prior experiment results and insights.
3. **Executes the run** -- Applies changes and runs the training script.
4. **Logs results** -- Appends a new row to `experiment_log.tsv` with the configuration, metrics, and outcome.
5. **Updates insights** -- If the run produces a notable finding, appends to `insights.md`.

## Example

```
> /experiment
```

After running, the experiment log will contain a new entry:

```tsv
2025-04-15T10:32:00Z	exp-042	success	Increased learning rate to 3e-4	{"loss": 0.342, "accuracy": 0.891}	{"lr": 3e-4, "batch_size": 32}
```

## Artifact Format

The command writes to:

- **`experiment_log.tsv`** -- One new row per run (tab-separated)
- **`insights.md`** -- Appended only when the run yields a meaningful learning

!!! note "/experiment vs /experiment-bold"
    Use `/experiment` for incremental, safe iterations. Use `/experiment-bold` when you want to explore further from the current best configuration -- larger learning rate jumps, different architectures, or unconventional approaches.
