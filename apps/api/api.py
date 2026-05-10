import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="VERIDICT API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

NON_RAG_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant. Answer the user's question directly and concisely."),
    ("human", "{question}"),
])

# Milestone 3: used when rag_enabled=True and retriever is wired up
RAG_PROMPT = ChatPromptTemplate.from_messages([
    ("system", (
        "You are a helpful assistant. Use only the context below to answer the question. "
        "If the answer is not in the context, say you don't know.\n\nContext:\n{context}"
    )),
    ("human", "{question}"),
])


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


class AskRequest(BaseModel):
    question: str
    rag_enabled: bool = False


class AskResponse(BaseModel):
    answer: str
    model: str
    rag_used: bool = False
    sources: list = []


@app.post("/ask", response_model=AskResponse)
async def ask(request: AskRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        llm = get_llm()

        if request.rag_enabled:
            # ── Milestone 3: replace this block with the real retriever ──────────
            # retriever = get_retriever()   # ChromaDB / Qdrant
            # docs = retriever.get_relevant_documents(request.question)
            # context = "\n\n".join(d.page_content for d in docs)
            # sources = [{"source": d.metadata.get("source", ""), "content": d.page_content[:300]} for d in docs]
            # chain = RAG_PROMPT | llm | StrOutputParser()
            # answer = chain.invoke({"question": request.question, "context": context})
            # return AskResponse(answer=answer, model=get_model_name(), rag_used=True, sources=sources)
            # ─────────────────────────────────────────────────────────────────────
            raise HTTPException(status_code=501, detail="RAG mode coming in Milestone 3 — documents not yet ingested.")

        chain = NON_RAG_PROMPT | llm | StrOutputParser()
        answer = chain.invoke({"question": request.question})
        return AskResponse(answer=answer, model=get_model_name(), rag_used=False, sources=[])

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    return {"status": "ok", "provider": os.getenv("LLM_PROVIDER", "openai"), "model": get_model_name()}
