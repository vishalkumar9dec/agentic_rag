# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**VERIDICT** — an Enterprise Knowledge Copilot built for the NASSCOM Agentic AI Hackathon 2026 by Team RAGnarok. It implements **Corrective RAG (CRAG)** using LangGraph to self-correct retrieval before generating answers, preventing hallucinations in enterprise environments.

## Architecture

The system has exactly 3 agents (deliberately minimal):

```
Query → Plan-Execute Agent (tool selection)
             │
             ▼
        CRAG Loop (LangGraph cyclic graph)
        ┌─────────────────────────────┐
        │  Retrieve → Grade           │
        │       ├── Good → Generate   │
        │       └── Weak → Rewrite    │
        │                & Retry      │
        └─────────────────────────────┘
             │
             ▼
     Confidence Score
     ├── High → Answer with cited sources
     └── Low  → Escalate (don't hallucinate)
```

**Core pipeline:** Ingest → Embed → Retrieve → Grade → Generate/Escalate

**Design constraints to preserve:**
- CRAG loop fires only on weak retrieval (saves 60-70% of LLM calls)
- LLM provider is switchable via env vars — no hardcoded provider
- Air-gap capable: Ollama replaces all managed APIs for fully offline deployment

## Tech Stack

| Component | Technology |
|-----------|------------|
| Orchestration | LangGraph |
| Tooling | LangChain |
| Embeddings | Sentence Transformers |
| Vector DB | ChromaDB (default) / Qdrant |
| LLM | Groq / Azure OpenAI / AWS Bedrock / Ollama (configurable) |
| Deployment | Docker Compose |

## Project Structure (planned)

```
agentic_rag/
├── docs/               # Architecture, problem statement, learning strategy
├── src/
│   ├── ingestion/      # Document loading, chunking, embedding
│   ├── retrieval/      # Top-k retrieval, CRAG grading logic
│   ├── agents/         # Plan-Execute agent, CRAG loop graph
│   ├── generation/     # LLM response with confidence scoring
│   └── escalation/     # Escalation logic when confidence is low
├── eval/               # CRAG ON vs OFF benchmarks (F1, hallucination rate)
├── docker-compose.yml
└── .env.example        # LLM provider config, vector DB config
```

## Key Concepts

**CRAG Grading:** After retrieval, an LLM grades context quality (strong/weak). Weak context triggers query rewriting and retry. After retries, if still weak, the system escalates rather than guessing.

**Confidence Score:** Every generated answer carries a calibrated confidence score that drives the escalation decision — this is the core differentiator from standard RAG.

**Chunking:** SOPs and support tickets require different chunking strategies. SOPs: larger semantic chunks. Tickets: smaller fixed-size chunks. Benchmark chunk sizes against retrieval precision.

## LLM Provider Configuration

The LLM provider must be switchable via environment variables. No LLM provider should be hardcoded. Support: `groq`, `azure_openai`, `aws_bedrock`, `ollama`.

## Evaluation Targets

| Metric | What to measure |
|--------|-----------------|
| F1 Score | CRAG ON vs CRAG OFF comparison |
| Hallucination Rate | Confident wrong answers with CRAG disabled vs enabled |
| Escalation Accuracy | Correct "I don't know" decisions on low-confidence queries |
| LLM Call Reduction | Target: 60-70% fewer calls due to selective CRAG firing |

## Hackathon Context

- **Event:** NASSCOM Agentic AI Hackathon 2026 (Problem Statement 2)
- **Round 3 deliverables:** Working code repo, F1/hallucination benchmarks, Docker deployment, documentation
- **Dataset:** ~20-30 SOPs + ~200-300 support tickets provided by hackathon organizers
