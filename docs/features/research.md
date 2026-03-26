# Research

The Research panel displays structured research artifacts -- literature reviews, hypotheses, background analysis, and reference material that inform your experiments.

## Key Capabilities

- **Structured artifacts** -- Each research note is a Markdown file with a consistent format: title, summary, references, and key findings
- **Chronological listing** -- Notes are sorted by date, making it easy to follow the research timeline
- **Full-text preview** -- Read research artifacts directly in the dashboard without switching to a file editor
- **Linked to experiments** -- Research notes provide context for why certain experiments were attempted

## How It Reads Data

The Research panel reads Markdown files from:

- **`.researchpad/experiments/research/`** -- Each `.md` file in this directory is treated as a research artifact

Files are expected to follow the naming pattern `YYYY-MM-DD-topic.md`. The dashboard extracts the date and title from the filename and renders the full Markdown content in the preview panel.

!!! tip "Write research notes with /research"
    The `/research` cursor command generates structured research artifacts automatically. It analyzes your project context, searches for relevant techniques, and writes a formatted Markdown file to the research directory.
