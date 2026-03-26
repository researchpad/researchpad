# Configuration

ResearchPad works out of the box with sensible defaults. This page covers the options available for customization.

## Environment Variables

### `RESEARCHPAD_STORAGE_ROOT`

Override the default storage directory. By default, ResearchPad stores data in `.researchpad/` at your project root (the nearest parent directory containing a `.git` folder).

```bash
export RESEARCHPAD_STORAGE_ROOT=/path/to/custom/storage
researchpad runserver
```

This is useful when you want to share a single ResearchPad data directory across multiple related repositories.

## Server Binding

The default bind address is `localhost:8888`. Override it by passing a `host:port` argument:

```bash
# Bind to all interfaces on port 3000
researchpad runserver 0.0.0.0:3000

# Bind to a specific port on localhost
researchpad runserver localhost:9000
```

## Directory Structure

After running `researchpad init`, your project will contain:

```
your-project/
  .researchpad/
    experiments/
      research/          # Research artifacts (Markdown files)
      debug/             # Debug reports (Markdown files)
      insights.md        # Accumulated insights
      experiment_log.tsv # Experiment log (auto-created on first run)
  .cursor/
    commands/            # Cursor IDE command files
```

### `experiment_log.tsv`

The experiment log is a tab-separated file that tracks every experiment run. Each row records:

| Column | Description |
|--------|-------------|
| `timestamp` | ISO 8601 timestamp of the run |
| `experiment_id` | Unique identifier for the experiment |
| `status` | Outcome: `success`, `failure`, or `partial` |
| `description` | Brief summary of what was tried |
| `metrics` | Key metrics (JSON-encoded) |
| `config` | Hyperparameters and configuration (JSON-encoded) |

The dashboard reads this file to populate the experiments table and compute trends.

### Research Artifacts

Each file in `.researchpad/experiments/research/` is a Markdown document containing structured research notes -- literature references, hypotheses, and findings. File names follow the pattern `YYYY-MM-DD-topic.md`.

### Debug Reports

Files in `.researchpad/experiments/debug/` are structured Markdown reports that capture failure analysis. Each report includes the error, probable root cause, and suggested fixes.

## Custom Host and Port via Environment

You can also set the bind address through your shell profile or CI environment:

```bash
export RESEARCHPAD_HOST=0.0.0.0
export RESEARCHPAD_PORT=3000
researchpad runserver "$RESEARCHPAD_HOST:$RESEARCHPAD_PORT"
```

!!! warning "Binding to 0.0.0.0"
    Binding to all interfaces exposes the UI to your local network. Only do this on trusted networks or behind a firewall.
