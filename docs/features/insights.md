# Insights

The Insights panel displays accumulated learnings from across your experimentation history. It serves as a living knowledge base that grows with your project.

## Key Capabilities

- **Cumulative knowledge** -- Insights are appended over time, building a record of what works and what does not
- **Cross-experiment learnings** -- Synthesizes findings from multiple experiments into actionable takeaways
- **Editable** -- The underlying file is plain Markdown, so you can manually add or refine entries
- **Always visible** -- The insights panel is prominently placed on the dashboard for easy reference

## How It Reads Data

The Insights panel reads from a single file:

- **`.researchpad/experiments/insights.md`** -- A Markdown file where each insight is appended as a new section

The file is created during `researchpad init` with a blank template. As you run experiments and use the `/explain` command, new insights are appended. The dashboard watches this file and updates the panel in real time.

!!! tip "Curate your insights"
    While commands append insights automatically, you can edit `insights.md` directly to reorganize, refine, or remove entries. Treat it as your project's experiment journal.
