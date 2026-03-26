# Quick Start

This guide walks you through setting up ResearchPad in an existing ML project in under two minutes.

## 1. Install ResearchPad

```bash
pip install researchpad
```

## 2. Initialize Your Project

Navigate to your ML project root and run:

```bash
researchpad init
```

This creates:

- `.cursor/commands/` -- Cursor IDE commands for `/research`, `/experiment`, `/debug`, and `/explain`
- `.researchpad/experiments/research/` -- Storage for research artifacts
- `.researchpad/experiments/debug/` -- Storage for debug reports
- `.researchpad/experiments/insights.md` -- Accumulated experiment insights

!!! tip "Already have a `.cursor/commands/` directory?"
    Use `researchpad init --force` to overwrite existing command files.

## 3. Start the UI Server

```bash
researchpad runserver
```

The server starts at [http://localhost:8888](http://localhost:8888) by default.

To bind to a different host or port:

```bash
researchpad runserver 0.0.0.0:3000
```

## 4. Open the Dashboard

Open [http://localhost:8888](http://localhost:8888) in your browser. You will see the ResearchPad dashboard with panels for experiments, research, debug, and insights.

The dashboard updates in real time via WebSocket -- any changes to your `.researchpad/` directory are reflected immediately.

## 5. Use Cursor Commands

With the Cursor IDE, use these commands to interact with ResearchPad:

| Command | What It Does |
|---------|--------------|
| `/research` | Conduct background research and save a structured artifact |
| `/experiment` | Run a standard experiment iteration |
| `/experiment-bold` | Run an experiment with more aggressive changes |
| `/debug` | Analyze a failure and generate a debug report |
| `/explain` | Get a plain-language explanation of recent results |

Each command reads your project context and writes structured artifacts to `.researchpad/`, which the dashboard picks up automatically.

## What's Next

- [Configuration](configuration.md) -- Customize storage paths and server binding
- [Features](../features/dashboard.md) -- Explore each dashboard panel in depth
- [Commands](../commands/experiment.md) -- Detailed reference for every command
