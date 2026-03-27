# ResearchPad Configuration

This file is read by AI agents (Cursor, Claude Code) when running
ResearchPad commands like /experiment, /research, and /debug.
Edit each section to match your project.

## Pipeline
- **Run command**: `[your training/evaluation command here]`
- **Metrics output**: [How your pipeline reports metrics, e.g. "prints `metric: key=value` lines to stdout"]

## Metrics
List your metrics in priority order. The first metric is the **primary metric**
used for dashboard summaries and "best experiment" calculations.

Use a direction prefix to tell the UI how to interpret each metric:
- `-` = lower is better (e.g. `-val_loss`)
- `+` = higher is better (e.g. `+accuracy`)
- `~` = closer to zero is better (e.g. `~bias`)

1. [e.g. `-val_loss` — Validation loss (primary)]
2. [e.g. `+accuracy` — Classification accuracy]

## Evaluation Output
- **Output path**: [relative path where your pipeline writes evaluation artifacts, e.g. `outputs/`]

## Frozen Paths
Files and directories that the /experiment command must NOT modify:
- [e.g. evaluation/metrics.py]
- [e.g. configs/eval_config.yaml]
- [e.g. .github/workflows/]

## Evaluation Integrity
Things that must stay constant across all experiments so results are comparable:
- Evaluation date ranges / time periods
- Data scope (which records/items are included in evaluation)
- Test/validation split logic
- Metric definitions and formulas

## Notes
Add any additional project-specific context for the AI agent here.
