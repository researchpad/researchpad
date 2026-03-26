# ResearchPad

AI-powered autonomous ML experimentation companion.

ResearchPad provides a web UI and cursor commands for running iterative ML experiment loops. It tracks experiments, manages research artifacts, performs debug analysis, and surfaces insights -- all driven by AI coding agents.

## Quick Start

```bash
pip install researchpad
researchpad init
researchpad runserver
# Open http://localhost:8888
```

## Features

- **Dashboard** -- Real-time experiment progress, summary cards, activity feed
- **Experiments** -- Full history with sorting, filtering, git diffs, metric comparison
- **Research** -- Structured artifacts from papers, Kaggle, blogs, and GitHub
- **Debug** -- Deep outlier and error analysis with targeted experiment prompts
- **Insights** -- Theme clustering, learnings journal, diminishing returns detection
- **Dark/Light Mode** -- System-aware with manual toggle
- **Live Updates** -- WebSocket-based real-time refresh
- **Keyboard Shortcuts** -- Press `?` for the full list

## Cursor Commands

| Command | Description |
|---------|-------------|
| `/experiment` | Run autonomous experiment loops to improve your pipeline |
| `/research` | Research a topic and produce structured artifacts |
| `/debug` | Analyze model failures and outliers |
| `/explain` | Explain a specific experiment in detail |

## Requirements

- Python >= 3.10
- Node.js >= 18 (for the UI server)

## Documentation

Full documentation: [https://researchpad.github.io/researchpad](https://researchpad.github.io/researchpad)

## Development

```bash
git clone https://github.com/researchpad/researchpad.git
cd researchpad
make install
make dev
```

## License

Apache 2.0 -- see [LICENSE](LICENSE) for details.
