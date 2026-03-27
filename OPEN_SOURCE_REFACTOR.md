# ResearchPad Open Source Refactor Plan

## Executive Summary

Transform the gluepy-ui library into **ResearchPad**: a standalone, pip-installable open source tool for AI-powered autonomous ML experimentation. ResearchPad is framework-agnostic and works with any AI/ML project. It provides a web UI companion and cursor commands for iterative experiment loops, research, and debug analysis.

## Goals

1. Extract and rebrand gluepy-ui -> researchpad (framework-agnostic)
2. Make pip-installable with simple CLI commands
3. Add professional documentation (mkdocs-material, cyan theme matching UI)
4. Set up automated publishing (docs + PyPI)
5. Minimize dependencies (prefer Python stdlib)
6. Follow open source best practices

## Project Structure

```
researchpad/
├── .github/
│   └── workflows/
│       ├── publish-docs.yml          # Deploy docs to GitHub Pages
│       ├── publish-pypi.yml          # Publish to PyPI on tag
│       └── tests.yml                 # Run tests on PR
├── docs/
│   ├── index.md                      # Landing page
│   ├── getting-started/
│   │   ├── installation.md
│   │   ├── quick-start.md
│   │   └── configuration.md
│   ├── features/
│   │   ├── dashboard.md
│   │   ├── experiments.md
│   │   ├── research.md
│   │   ├── debug.md
│   │   └── insights.md
│   ├── commands/
│   │   ├── experiment.md
│   │   ├── research.md
│   │   ├── debug.md
│   │   └── explain.md
│   ├── api/
│   │   └── reference.md
│   ├── contributing.md
│   └── changelog.md
├── mkdocs.yml                        # Docs configuration
├── researchpad/
│   ├── __init__.py
│   ├── __version__.py                # Single source of truth for version
│   ├── cli/
│   │   ├── __init__.py
│   │   ├── main.py                   # Entry point for CLI
│   │   ├── init.py                   # researchpad init command
│   │   └── runserver.py              # researchpad runserver command
│   ├── server/
│   │   ├── index.js                  # Bundled Node.js server
│   │   └── static/                   # Built frontend assets
│   └── templates/
│       ├── cursor/
│       │   └── commands/
│       │       ├── research.md
│       │       ├── experiment.md
│       │       ├── experiment-bold.md
│       │       ├── debug.md
│       │       └── explain.md
│       └── .researchpad/
│           └── experiments/
│               ├── research/
│               ├── debug/
│               └── insights.md
├── src/
│   ├── frontend/                     # React/Vite/Tailwind frontend (dev only)
│   │   ├── src/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   └── server/                       # Hono/Node.js server (dev only)
│       ├── src/
│       ├── package.json
│       ├── tsconfig.json
│       └── build.mjs
├── tests/
│   ├── __init__.py
│   ├── test_cli.py
│   ├── test_init.py
│   └── test_server.py
├── .gitignore
├── LICENSE                           # MIT License
├── README.md                         # Main project README
├── CONTRIBUTING.md                   # Contribution guidelines
├── MANIFEST.in                       # Package data files
├── pyproject.toml                    # Modern Python packaging
└── Makefile                          # Build/dev commands
```

> **Note:** No skills directory is included. The cursor commands are self-contained
> and the agent (Cursor/Claude) can discover the project structure on its own.
> No framework-specific references (DAGs, settings, storage, context) are bundled.

## Phase 1: Package Structure & Build System

### 1.1 Create Python Package Structure

- [ ] Create `researchpad/` package directory
- [ ] Create `researchpad/__init__.py` with version import
- [ ] Create `researchpad/__version__.py`:
  ```python
  __version__ = "0.1.0"
  ```
- [ ] Copy `ref/libs/gluepy-ui/gluepy_ui/` -> `researchpad/`
- [ ] Rename all `gluepy_ui` references to `researchpad`
- [ ] Remove gluepy-specific imports (`from gluepy.commands import cli`, `from gluepy.conf import default_settings`, etc.)
- [ ] Update imports throughout the codebase

### 1.2 Create CLI Module

Use Python's built-in `argparse` (no external dependencies).

**File: `researchpad/cli/main.py`**
```python
#!/usr/bin/env python3
"""ResearchPad CLI entry point."""

import sys
from researchpad.cli.init import init_command
from researchpad.cli.runserver import runserver_command

def main():
    import argparse
    parser = argparse.ArgumentParser(
        prog="researchpad",
        description="AI-powered autonomous ML experimentation companion"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # researchpad init
    init_parser = subparsers.add_parser("init", help="Initialize ResearchPad in current project")
    init_parser.add_argument("--force", action="store_true", help="Overwrite existing files")

    # researchpad runserver
    server_parser = subparsers.add_parser("runserver", help="Start the ResearchPad UI server")
    server_parser.add_argument("bind", nargs="?", default="localhost:8888",
                              help="Host:port to bind (default: localhost:8888)")

    args = parser.parse_args()

    if args.command == "init":
        init_command(force=args.force)
    elif args.command == "runserver":
        runserver_command(args.bind)
    else:
        parser.print_help()
        sys.exit(1)

if __name__ == "__main__":
    main()
```

**File: `researchpad/cli/init.py`**
```python
"""Initialize ResearchPad in current project."""

import shutil
from pathlib import Path

def init_command(force=False):
    """
    Install cursor commands into .cursor/commands/
    Create .researchpad/ directory structure
    """
    project_root = Path.cwd()
    package_dir = Path(__file__).parent.parent
    templates_dir = package_dir / "templates"

    # Install cursor commands
    cursor_dir = project_root / ".cursor"
    cursor_dir.mkdir(exist_ok=True)

    src_commands = templates_dir / "cursor" / "commands"
    dst_commands = cursor_dir / "commands"
    if dst_commands.exists() and not force:
        print(f"  {dst_commands} already exists. Use --force to overwrite.")
    else:
        shutil.copytree(src_commands, dst_commands, dirs_exist_ok=True)
        print(f"  Installed cursor commands to {dst_commands}")

    # Create .researchpad directory structure
    researchpad_dir = project_root / ".researchpad"
    researchpad_dir.mkdir(exist_ok=True)
    (researchpad_dir / "experiments" / "research").mkdir(parents=True, exist_ok=True)
    (researchpad_dir / "experiments" / "debug").mkdir(parents=True, exist_ok=True)

    # Create insights.md if it doesn't exist
    insights_file = researchpad_dir / "experiments" / "insights.md"
    if not insights_file.exists():
        insights_file.write_text("# Experiment Insights\n\n")
        print(f"  Created {insights_file}")

    print("\n  ResearchPad initialized successfully!")
    print("\nNext steps:")
    print("  1. Run: researchpad runserver")
    print("  2. Open: http://localhost:8888")
    print("  3. Start experimenting with cursor commands: /research, /experiment, /debug")
```

**File: `researchpad/cli/runserver.py`**
```python
"""Start the ResearchPad UI server."""

import os
import sys
import signal
import shutil
import subprocess
from pathlib import Path

def _find_project_root():
    """Walk up from cwd to find git repository root."""
    current = Path.cwd()
    while True:
        if (current / ".git").is_dir():
            return str(current)
        parent = current.parent
        if parent == current:
            return str(Path.cwd())
        current = parent

def runserver_command(bind):
    """Start the ResearchPad server."""
    node_bin = shutil.which("node")
    if node_bin is None:
        print("Error: Node.js is required but not found.")
        print("  Install Node.js >= 18 from https://nodejs.org")
        sys.exit(1)

    parts = bind.split(":")
    if len(parts) == 2:
        host, port = parts[0], parts[1]
    else:
        host, port = "localhost", parts[0]

    package_dir = Path(__file__).parent.parent
    server_js = package_dir / "server" / "index.js"

    if not server_js.exists():
        print(f"Error: Server bundle not found at {server_js}")
        print("  This is a packaging issue. Please report at:")
        print("  https://github.com/yourusername/researchpad/issues")
        sys.exit(1)

    project_root = _find_project_root()
    env = {**os.environ, "PROJECT_ROOT": project_root}

    print(f"ResearchPad UI starting at http://{host}:{port}")
    print(f"Project root: {project_root}")
    print("Press Ctrl+C to stop\n")

    proc = subprocess.Popen(
        [node_bin, str(server_js), "--host", host, "--port", port],
        env=env,
        stdout=sys.stdout,
        stderr=sys.stderr,
    )

    def _shutdown(signum, frame):
        proc.terminate()
        proc.wait(timeout=5)
        sys.exit(0)

    signal.signal(signal.SIGINT, _shutdown)
    signal.signal(signal.SIGTERM, _shutdown)

    proc.wait()
    sys.exit(proc.returncode)
```

### 1.3 Create pyproject.toml

**File: `pyproject.toml`**
```toml
[build-system]
requires = ["setuptools>=68.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "researchpad"
dynamic = ["version"]
description = "AI-powered autonomous ML experimentation companion"
readme = "README.md"
requires-python = ">=3.10"
license = {text = "MIT"}
authors = [
    {name = "Your Name", email = "your.email@example.com"}
]
keywords = ["machine-learning", "experiments", "ai", "automation", "ml-ops"]
classifiers = [
    "Development Status :: 4 - Beta",
    "Intended Audience :: Developers",
    "Intended Audience :: Science/Research",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
    "Topic :: Scientific/Engineering :: Artificial Intelligence",
    "Topic :: Software Development :: Libraries :: Python Modules",
]

dependencies = []  # Zero runtime dependencies -- stdlib only

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "pytest-cov>=4.0",
    "black>=23.0",
    "ruff>=0.1",
    "mypy>=1.0",
]
docs = [
    "mkdocs>=1.5",
    "mkdocs-material>=9.5",
    "mkdocstrings[python]>=0.24",
]

[project.urls]
Homepage = "https://github.com/yourusername/researchpad"
Documentation = "https://yourusername.github.io/researchpad"
Repository = "https://github.com/yourusername/researchpad"
Issues = "https://github.com/yourusername/researchpad/issues"
Changelog = "https://github.com/yourusername/researchpad/blob/main/docs/changelog.md"

[project.scripts]
researchpad = "researchpad.cli.main:main"

[tool.setuptools.dynamic]
version = {attr = "researchpad.__version__.__version__"}

[tool.setuptools.packages.find]
include = ["researchpad*"]

[tool.setuptools.package-data]
researchpad = [
    "server/**/*",
    "templates/**/*",
]

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]

[tool.black]
line-length = 100
target-version = ["py310"]

[tool.ruff]
line-length = 100
target-version = "py310"

[tool.mypy]
python_version = "3.10"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = false
```

### 1.4 Create MANIFEST.in

**File: `MANIFEST.in`**
```
include README.md
include LICENSE
include CONTRIBUTING.md
recursive-include researchpad/server *
recursive-include researchpad/templates *
recursive-exclude * __pycache__
recursive-exclude * *.py[co]
```

## Phase 2: Template Files (Cursor Commands)

### 2.1 Adapt Cursor Commands

Copy and **genericize** each command from `ref/.cursor/commands/`:

| Source | Destination | Changes Required |
|--------|------------|-----------------|
| `research.md` | `researchpad/templates/cursor/commands/research.md` | Replace `.gluepy/experiments/` -> `.researchpad/experiments/` |
| `experiment.md` | `researchpad/templates/cursor/commands/experiment.md` | Remove all Gluepy-specific references (DAG, `python manage.py dag`, EvaluationTask, work tasks, eval_tasks, GLUEPY_SETTINGS_MODULE). Replace with generic ML experiment concepts (pipeline, training script, evaluation script). Trust the agent to discover the project structure. |
| `experiment-bold.md` | `researchpad/templates/cursor/commands/experiment-bold.md` | Same genericization as experiment.md |
| `debug.md` | `researchpad/templates/cursor/commands/debug.md` | Remove Gluepy-specific references (DAG class, `eval_tasks`, EvaluationTask subclass). Replace with generic "find and analyze evaluation outputs". Trust the agent to discover where metrics/artifacts live. |
| `explain.md` | `researchpad/templates/cursor/commands/explain.md` | Already mostly generic. Just update artifact paths. |

### 2.2 Key Genericization Rules for Commands

When adapting commands, follow these principles:

1. **Trust the agent** -- Do not dynamically inject project names, DAG labels, or framework-specific concepts. The agent (Cursor/Claude) is intelligent enough to discover the project structure on its own.

2. **Replace Gluepy concepts with generic equivalents:**
   - "DAG" -> "pipeline" or "training pipeline"
   - "work tasks" -> "pipeline steps"
   - "eval_tasks" / "EvaluationTask" -> "evaluation scripts" or "evaluation outputs"
   - `python manage.py dag <label>` -> "run the pipeline" (let the agent figure out the command)
   - "GLUEPY_SETTINGS_MODULE" -> remove entirely
   - "gluepy.exec" -> remove entirely
   - "frozen paths" -> keep concept but remove Gluepy-specific defaults

3. **Keep the experiment loop structure** -- The core loop (hypothesize -> modify -> run -> measure -> keep/revert) is framework-agnostic and should remain.

4. **Keep the artifact format** -- YAML frontmatter + markdown for research and debug artifacts is universal.

5. **Paths:** All `.gluepy/` references become `.researchpad/`

### 2.3 Create Default Directory Structure Template

- [ ] Create `researchpad/templates/.researchpad/experiments/research/` (empty dir)
- [ ] Create `researchpad/templates/.researchpad/experiments/debug/` (empty dir)
- [ ] Create `researchpad/templates/.researchpad/experiments/insights.md` (starter file)

## Phase 3: Documentation (mkdocs-material)

### 3.1 Create mkdocs.yml

The color theme must match the ResearchPad UI: **cyan** (`#00d4ff` dark, `#0891b2` light).

**File: `mkdocs.yml`**
```yaml
site_name: ResearchPad
site_description: AI-powered autonomous ML experimentation companion
site_url: https://yourusername.github.io/researchpad
repo_url: https://github.com/yourusername/researchpad
repo_name: yourusername/researchpad
edit_uri: edit/main/docs/

theme:
  name: material
  palette:
    # Light mode
    - media: "(prefers-color-scheme: light)"
      scheme: default
      primary: cyan
      accent: cyan
      toggle:
        icon: material/brightness-7
        name: Switch to dark mode
    # Dark mode
    - media: "(prefers-color-scheme: dark)"
      scheme: slate
      primary: cyan
      accent: cyan
      toggle:
        icon: material/brightness-4
        name: Switch to light mode

  font:
    text: Outfit
    code: JetBrains Mono

  features:
    - navigation.instant
    - navigation.tracking
    - navigation.tabs
    - navigation.tabs.sticky
    - navigation.sections
    - navigation.expand
    - navigation.path
    - navigation.indexes
    - navigation.top
    - search.suggest
    - search.highlight
    - search.share
    - content.tabs.link
    - content.code.copy
    - content.code.annotate
    - announce.dismiss

  icon:
    repo: fontawesome/brands/github
    admonition:
      note: octicons/tag-16
      abstract: octicons/checklist-16
      info: octicons/info-16
      tip: octicons/light-bulb-16
      success: octicons/check-16
      question: octicons/question-16
      warning: octicons/alert-16
      failure: octicons/x-circle-16
      danger: octicons/zap-16
      bug: octicons/bug-16
      example: octicons/beaker-16
      quote: octicons/quote-16

extra_css:
  - stylesheets/extra.css

extra:
  social:
    - icon: fontawesome/brands/github
      link: https://github.com/yourusername/researchpad

plugins:
  - search
  - mkdocstrings:
      handlers:
        python:
          options:
            docstring_style: google
            show_source: true

markdown_extensions:
  - pymdownx.highlight:
      anchor_linenums: true
      line_spans: __span
      pygments_lang_class: true
  - pymdownx.inlinehilite
  - pymdownx.snippets
  - pymdownx.superfences:
      custom_fences:
        - name: mermaid
          class: mermaid
          format: !!python/name:pymdownx.superfences.fence_code_format
  - pymdownx.tabbed:
      alternate_style: true
  - pymdownx.emoji:
      emoji_index: !!python/name:material.extensions.emoji.twemoji
      emoji_generator: !!python/name:material.extensions.emoji.to_svg
  - admonition
  - pymdownx.details
  - attr_list
  - md_in_html
  - toc:
      permalink: true

nav:
  - Home: index.md
  - Getting Started:
    - Installation: getting-started/installation.md
    - Quick Start: getting-started/quick-start.md
    - Configuration: getting-started/configuration.md
  - Features:
    - Dashboard: features/dashboard.md
    - Experiments: features/experiments.md
    - Research: features/research.md
    - Debug: features/debug.md
    - Insights: features/insights.md
  - Commands:
    - /experiment: commands/experiment.md
    - /research: commands/research.md
    - /debug: commands/debug.md
    - /explain: commands/explain.md
  - API Reference: api/reference.md
  - Contributing: contributing.md
  - Changelog: changelog.md
```

### 3.2 Create Documentation Pages

- [ ] Create `docs/index.md` -- Landing page with hero section
- [ ] Create `docs/getting-started/installation.md`
- [ ] Create `docs/getting-started/quick-start.md`
- [ ] Create `docs/getting-started/configuration.md`
- [ ] Create `docs/features/*.md` -- One page per feature
- [ ] Create `docs/commands/*.md` -- One page per cursor command
- [ ] Create `docs/api/reference.md` -- API documentation
- [ ] Create `docs/contributing.md` -- Contribution guidelines
- [ ] Create `docs/changelog.md` -- Version history

### 3.3 Custom Styling

Match the ResearchPad UI color palette:
- Dark mode accent: `#00d4ff` (bright cyan)
- Light mode accent: `#0891b2` (darker cyan)
- Dark background: `#0a0a0f`
- Font: Outfit (sans), JetBrains Mono (code)

**File: `docs/stylesheets/extra.css`**
```css
/* Match ResearchPad UI color palette */
:root {
  --md-primary-fg-color: #0891b2;
  --md-primary-fg-color--light: #00d4ff;
  --md-primary-fg-color--dark: #0e7490;
  --md-accent-fg-color: #00d4ff;
}

[data-md-color-scheme="slate"] {
  --md-primary-fg-color: #00d4ff;
  --md-primary-fg-color--light: #22d3ee;
  --md-primary-fg-color--dark: #0891b2;
  --md-accent-fg-color: #00d4ff;
  --md-default-bg-color: #0a0a0f;
  --md-default-bg-color--light: #111118;
}

/* Hero section styling inspired by Supabase/Tailwind docs */
.hero {
  text-align: center;
  padding: 4rem 2rem;
}

.hero h1 {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.25rem;
  opacity: 0.8;
  margin-bottom: 2rem;
}

/* Feature cards */
.feature-card {
  border: 1px solid var(--md-default-fg-color--lightest);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
  transition: box-shadow 0.2s;
}

.feature-card:hover {
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.1);
}

/* Code block enhancements */
.highlight pre {
  border-radius: 8px;
}
```

## Phase 4: GitHub Actions & CI/CD

### 4.1 Publish Documentation Workflow

**File: `.github/workflows/publish-docs.yml`**
```yaml
name: Publish Documentation

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -e ".[docs]"

      - name: Build and deploy docs
        run: |
          mkdocs gh-deploy --force
```

### 4.2 Publish to PyPI Workflow

**File: `.github/workflows/publish-pypi.yml`**
```yaml
name: Publish to PyPI

on:
  push:
    tags:
      - 'v*.*.*'
  workflow_dispatch:

jobs:
  build-and-publish:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Build frontend
        run: |
          cd src/frontend
          npm ci
          npm run build

      - name: Build server
        run: |
          cd src/server
          npm ci
          node build.mjs

      - name: Install build dependencies
        run: |
          python -m pip install --upgrade pip
          pip install build twine

      - name: Build package
        run: python -m build

      - name: Check package
        run: twine check dist/*

      - name: Publish to PyPI
        env:
          TWINE_USERNAME: __token__
          TWINE_PASSWORD: ${{ secrets.PYPI_API_TOKEN }}
        run: twine upload dist/*
```

### 4.3 Tests Workflow

**File: `.github/workflows/tests.yml`**
```yaml
name: Tests

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.10', '3.11', '3.12']

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python ${{ matrix.python-version }}
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}

      - name: Install dependencies
        run: |
          pip install -e ".[dev]"

      - name: Run tests
        run: |
          pytest tests/ -v --cov=researchpad --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
```

## Phase 5: Build System & Makefile

**File: `Makefile`**
```makefile
.PHONY: help dev build build-frontend build-server clean install test docs publish

help:
	@echo "ResearchPad Development Commands"
	@echo ""
	@echo "  make dev              - Start dev servers (frontend + server)"
	@echo "  make build            - Build production bundle"
	@echo "  make install          - Install package in dev mode"
	@echo "  make test             - Run tests"
	@echo "  make docs             - Serve docs locally"
	@echo "  make clean            - Clean build artifacts"
	@echo "  make publish          - Build and publish to PyPI (requires version tag)"

dev:
	@echo "Starting dev servers..."
	cd src/server && npm run dev &
	cd src/frontend && npm run dev

build-frontend:
	@echo "Building frontend..."
	cd src/frontend && npm ci && npm run build

build-server:
	@echo "Building server..."
	cd src/server && npm ci && node build.mjs

build: build-frontend build-server
	@echo "Build complete. Output in researchpad/server/"

install:
	pip install -e ".[dev,docs]"

test:
	pytest tests/ -v

docs:
	mkdocs serve

clean:
	rm -rf researchpad/server/static researchpad/server/index.js
	rm -rf dist/ build/ *.egg-info
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

publish: build
	python -m build
	twine check dist/*
	@echo "Ready to publish. Run: twine upload dist/*"
```

## Phase 6: Project Files

### 6.1 README.md, CONTRIBUTING.md, .gitignore

See separate files. Key points:
- README focuses on the 3-command quick start (`pip install`, `init`, `runserver`)
- CONTRIBUTING covers dev setup, testing, PR process
- .gitignore covers Python, Node, build outputs, `ref/` directory

## Phase 7: GitHub Configuration & Secrets

### 7.1 PyPI Configuration

1. Create PyPI account at https://pypi.org/account/register/
2. Go to Account Settings -> API tokens
3. Create new API token with scope "Entire account"
4. Copy the token (starts with `pypi-`)
5. In GitHub repository:
   - Go to **Settings -> Secrets and variables -> Actions**
   - Click "New repository secret"
   - Name: `PYPI_API_TOKEN`
   - Value: Paste the PyPI token
   - Click "Add secret"

### 7.2 GitHub Pages Configuration

1. In GitHub repository, go to **Settings -> Pages**
2. Under "Source", select **Deploy from a branch**
3. Select branch: `gh-pages`
4. Select folder: `/ (root)`
5. Click "Save"

After first workflow run, docs will be available at:
`https://yourusername.github.io/researchpad`

## Phase 8: Migration & Refactoring

### 8.1 Copy and Rename Files

```bash
# Copy gluepy-ui to researchpad (server bundle + static assets only)
cp -r ref/libs/gluepy-ui/gluepy_ui/server/ researchpad/server/

# Copy frontend and server dev sources
cp -r ref/libs/gluepy-ui/src/ src/

# Copy cursor command templates
mkdir -p researchpad/templates/cursor/commands
cp ref/.cursor/commands/research.md researchpad/templates/cursor/commands/
cp ref/.cursor/commands/experiment.md researchpad/templates/cursor/commands/
cp ref/.cursor/commands/experiment-bold.md researchpad/templates/cursor/commands/
cp ref/.cursor/commands/debug.md researchpad/templates/cursor/commands/
cp ref/.cursor/commands/explain.md researchpad/templates/cursor/commands/
```

### 8.2 Rename References

**Search and replace across all files:**
- `gluepy_ui` -> `researchpad`
- `gluepy-ui` -> `researchpad`
- `.gluepy/` -> `.researchpad/`
- `GLUEPY_` -> `RESEARCHPAD_` (environment variables)

### 8.3 Genericize Cursor Commands

In all command templates under `researchpad/templates/cursor/commands/`:

**research.md:**
- Replace `.gluepy/experiments/research/` -> `.researchpad/experiments/research/`
- No other changes needed (already framework-agnostic)

**experiment.md / experiment-bold.md:**
- Remove `python manage.py dag $dag_label` -> "Run the project's training/evaluation pipeline"
- Remove DAG/Task/EvaluationTask terminology -> "pipeline", "steps", "evaluation"
- Remove references to `gluepy` package, `gluepy.exec`, `GLUEPY_SETTINGS_MODULE`
- Remove hardcoded frozen paths (Dockerfile, setup.py, .github/) -> let agent decide
- Keep the core experiment loop structure (hypothesize -> modify -> run -> measure -> keep/revert)
- Replace `.gluepy/experiments/` -> `.researchpad/experiments/`

**debug.md:**
- Remove "Read the DAG class definition" -> "Discover how the project runs evaluation and produces metrics"
- Remove EvaluationTask/eval_tasks references -> "evaluation scripts/outputs"
- Replace `.gluepy/experiments/debug/` -> `.researchpad/experiments/debug/`

**explain.md:**
- Replace any `.gluepy/` -> `.researchpad/`
- Already mostly generic

### 8.4 Update Server Code

In `src/server/`:
- Update all file paths from `.gluepy/` to `.researchpad/`
- Remove any gluepy-specific imports or references

In `src/frontend/`:
- Update any hardcoded `.gluepy/` paths to `.researchpad/`
- Update any "Gluepy UI" branding to "ResearchPad"

## Phase 9: Testing & Validation

### 9.1 Create Test Files

**File: `tests/test_cli.py`**
```python
"""Test CLI functionality."""

def test_main_help(capsys):
    """Test main help output."""
    from researchpad.cli.main import main
    import sys
    sys.argv = ["researchpad", "--help"]
    try:
        main()
    except SystemExit:
        pass
    captured = capsys.readouterr()
    assert "researchpad" in captured.out
```

**File: `tests/test_init.py`**
```python
"""Test init command."""
import tempfile
from pathlib import Path
from researchpad.cli.init import init_command

def test_init_creates_directories():
    """Test that init creates expected directories."""
    with tempfile.TemporaryDirectory() as tmpdir:
        import os
        os.chdir(tmpdir)
        init_command()
        assert Path(".researchpad").exists()
        assert Path(".researchpad/experiments/research").exists()
        assert Path(".researchpad/experiments/debug").exists()
```

### 9.2 Manual Testing Checklist

- [ ] Install package: `pip install -e .`
- [ ] Run `researchpad --help`
- [ ] Run `researchpad init` in test project
- [ ] Verify `.cursor/commands/` created with all 5 commands
- [ ] Verify `.researchpad/experiments/` created
- [ ] Verify no gluepy/Gluepy references exist in installed templates
- [ ] Run `researchpad runserver localhost:8888`
- [ ] Open http://localhost:8888 and verify UI loads
- [ ] Test all UI pages (dashboard, experiments, research, debug, insights)

## Phase 10: Documentation Content

### 10.1 Write Documentation Pages

1. **index.md** -- Hero landing page with quick start, feature overview
2. **getting-started/** -- Installation, quick start, configuration
3. **features/** -- Detailed feature documentation with screenshots
4. **commands/** -- Complete guide for each cursor command
5. **api/reference.md** -- CLI reference (auto-generated with mkdocstrings)
6. **contributing.md** -- Development setup and guidelines
7. **changelog.md** -- Version history

### 10.2 Documentation Design Notes

Follow modern docs inspiration (Supabase, Langchain, Mantine, Tailwind):
- Clean hero section with animated terminal demo or screenshot
- Feature cards with icons
- Copy-paste code blocks
- Cyan color scheme matching the UI (`#00d4ff` accent)
- Outfit font for body text, JetBrains Mono for code
- Dark mode as default (matches the UI)

## Phase 11: Release Preparation

### 11.1 Pre-release Checklist

- [ ] All tests passing
- [ ] Documentation complete and builds successfully
- [ ] README.md complete with badges
- [ ] CONTRIBUTING.md complete
- [ ] LICENSE file (MIT)
- [ ] CHANGELOG.md with initial version
- [ ] Version number set in `researchpad/__version__.py`
- [ ] No remaining gluepy/Gluepy references in any shipped file
- [ ] All TODOs resolved or documented

### 11.2 First Release

```bash
# Ensure everything is committed
git add .
git commit -m "Prepare v0.1.0 release"

# Create and push tag
git tag v0.1.0
git push origin main
git push origin v0.1.0

# This triggers GitHub Actions to:
# 1. Build frontend + server
# 2. Package and publish to PyPI
# 3. Deploy documentation to GitHub Pages
```

### 11.3 Post-release Verification

- [ ] Verify package on PyPI: https://pypi.org/project/researchpad/
- [ ] Verify docs deployed: https://yourusername.github.io/researchpad/
- [ ] Test clean install: `pip install researchpad && researchpad init && researchpad runserver`

## Design Philosophy

### Zero Runtime Dependencies

The Python package uses only the standard library:
- **CLI:** `argparse` (stdlib)
- **File operations:** `pathlib`, `shutil` (stdlib)
- **Process management:** `subprocess`, `signal` (stdlib)
- **Server:** Node.js is required at runtime, but the JS bundle is pre-built and included in the package

### Framework-Agnostic

ResearchPad works with **any** AI/ML project:
- No assumptions about project structure
- No framework-specific concepts in commands (no DAGs, no Tasks, no settings modules)
- Cursor commands are written to trust the agent's ability to discover project structure
- The experiment loop pattern (hypothesize -> modify -> run -> measure -> keep/revert) is universal

### Professional Documentation

Inspired by best-in-class projects:
- **Supabase** -- Clean hero sections, clear CTAs
- **Langchain** -- Comprehensive examples, good navigation
- **Mantine** -- Modern component showcase
- **Tailwind** -- Excellent API documentation

Cyan color scheme matching the ResearchPad UI (`#00d4ff` / `#0891b2`).
