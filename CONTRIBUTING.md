# Contributing to ResearchPad

## Development Setup

```bash
git clone https://github.com/researchpad/researchpad.git
cd researchpad

# Install Python package in dev mode
make install

# Start frontend + server in dev mode (hot reload)
make dev
```

## Building

```bash
# Build production bundle (frontend + server)
make build
```

## Testing

```bash
make test
```

## Serving Documentation

```bash
make docs
# Open http://localhost:8000
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run tests (`make test`)
5. Commit and push
6. Open a Pull Request

## Code Style

- Python: Ruff (configured in pyproject.toml)
- TypeScript/React: Prettier
- Line length: 100 characters

## Reporting Issues

Use [GitHub Issues](https://github.com/researchpad/researchpad/issues).
