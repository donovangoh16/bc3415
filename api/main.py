import os
import json
import re
from typing import List, Optional, Any, Dict

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Reuse existing RAG pipeline
from rag import run_case


ISSUE_MAP = {
    "limit_exceeded": "txn_limit",
    "no_payee": "no_payee",
    "fraud": "fraud",
}


class Chunk(BaseModel):
    id: Optional[str]
    score: Optional[float]
    source: Optional[str]
    text: Optional[str]


class AssistResponse(BaseModel):
    issue: str
    solve: str
    step_by_step_guide: List[str]
    chunks: List[Chunk]


def _extract_json_block(text: str) -> str:
    """Extract JSON from code fences or fallback to first {...} region."""
    if not text:
        return "{}"
    # Try fenced block ```json ... ``` or ``` ... ```
    fence = re.search(r"```json\s*(\{[\s\S]*?\})\s*```", text)
    if not fence:
        fence = re.search(r"```\s*(\{[\s\S]*?\})\s*```", text)
    if fence:
        return fence.group(1)
    # Fallback: find first balanced braces (naive)
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start : end + 1]
    return "{}"


def _normalize_steps(steps: Any) -> List[str]:
    """Ensure steps is a list of strings. Convert dict with Step X keys if needed."""
    if steps is None:
        return []
    if isinstance(steps, list):
        return [str(s).strip() for s in steps if str(s).strip()]
    if isinstance(steps, dict):
        # Sort keys like Step 1, Step 2 ... or numeric keys
        def key_order(k: str) -> int:
            m = re.search(r"(\d+)", k)
            return int(m.group(1)) if m else 9999

        ordered = [steps[k] for k in sorted(steps.keys(), key=key_order)]
        return [str(s).strip() for s in ordered if str(s).strip()]
    # Fallback single string -> one step
    s = str(steps).strip()
    return [s] if s else []


def _parse_answer(answer: str) -> Dict[str, Any]:
    raw = _extract_json_block(answer)
    try:
        obj = json.loads(raw)
    except Exception:
        obj = {}
    issue = str(obj.get("issue", "")).strip()
    solve = str(obj.get("solve", "")).strip()
    steps = _normalize_steps(obj.get("step_by_step_guide"))

    # Enforce short response
    def _truncate_words(s: str, limit: int = 80) -> str:
        words = s.split()
        return " ".join(words[:limit]) + ("…" if len(words) > limit else "")

    issue = _truncate_words(issue)
    solve = _truncate_words(solve)
    return {"issue": issue, "solve": solve, "step_by_step_guide": steps}


app = FastAPI(title="AgentX RAG API")

origins = [
    os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"),
    "http://127.0.0.1:5173",
    "*",  # dev convenience
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/assist", response_model=AssistResponse)
def assist(issue: str = Query(..., description="One of: limit_exceeded, no_payee, fraud"), top_k: int = 3):
    if issue not in ISSUE_MAP:
        raise HTTPException(status_code=400, detail=f"Unsupported issue '{issue}'.")
    try:
        result = run_case(category=ISSUE_MAP[issue], top_k=top_k)
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG error: {e}")

    parsed = _parse_answer(result.get("answer", ""))
    chunks = []
    for ch in result.get("chunks", [])[:top_k]:
        snippet = (ch.get("text") or "").strip().replace("\n", " ")
        if len(snippet) > 280:
            snippet = snippet[:277] + "…"
        chunks.append(
            {
                "id": ch.get("id"),
                "score": ch.get("score"),
                "source": ch.get("source"),
                "text": snippet,
            }
        )

    if not parsed.get("issue") and chunks:
        parsed["issue"] = f"Guidance for {issue.replace('_', ' ')}"
    if not parsed.get("solve") and chunks:
        parsed["solve"] = "Follow the recommended steps below."

    return AssistResponse(
        issue=parsed["issue"],
        solve=parsed["solve"],
        step_by_step_guide=parsed["step_by_step_guide"],
        chunks=chunks,
    )


@app.get("/api/health")
def health():
    return {"ok": True}

