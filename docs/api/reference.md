# CLI Reference

ResearchPad provides a command-line interface for project initialization, server management, and version information.

## `researchpad init`

Initialize ResearchPad in the current directory.

```bash
researchpad init [--force]
```

| Option | Description |
|--------|-------------|
| `--force` | Overwrite existing `.cursor/commands/` files if they already exist |

**What it creates:**

- `.cursor/commands/` -- Cursor IDE command files
- `.researchpad/experiments/research/` -- Research artifact directory
- `.researchpad/experiments/debug/` -- Debug report directory
- `.researchpad/experiments/insights.md` -- Insights file (blank template)

!!! tip "Safe to re-run"
    Running `init` without `--force` will skip existing files and only create missing directories. It will not delete or overwrite anything.

---

## `researchpad runserver`

Start the ResearchPad UI server.

```bash
researchpad runserver [host:port]
```

| Argument | Default | Description |
|----------|---------|-------------|
| `host:port` | `localhost:8888` | Bind address for the server |

**Examples:**

```bash
# Default: localhost:8888
researchpad runserver

# Custom port
researchpad runserver localhost:3000

# All interfaces
researchpad runserver 0.0.0.0:8888
```

**Environment variables:**

| Variable | Description |
|----------|-------------|
| `RESEARCHPAD_STORAGE_ROOT` | Override the default `.researchpad/` storage directory |

The server requires Node.js >= 18 to be installed and available on your `PATH`. It will exit with an error message if Node.js is not found.

**Stopping the server:**

Press `Ctrl+C` to gracefully shut down the server.

---

## `researchpad version`

Print the installed version of ResearchPad.

```bash
researchpad version
```

Output:

```
researchpad 0.1.0
```
