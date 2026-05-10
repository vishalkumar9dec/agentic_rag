# RAG Explorer

A hands-on comparison of **LLM without RAG** vs **LLM with RAG** — built milestone by milestone, with a video and article for each step.

Ask the same question with RAG off and on. Watch the answer go from confidently wrong to grounded and cited.

---

## Quick Start

```bash
# 1. Clone and install
make install && make install-frontend

# 2. Configure your LLM key
cp .env.example .env
# → add OPENAI_API_KEY (default provider)

# 3. Run everything
make dev              # Docker Compose — frontend :3000, API :8001

# or run locally without Docker
make dev-backend      # API on :8001
make dev-frontend     # UI  on :3000
```

> **Default provider:** OpenAI (`gpt-4o-mini`). Switch to Groq or Ollama — no code changes, just set `LLM_PROVIDER` in `.env`.

---

## The Demo — Ask These 4 Questions

These questions thread through every milestone. The answers change. The questions don't.

| # | Question | RAG OFF | RAG ON (Milestone 3) |
|---|----------|---------|----------------------|
| Q1 | *What is the step-by-step process to onboard a new enterprise client?* | Generic internet advice | Exact internal SOP with checkpoints |
| Q2 | *What is the SLA for a Priority 1 support ticket?* | "Typically 4 hours" | "2 hr response, escalate after 1 hr" + source |
| Q3 | *What should a support agent do if a customer reports a data breach?* | "Contact your IT security team" | Named roles, 15-min window, P0 runbook |
| Q4 | *Which version of the portal was deployed on the 15th of last month?* | Hallucinated version number | CRAG escalates: "I don't have reliable data on this" |

**Q1–Q3** show RAG fixing hallucinations. **Q4** shows why even RAG needs CRAG — it catches weak retrieval and escalates instead of guessing.

---

## What Changes With RAG

| | RAG OFF | RAG ON |
|--|---------|--------|
| Knowledge source | LLM training data (frozen) | Your documents (live) |
| Private / updated docs | ❌ Never seen them | ✅ Retrieved at query time |
| Wrong answer style | Confident hallucination | Grounded + cited |
| Source attribution | Model name shown | Document name + page shown |

---

## Architecture

Single backend. One endpoint. `rag_enabled` in the request body activates the retrieval tool — no separate service needed.

```
POST /ask  { "question": "...", "rag_enabled": false }  →  LLM only
POST /ask  { "question": "...", "rag_enabled": true  }  →  LLM + retrieval (Milestone 3)
```

```
Browser
  └── React frontend (port 3000)
        └── POST /ask  ──►  FastAPI (port 8001)
                               ├── rag_enabled=false  →  prompt → LLM → answer
                               └── rag_enabled=true   →  retrieve → prompt+context → LLM → answer + sources
                                                                        ↑
                                                               ChromaDB  (Milestone 2+)
```

---

## Project Structure

```
apps/
└── api/            # Unified FastAPI backend — RAG toggled via request flag

frontend/
├── src/
│   ├── api/        # llm.jsx — single fetch wrapper
│   ├── views/      # Home.jsx — page state + layout
│   └── components/ # Sidebar, MessageFeed, AssistantMessage, InputBar, RagToggle

src/
├── ingestion/      # Document loading, chunking, embedding   (Milestone 2)
├── retrieval/      # Top-k retrieval + CRAG grading          (Milestone 4)
├── agents/         # LangGraph CRAG loop                     (Milestone 4)
└── generation/     # Confidence scoring                      (Milestone 3+)

eval/               # CRAG ON vs OFF benchmarks               (Milestone 5)
data/raw/           # Raw documents — gitignored
data/chroma_db/     # Vector store — gitignored
```

---

## LLM Providers

Set `LLM_PROVIDER` in `.env` — no code changes:

| Provider | `LLM_PROVIDER` | Model env var | Key required |
|----------|---------------|---------------|--------------|
| OpenAI (default) | `openai` | `OPENAI_MODEL` (default: `gpt-4o-mini`) | `OPENAI_API_KEY` |
| Groq | `groq` | `GROQ_MODEL` (default: `llama-3.1-8b-instant`) | `GROQ_API_KEY` |
| Ollama (offline) | `ollama` | `OLLAMA_MODEL` (default: `llama3`) | none |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Agentic framework | LangChain + LangGraph |
| LLM | OpenAI / Groq / Ollama (switchable) |
| Embeddings | Sentence Transformers |
| Vector DB | ChromaDB |
| Backend | FastAPI + uvicorn |
| Frontend | React + Vite + Tailwind CSS |
| Package manager | uv |
| Task runner | make |
| Deployment | Docker Compose |

---

## All Commands

```bash
make help             # list all commands

make install          # install Python deps via uv
make install-frontend # install npm deps

make dev-backend      # run API locally (:8001)
make dev-frontend     # run React frontend locally (:3000)
make dev              # start everything via Docker Compose

make build            # rebuild Docker images
make stop             # stop containers + kill local dev processes
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
| 1 | `feature/non-rag-application` | Unified Q&A API · React chat UI with sidebar · LLM answers from memory | ✅ Done |
| 2 | `feature/document-ingestion` | Document loading, chunking, embeddings into ChromaDB | 🔜 Next |
| 3 | `feature/rag-application` | RAG path wired — answers grounded in real documents with citations | ⏳ |
| 4 | `feature/crag` | Corrective RAG — LangGraph loop catches weak retrieval, escalates on Q4 | ⏳ |
| 5 | `feature/evaluation` | F1, hallucination rate, LLM call reduction — CRAG ON vs OFF across all 4 Qs | ⏳ |
