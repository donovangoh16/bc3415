import json
from pathlib import Path
from typing import List

import fitz
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS


DATA_DIR = Path("data")
VECTOR_DIR = DATA_DIR / "faiss_store"
CHUNKS_PATH = DATA_DIR / "chunk_store.json"

EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

DOC_SOURCES = [
    {
        "path": Path("docs/bankxxx_transaction_guidelines.pdf"),
        "type": "pdf",
        "id_prefix": "bankxxx",
    },
    {
        "path": Path("docs/BankXXX_Call_Centre_Guide_Fraud_Awareness_and_Response.pdf"),
        "type": "pdf",
        "id_prefix": "abs",
    },
    {
        "path": Path("uob_payments_transfer_services.json"),
        "type": "json",
        "id_prefix": "uob",
    },
]


def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> List[str]:
    chunks: List[str] = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk)
        if end == len(text):
            break
        start = max(0, end - overlap)
    return chunks


def extract_pdf_text(pdf_path: Path) -> str:
    with fitz.open(pdf_path) as doc:
        return "\n".join(page.get_text("text") for page in doc)


def load_documents():
    documents = []
    for cfg in DOC_SOURCES:
        path = cfg["path"]
        if not path.exists():
            raise FileNotFoundError(f"Missing document: {path}")

        if cfg["type"] == "pdf":
            text_blocks = [extract_pdf_text(path)]
        elif cfg["type"] == "json":
            with path.open("r", encoding="utf-8") as fp:
                payload = json.load(fp)
            text_blocks = []
            for item in payload:
                question = item.get("question", "")
                answer = " ".join(item.get("answer", []))
                text_blocks.append(f"{question}\n{answer}")
        else:
            raise ValueError(f"Unsupported document type: {cfg['type']}")

        for block_idx, block in enumerate(text_blocks):
            for chunk_idx, chunk in enumerate(chunk_text(block)):
                clean_chunk = chunk.strip()
                if not clean_chunk:
                    continue
                documents.append(
                    {
                        "id": f"{cfg['id_prefix']}-{block_idx}-{chunk_idx}",
                        "text": clean_chunk,
                        "source": f"{path}#{block_idx}",
                    }
                )
    return documents


def ensure_data_dir():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    VECTOR_DIR.mkdir(parents=True, exist_ok=True)


def build_and_save_index(force: bool = False):
    ensure_data_dir()

    if (
        VECTOR_DIR.exists()
        and any(VECTOR_DIR.iterdir())
        and CHUNKS_PATH.exists()
        and not force
    ):
        print("[BUILD] Existing LangChain FAISS store detected; skipping rebuild.")
        return

    print("[BUILD] Loading documents...")
    chunk_store = load_documents()
    texts = [entry["text"] for entry in chunk_store]
    metadatas = [{"id": entry["id"], "source": entry.get("source")} for entry in chunk_store]
    if not texts:
        raise ValueError("No text to index.")

    print(f"[BUILD] Encoding {len(texts)} chunks with {EMBED_MODEL_NAME}")
    embeddings = HuggingFaceEmbeddings(model_name=EMBED_MODEL_NAME)

    print("[BUILD] Creating LangChain FAISS vector store...")
    vectorstore = FAISS.from_texts(texts=texts, embedding=embeddings, metadatas=metadatas)

    print(f"[BUILD] Saving vector store to {VECTOR_DIR}")
    vectorstore.save_local(str(VECTOR_DIR))

    print(f"[BUILD] Persisting chunk metadata to {CHUNKS_PATH}")
    with CHUNKS_PATH.open("w", encoding="utf-8") as fp:
        json.dump(chunk_store, fp, ensure_ascii=False, indent=2)

    print("[BUILD] Done.")


if __name__ == "__main__":
    build_and_save_index()
