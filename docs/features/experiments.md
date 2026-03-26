# Experiments

The Experiments panel tracks every training run in your project. Each experiment is logged as a row in `experiment_log.tsv` with its configuration, metrics, and outcome.

## Key Capabilities

- **Automatic logging** -- The `/experiment` cursor command appends to the log after each run
- **Side-by-side comparison** -- Compare hyperparameters and metrics across any two experiments
- **Status tracking** -- Each run is marked as `success`, `failure`, or `partial`
- **Metric history** -- View how loss, accuracy, or any custom metric trends over time
- **Configuration diffs** -- See exactly what changed between two runs

## How It Reads Data

The Experiments panel reads from:

- **`experiment_log.tsv`** -- The primary data source. Each row contains a timestamp, experiment ID, status, description, and JSON-encoded metrics and configuration.

The dashboard parses this file on startup and watches it for appended rows. New experiments appear in the UI within seconds of being logged.

!!! note "Framework-agnostic"
    ResearchPad does not hook into your training framework. The cursor commands write to `experiment_log.tsv` using plain text. This means it works with PyTorch, TensorFlow, JAX, scikit-learn, or any other library.
