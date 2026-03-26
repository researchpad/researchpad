# Dashboard

The Dashboard is the central hub of ResearchPad. It provides a real-time overview of your entire experimentation workflow in a single view, combining experiment history, research, debug reports, and insights into a unified interface.

## Key Capabilities

- **Experiment timeline** -- See every run in chronological order with status indicators (success, failure, partial)
- **Metric trends** -- Track how key metrics evolve across experiments
- **Live updates** -- Changes to `.researchpad/` are pushed to the browser instantly via WebSocket
- **Dark and light mode** -- Matches your system preference, with a manual toggle
- **Responsive layout** -- Works on any screen size

## How It Reads Data

The Dashboard reads from the `.researchpad/experiments/` directory:

| Source | What It Displays |
|--------|-----------------|
| `experiment_log.tsv` | Experiment table, timeline, and metric charts |
| `research/` | Research artifact list with previews |
| `debug/` | Debug report list with severity indicators |
| `insights.md` | Current insights panel |

The server watches these files for changes and broadcasts updates to all connected browser clients. No polling, no manual refresh needed.

!!! tip "Keep the server running"
    Leave `researchpad runserver` running in a terminal while you work. The dashboard will stay in sync with every experiment, research note, or debug report you create.
