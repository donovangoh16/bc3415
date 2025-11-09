# AgentX — Banking Agent Assistant

AgentX helps customer service agents resolve banking transfer issues quickly with a Retrieval‑Augmented Generation (RAG) pipeline, a clean API, and a polished demo UI.

The system builds a local FAISS index from PDFs and scraped FAQs, retrieves the most relevant guidance, and generates a short, structured response (issue, recommended action, and step‑by‑step steps) for the agent.

## Overview
- Backend: Python RAG with FAISS + LangChain + OpenAI, exposed via FastAPI.
- Frontend: Vite + React + TypeScript + Tailwind + Framer Motion.
- Demo: Three realistic chats (limit_exceeded, no_payee, fraud) with an “Use AgentX” action that fetches guidance and sources.

## Pipeline (End‑to‑End)
1. Collect — Load PDFs and scraped FAQs
2. Chunk + Embed — Split text and embed with MiniLM; save FAISS index
3. Retrieve + Rank — Query vector store for top‑K relevant chunks
4. Generate — LLM produces concise JSON (issue, solve, step_by_step_guide)
5. Present — Frontend renders an actionable checklist with source snippets

## Repository Structure
- `build_index.py` — Builds FAISS from `docs/` PDFs and `uob_payments_transfer_services.json`
- `rag.py` — Loads FAISS, retrieves context, and runs the QA chain
- `api/main.py` — FastAPI wrapper (`/api/assist`) with JSON normalization
- `web_scraper.py` — Scrapes UOB FAQs to JSON
- `agentx/` — Vite React UI (landing + demo)
  - `src/pages/Landing.tsx` — Landing with animated “How it works”
  - `src/pages/Demo.tsx` — Scenario selection (3 chats)
  - `src/pages/ChatDetail.tsx` — Chat + AgentX panel
  - `src/components/AgentXPanel.tsx` — Calls API and renders guidance

## Prerequisites
- Python 3.9+
- Node.js 18+
- `.env` at repo root with your OpenAI key:
  - `OPENAI_API_KEY=...`
  - Optional: `OPENAI_MODEL=gpt-4o-mini`, `RAG_TOP_K=3`

## Setup
1. Install Python dependencies:
   - `python3 -m pip install -r requirements.txt`
2. Build the index (first run or after changing documents):
   - `python3 build_index.py`
3. Start the API:
   - `python3 -m uvicorn api.main:app --reload --port 8000`
   - Health: `GET http://127.0.0.1:8000/api/health` → `{ "ok": true }`
4. Start the UI:
   - `cd agentx && npm install`
   - `npm run dev` (http://127.0.0.1:5173)

The UI proxies `/api` → `http://127.0.0.1:8000` during development.

## API
`GET /api/assist` — Return structured guidance for a scenario.
- Query params:
  - `issue` (required): `limit_exceeded | no_payee | fraud`
  - `top_k` (optional): number of chunks to retrieve (default 3)
- Response JSON:
```
{
  "issue": "short summary",
  "solve": "recommended action",
  "step_by_step_guide": ["Step 1 ...", "Step 2 ..."],
  "chunks": [
    { "id": "bankxxx-0-1", "score": 0.43, "source": "docs/file.pdf#0", "text": "snippet..." }
  ]
}
```

## Demo UI
- Landing page: minimal hero with animated “How it works” pipeline
- Demo page: three chats with fake names and one‑line issues
- Chat view: realistic message bubbles with timestamps; “Use AgentX” shows a progress indicator, then an actionable checklist with sources

## Configuration
- `.env` (root):
  - `OPENAI_API_KEY` — required
  - `OPENAI_MODEL` — defaults to `gpt-4o-mini`
  - `RAG_TOP_K` — defaults to `3`
- Vite proxy: `agentx/vite.config.ts` proxies `/api` to `127.0.0.1:8000`.

