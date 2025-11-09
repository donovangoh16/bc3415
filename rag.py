import os
from pathlib import Path

from dotenv import load_dotenv
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.prompts import PromptTemplate

from build_index import EMBED_MODEL_NAME

DATA_DIR = Path("data")
VECTOR_DIR = DATA_DIR / "faiss_store"

embeddings = None
vectorstore = None
_artifacts_loaded = False

BASE_INSTRUCTION = (
    "You are a call-centre assistant helping explain why a bank transaction failed. "
    "Use the retrieved context to answer factually and empathetically. "
    "Always respond in valid JSON with keys: issue, solve, and step_by_step_guide (null if not needed). "
    "Keep the entire response under 100 words."
)

PROMPT_TEMPLATE = PromptTemplate(
    input_variables=["context", "question"],
    template=(
        f"{BASE_INSTRUCTION}\n\n"
        "Context:\n{context}\n\n"
        "Question:\n{question}\n\n"
        "JSON Response:"
    ),
)

QUESTION_TEMPLATE = (
    "Transaction failed due to {category}. "
    "Explain to the client why it failed and a step by step guide to fix the issue."
)


def _ensure_vectorstore_loaded():
    global embeddings, vectorstore, _artifacts_loaded

    if _artifacts_loaded:
        return

    if not VECTOR_DIR.exists():
        raise FileNotFoundError(
            f"Missing LangChain FAISS store at {VECTOR_DIR}. Run `python build_index.py` first."
        )

    print(f"[RAG] Loading LangChain FAISS store from {VECTOR_DIR}")
    embeddings = HuggingFaceEmbeddings(model_name=EMBED_MODEL_NAME)
    vectorstore = FAISS.load_local(
        str(VECTOR_DIR), embeddings, allow_dangerous_deserialization=True
    )
    _artifacts_loaded = True
    print("[RAG] Vector store ready")


def retrieve_context(query: str, top_k: int = 3):
    _ensure_vectorstore_loaded()
    print(f"[RAG] Retrieving context for query: {query!r} (top_k={top_k})")
    docs_with_scores = vectorstore.similarity_search_with_relevance_scores(query, k=top_k)
    results = []
    for rank, (doc, score) in enumerate(docs_with_scores):
        results.append(
            {
                "rank": rank,
                "score": float(score),
                "text": doc.page_content,
                "source": doc.metadata.get("source"),
                "id": doc.metadata.get("id"),
            }
        )
    return results


load_dotenv()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


def _build_qa_chain(top_k: int):
    _ensure_vectorstore_loaded()
    llm = ChatOpenAI(model_name=OPENAI_MODEL, temperature=0.3)
    retriever = vectorstore.as_retriever(search_kwargs={"k": top_k})
    chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        chain_type="stuff",
        chain_type_kwargs={"prompt": PROMPT_TEMPLATE},
    )
    return chain


def run_case(category: str, top_k: int = 3) -> dict:
    query = QUESTION_TEMPLATE.format(category=category)
    chunks = retrieve_context(query, top_k=top_k)
    qa_chain = _build_qa_chain(top_k)
    answer = qa_chain.run(query)
    return {"chunks": chunks, "answer": answer}


def main():
    categories = [
        "no_payee",
        "payee_cooling",
        "txn_limit",
        "txn_limit_cooling",
        "fraud",
    ]
    top_k = int(os.getenv("RAG_TOP_K", "3"))

    print("[RAG] Preparing retrieval environment...")
    _ensure_vectorstore_loaded()

    for category in categories:
        print("\n==============================")
        print(f"Scenario: {category}")
        print(f"Query: {QUESTION_TEMPLATE.format(category=category)}")
        print(f"Top-K: {top_k}")

        result = run_case(category=category, top_k=top_k)

        print("[RAG] Retrieved chunks:")
        for chunk in result["chunks"]:
            print(f"  - {chunk['id']} ({chunk['source']}), score={chunk['score']:.4f}")
            print(f"{chunk['text']}\n")

        if result["answer"]:
            print("[RAG] Generated answer:\n")
            print(result["answer"])
        else:
            print("[RAG] No answer produced. Check the QA chain configuration.")


if __name__ == "__main__":
    main()
