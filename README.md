# RAG Explorer

A hands-on comparison of **LLM without RAG** vs **LLM with RAG** — built milestone by milestone, with a video and article for each step.

Ask the same question with RAG off and RAG on. See exactly what changes, and why.

---

## Quick Start

```bash
# 1. Install dependencies
make install

# 2. Copy env and add your API key
cp .env.example .env

# 3. Run locally
make dev-backend       # API on :8001
make dev-frontend      # UI  on :3000

# or run everything via Docker
make dev
```

> **LLM provider:** Groq by default (free tier). Set `GROQ_API_KEY` in `.env`.  
> Switch to Ollama for fully offline use — no code changes needed.

---

## What This Demonstrates

| | Without RAG | With RAG |
|--|-------------|----------|
| Knowledge source | LLM training data (frozen) | Your documents (live) |
| Updated docs | ❌ Doesn't know | ✅ Reads them |
| Private data | ❌ Never trained on it | ✅ Retrieved at query time |
| Wrong answer style | Confident hallucination | Grounded + cited |

---

## Project Structure

```
apps/
├── non_rag/        # FastAPI — plain LangChain LLM call, no retrieval
└── rag/            # FastAPI — full RAG pipeline (Milestone 3)

frontend/           # React + Vite + Tailwind — shared UI, RAG toggle

src/
├── ingestion/      # Document loading, chunking, embedding   (Milestone 2)
├── retrieval/      # Top-k retrieval + CRAG grading          (Milestone 4)
├── agents/         # LangGraph CRAG loop                     (Milestone 4)
└── generation/     # LLM provider factory, confidence score  (Milestone 3+)

eval/               # CRAG ON vs OFF benchmarks               (Milestone 5)
tests/
data/raw/           # Raw documents — gitignored
data/chroma_db/     # Vector store — gitignored
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Agentic framework | LangChain + LangGraph |
| LLM | Groq / Ollama (switchable via `.env`) |
| Embeddings | Sentence Transformers |
| Vector DB | ChromaDB |
| Backend | FastAPI |
| Frontend | React + Vite + Tailwind CSS |
| Package manager | uv |
| Task runner | make |
| Deployment | Docker Compose |

---

## LLM Providers

Set `LLM_PROVIDER` in `.env` — no code changes needed:

| Provider | `LLM_PROVIDER` value | Key required |
|----------|----------------------|--------------|
| Groq (default) | `groq` | `GROQ_API_KEY` |
| Ollama (offline) | `ollama` | none |

---

## All Commands

```bash
make help             # list all commands

make install          # install Python deps via uv
make install-frontend # install npm deps

make dev-backend      # run non-RAG API locally  (:8001)
make dev-frontend     # run React frontend locally (:3000)
make dev              # start everything via Docker Compose

make build            # rebuild Docker images
make stop             # stop containers
make logs             # tail container logs

make lint             # ruff lint + autofix
make format           # ruff format
make test             # pytest
make clean            # remove .venv, node_modules, dist, __pycache__
```

---

## Build Milestones

Each milestone is a working app + a published video and article.

| # | Branch | What's built | Status |
|---|--------|-------------|--------|
| 1 | `feature/non-rag-application` | Non-RAG Q&A app — LLM answers from memory only | ✅ Done |
| 2 | `feature/document-ingestion` | Document loading, chunking, embeddings | 🔜 Next |
| 3 | `feature/rag-application` | RAG app — answers grounded in real documents | ⏳ |
| 4 | `feature/crag` | Corrective RAG — self-correcting retrieval loop | ⏳ |
| 5 | `feature/evaluation` | F1, hallucination rate — CRAG ON vs OFF | ⏳ |
