.PHONY: help dev build build-frontend build-server clean install test docs

help:
	@echo "ResearchPad Development Commands"
	@echo ""
	@echo "  make dev              - Start dev servers (frontend + server)"
	@echo "  make build            - Build production bundle"
	@echo "  make install          - Install package in dev mode"
	@echo "  make test             - Run tests"
	@echo "  make docs             - Serve docs locally"
	@echo "  make clean            - Clean build artifacts"

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
