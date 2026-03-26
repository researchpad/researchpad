# Installation

## Requirements

| Dependency | Version | Purpose |
|------------|---------|---------|
| Python     | >= 3.10 | CLI and package management |
| Node.js    | >= 18   | UI server runtime |

## Install from PyPI

```bash
pip install researchpad
```

Verify the installation:

```bash
researchpad version
```

## Install from Source

Clone the repository and install in development mode:

```bash
git clone https://github.com/researchpad/researchpad.git
cd researchpad
pip install -e ".[dev,docs]"
```

Then build the frontend and server bundles:

```bash
make build
```

!!! note "Node.js is required at runtime"
    ResearchPad's UI server runs on Node.js. The `researchpad runserver` command will check for a `node` binary on your `PATH` and exit with a helpful error if it is missing.

## Upgrading

```bash
pip install --upgrade researchpad
```

## Next Steps

Once installed, head to the [Quick Start](quick-start.md) guide to initialize your first project.
