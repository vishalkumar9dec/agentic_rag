.DEFAULT_GOAL := help
.PHONY: help install dev dev-backend dev-frontend build stop lint test clean

# ── colours ───────────────────────────────────────────────────────────────────
CYAN  := \033[0;36m
RESET := \033[0m

help:  ## Show all available commands
	@echo ""
	@echo "  RAG Explorer — available commands"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*##"}; {printf "  $(CYAN)%-18s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ── setup ─────────────────────────────────────────────────────────────────────

install:  ## Install all Python deps via uv (creates .venv automatically)
	uv sync

install-frontend:  ## Install frontend npm deps
	cd frontend && npm install

# ── local dev (no Docker) ─────────────────────────────────────────────────────

dev-backend:  ## Run non-RAG API locally on port 8001
	uv run uvicorn apps.non_rag.api:app --port 8001 --reload

dev-frontend:  ## Run React frontend locally on port 3000
	cd frontend && npm run dev

# ── docker ────────────────────────────────────────────────────────────────────

dev:  ## Start all services via Docker Compose (frontend + APIs)
	docker compose up

build:  ## Rebuild all Docker images
	docker compose build

stop:  ## Stop Docker containers and any local dev processes on app ports
	docker compose down
	-@lsof -ti :3000,:8001 | xargs kill -9 2>/dev/null; true

logs:  ## Tail logs from all running containers
	docker compose logs -f

# ── quality ───────────────────────────────────────────────────────────────────

lint:  ## Lint and auto-fix Python code with ruff
	uv run ruff check . --fix

format:  ## Format Python code with ruff
	uv run ruff format .

test:  ## Run test suite
	uv run pytest tests/ -v

# ── cleanup ───────────────────────────────────────────────────────────────────

clean:  ## Remove .venv, __pycache__, and build artefacts
	rm -rf .venv frontend/node_modules frontend/dist
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
