# VERIDICT — Enterprise Knowledge Copilot

An agentic RAG system that self-corrects its own retrieval before answering, built for the NASSCOM Agentic AI Hackathon 2026 by **Team RAGnarok**.

## How It Works

```
Query → Plan-Execute Agent
             │
             ▼
        CRAG Loop (LangGraph)
        ┌─────────────────────────────┐
        │  Retrieve → Grade           │
        │       ├── Good → Generate   │
        │       └── Weak → Rewrite    │
        │                & Retry      │
        └─────────────────────────────┘
             │
             ▼
     Confidence Score
     ├── High → Answer + cited sources
     └── Low  → Escalate (don't hallucinate)
```

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env — set LLM_PROVIDER and the matching API key
```

## Run

```bash
# Local dev
uvicorn src.api.main:app --reload

# Docker
docker-compose up
```

## Ingest Documents

```bash
python -m src.ingestion.loader --path data/raw/
```

## Run Evaluation

```bash
python -m eval.benchmark
```

## Run Tests

```bash
pytest tests/
```

## Project Structure

```
src/
├── ingestion/      # Document loading, chunking, embedding
├── retrieval/      # Top-k retrieval + CRAG grading
├── agents/         # LangGraph CRAG loop + Plan-Execute agent
├── generation/     # LLM provider factory, answer generation, confidence scoring
├── escalation/     # Escalation when confidence is too low
└── api/            # FastAPI endpoints (/query, /ingest)

eval/               # CRAG ON vs OFF benchmarks (F1, hallucination rate)
tests/              # Unit + integration tests
data/raw/           # Raw documents — gitignored
data/chroma_db/     # Persisted vector store — gitignored
```

## LLM Providers

Set `LLM_PROVIDER` in `.env` to switch providers — no code changes needed:

| Provider | Value |
|----------|-------|
| Groq (default) | `groq` |
| Azure OpenAI | `azure_openai` |
| AWS Bedrock | `aws_bedrock` |
| Ollama (air-gapped) | `ollama` |

## Tech Stack

| Component | Technology |
|-----------|------------|
| Orchestration | LangGraph |
| Tooling | LangChain |
| Embeddings | Sentence Transformers |
| Vector DB | ChromaDB / Qdrant |
| API | FastAPI |
| Deployment | Docker Compose |
