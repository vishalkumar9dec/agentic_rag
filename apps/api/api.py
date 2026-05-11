import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel

load_dotenv()

# ── Prompts ────────────────────────────────────────────────────────────────────

NON_RAG_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful knowledge assistant. Answer the user's question directly and concisely."),
    ("human", "{question}"),
])

RAG_PROMPT = ChatPromptTemplate.from_messages([
    ("system", (
        "You are a helpful knowledge assistant. Use ONLY the context below to answer the question. "
        "If the answer is not in the context, say you don't know.\n\nContext:\n{context}"
    )),
    ("human", "{question}"),
])

# ── LLM ───────────────────────────────────────────────────────────────────────

def get_llm():
    provider = os.getenv("LLM_PROVIDER", "openai")
    if provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            temperature=0,
            api_key=os.getenv("OPENAI_API_KEY"),
        )
    if provider == "groq":
        from langchain_groq import ChatGroq
        return ChatGroq(
            model=os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"),
            temperature=0,
            api_key=os.getenv("GROQ_API_KEY"),
        )
    if provider == "ollama":
        from langchain_community.chat_models import ChatOllama
        return ChatOllama(
            base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
            model=os.getenv("OLLAMA_MODEL", "llama3"),
        )
    raise ValueError(f"Unsupported LLM_PROVIDER: {provider!r}. Supported: openai, groq, ollama.")


def get_model_name() -> str:
    provider = os.getenv("LLM_PROVIDER", "openai")
    if provider == "openai":
        return os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    if provider == "groq":
        return os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    if provider == "ollama":
        return os.getenv("OLLAMA_MODEL", "llama3")
    return "unknown"

# ── Vector store ───────────────────────────────────────────────────────────────

_vector_store = None


def get_embeddings():
    provider = os.getenv("LLM_PROVIDER", "openai")
    if provider in ("openai", "azure_openai"):
        from langchain_openai import OpenAIEmbeddings
        return OpenAIEmbeddings(
            model=os.getenv("EMBEDDING_MODEL", "text-embedding-3-large"),
            api_key=os.getenv("OPENAI_API_KEY"),
        )
    from langchain_community.embeddings import SentenceTransformerEmbeddings
    return SentenceTransformerEmbeddings(
        model_name=os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    )


def get_vector_store():
    global _vector_store
    if _vector_store is None:
        from langchain_chroma import Chroma
        _vector_store = Chroma(
            collection_name="rag_docs",
            embedding_function=get_embeddings(),
            persist_directory=os.getenv("CHROMA_PERSIST_DIR", "data/chroma_db"),
            collection_metadata={"hnsw:space": "cosine"},
        )
    return _vector_store


def get_retriever():
    return get_vector_store().as_retriever(
        search_kwargs={"k": int(os.getenv("TOP_K", "5"))}
    )


def retrieve_with_confidence(question: str) -> tuple[list, list, float]:
    store = get_vector_store()
    k = int(os.getenv("TOP_K", "5"))
    docs_and_scores = store.similarity_search_with_score(question, k=k)
    docs = [d for d, _ in docs_and_scores]
    scores = [s for _, s in docs_and_scores]
    if scores:
        # cosine distance: 0 = identical, 1 = orthogonal
        # weight towards best-matching doc (lower distance = better)
        best = min(scores)
        avg = sum(scores) / len(scores)
        blended = 0.7 * best + 0.3 * avg
        confidence = round(max(0.0, min(1.0, 1.0 - blended)), 2)
    else:
        confidence = 0.0
    return docs, scores, confidence


def _collection_count() -> int:
    try:
        return get_vector_store()._collection.count()
    except Exception:
        return 0

# ── Ingestion ──────────────────────────────────────────────────────────────────

def ingest_documents(force: bool = False) -> dict:
    global _vector_store

    raw_dir = Path(os.getenv("RAW_DOCS_DIR", "data/raw"))
    if not raw_dir.exists():
        return {"status": "error", "reason": f"directory not found: {raw_dir}"}

    if not force and _collection_count() > 0:
        return {
            "status": "skipped",
            "reason": "collection already populated",
            "chunks": _collection_count(),
        }

    from langchain_community.document_loaders import PyPDFLoader, TextLoader
    from langchain_text_splitters import RecursiveCharacterTextSplitter

    all_docs, loaded_files, errors = [], [], []

    for path in sorted(raw_dir.glob("*.pdf")):
        try:
            all_docs.extend(PyPDFLoader(str(path)).load())
            loaded_files.append(path.name)
        except Exception as e:
            errors.append(f"{path.name}: {e}")

    for path in sorted(list(raw_dir.glob("*.md")) + list(raw_dir.glob("*.txt"))):
        try:
            all_docs.extend(TextLoader(str(path)).load())
            loaded_files.append(path.name)
        except Exception as e:
            errors.append(f"{path.name}: {e}")

    if not all_docs:
        return {"status": "error", "reason": "no documents found in data/raw/", "errors": errors}

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=int(os.getenv("CHUNK_SIZE", "1000")),
        chunk_overlap=int(os.getenv("CHUNK_OVERLAP", "200")),
        add_start_index=True,
    )
    chunks = splitter.split_documents(all_docs)

    if force:
        store = get_vector_store()
        store.delete_collection()
        _vector_store = None  # invalidate cache so the next call creates a fresh collection

    store = get_vector_store()
    store.add_documents(chunks)

    return {"status": "ok", "files": loaded_files, "chunks": len(chunks), "errors": errors}

# ── Startup ────────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    import asyncio
    try:
        result = await asyncio.to_thread(ingest_documents, False)
        print(f"[startup] ingest: {result}")
    except Exception as e:
        print(f"[startup] ingest error: {e}")
    yield

# ── App ────────────────────────────────────────────────────────────────────────

app = FastAPI(title="RAG Explorer API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Schemas ────────────────────────────────────────────────────────────────────

class AskRequest(BaseModel):
    question: str
    rag_enabled: bool = False


class AskResponse(BaseModel):
    answer: str
    model: str
    rag_used: bool = False
    sources: list = []
    confidence: float | None = None


class IngestResponse(BaseModel):
    status: str
    files: list = []
    chunks: int = 0
    errors: list = []
    reason: str = ""

# ── Routes ─────────────────────────────────────────────────────────────────────

@app.post("/ask", response_model=AskResponse)
async def ask(request: AskRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        llm = get_llm()

        if request.rag_enabled:
            docs, _, confidence = retrieve_with_confidence(request.question)
            context = "\n\n".join(d.page_content for d in docs)
            sources = [
                {
                    "source": Path(d.metadata.get("source", "unknown")).name,
                    "content": d.page_content[:300],
                }
                for d in docs
            ]
            chain = RAG_PROMPT | llm | StrOutputParser()
            answer = chain.invoke({"question": request.question, "context": context})
            return AskResponse(answer=answer, model=get_model_name(), rag_used=True, sources=sources, confidence=confidence)

        chain = NON_RAG_PROMPT | llm | StrOutputParser()
        answer = chain.invoke({"question": request.question})
        return AskResponse(answer=answer, model=get_model_name(), rag_used=False, sources=[])

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ingest", response_model=IngestResponse)
async def ingest(force: bool = True):
    import asyncio
    result = await asyncio.to_thread(ingest_documents, force)
    return IngestResponse(
        status=result.get("status", "error"),
        files=result.get("files", []),
        chunks=result.get("chunks", 0),
        errors=result.get("errors", []),
        reason=result.get("reason", ""),
    )


@app.get("/documents")
async def list_documents():
    try:
        store = get_vector_store()
        result = store._collection.get(include=["metadatas"])
        sources: set[str] = set()
        for meta in result.get("metadatas") or []:
            if meta and "source" in meta:
                sources.add(Path(meta["source"]).name)
        return {"documents": sorted(list(sources))}
    except Exception:
        return {"documents": []}


@app.get("/health")
def health():
    count = _collection_count() if _vector_store is not None else "uninitialized"
    return {
        "status": "ok",
        "provider": os.getenv("LLM_PROVIDER", "openai"),
        "model": get_model_name(),
        "chunks_in_store": count,
    }
