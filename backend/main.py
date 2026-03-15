import os
import json
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import anthropic

from database import (
    init_db,
    add_knowledge,
    get_all_knowledge,
    get_knowledge_by_id,
    delete_knowledge,
    get_knowledge_context,
)
from ingestion import fetch_url_content, fetch_youtube_transcript

# ---------------------------------------------------------------------------
# Bootstrap
# ---------------------------------------------------------------------------
load_dotenv()
init_db()

app = FastAPI(title="College Advisor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

claude = anthropic.Anthropic()

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------
SYSTEM_PROMPT_TEMPLATE = """\
You are **CollegeGuide AI** — a warm, knowledgeable, and encouraging college advisor.
Your mission is to help students, parents, and counselors navigate every stage of the
college journey: research, applications, essays, financial aid, and beyond.

{knowledge_section}

You have access to a **web search** tool. Use it proactively to find the latest
deadlines, acceptance rates, scholarship opportunities, or any information that would
help the student.

Core expertise:
- College list building & fit assessment
- Application strategy (Common App, Coalition, UC system, etc.)
- Essay brainstorming and review tips
- Financial aid, scholarships & FAFSA/CSS Profile
- Standardized testing (SAT, ACT, AP, IB, TOEFL)
- Extracurriculars, leadership & demonstrated interest
- Letters of recommendation guidance
- Interviews — preparation and common questions
- Waitlist strategy and deferral response letters
- Transfer applications
- Major selection & career alignment
- International student admissions

Always be specific, cite sources when you search, and tailor advice to the student's
unique situation. End responses with a follow-up question to keep the conversation going.\
"""


def build_system_prompt(query: str) -> str:
    ctx = get_knowledge_context(query)
    if ctx:
        knowledge_section = (
            "## Your Curated Knowledge Base\n"
            "The following resources have been added by the advisor team — "
            "use this information when relevant:\n\n"
            f"{ctx}"
        )
    else:
        knowledge_section = ""
    return SYSTEM_PROMPT_TEMPLATE.format(knowledge_section=knowledge_section)


# ---------------------------------------------------------------------------
# Chat endpoint (Server-Sent Events streaming)
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []


async def _sse_stream(message: str, history: List[dict]):
    """Yield SSE data frames while streaming Claude's response."""
    system = build_system_prompt(message)
    messages = history + [{"role": "user", "content": message}]
    tools = [{"type": "web_search_20260209", "name": "web_search"}]

    max_continuations = 5
    for _ in range(max_continuations):
        try:
            with claude.messages.stream(
                model="claude-opus-4-6",
                max_tokens=4096,
                system=system,
                tools=tools,
                messages=messages,
            ) as stream:
                for event in stream:
                    etype = getattr(event, "type", None)

                    if etype == "content_block_start":
                        block = getattr(event, "content_block", None)
                        if block and getattr(block, "type", None) == "tool_use":
                            if getattr(block, "name", None) == "web_search":
                                yield f"data: {json.dumps({'type': 'searching'})}\n\n"

                    elif etype == "content_block_delta":
                        delta = getattr(event, "delta", None)
                        if delta and getattr(delta, "type", None) == "text_delta":
                            yield f"data: {json.dumps({'type': 'text', 'content': delta.text})}\n\n"

                final = stream.get_final_message()

            if final.stop_reason != "pause_turn":
                break

            # Server-side tool loop hit limit — continue
            messages.append({"role": "assistant", "content": final.content})

        except anthropic.APIError as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
            return

    yield f"data: {json.dumps({'type': 'done'})}\n\n"


@app.post("/api/chat")
async def chat(req: ChatRequest):
    history = [{"role": m.role, "content": m.content} for m in req.history]
    return StreamingResponse(
        _sse_stream(req.message, history),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ---------------------------------------------------------------------------
# Admin — Knowledge CRUD
# ---------------------------------------------------------------------------

class TextPayload(BaseModel):
    title: str
    content: str
    tags: str = ""


class UrlPayload(BaseModel):
    url: str
    tags: str = ""


class YoutubePayload(BaseModel):
    url: str
    tags: str = ""


@app.post("/api/admin/knowledge/text")
async def ingest_text(payload: TextPayload):
    if not payload.title.strip() or not payload.content.strip():
        raise HTTPException(status_code=400, detail="Title and content are required.")
    kid = add_knowledge(payload.title.strip(), payload.content.strip(), "text", tags=payload.tags)
    return {"id": kid, "message": "Text knowledge saved successfully."}


@app.post("/api/admin/knowledge/url")
async def ingest_url(payload: UrlPayload):
    try:
        title, content = fetch_url_content(payload.url)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    kid = add_knowledge(title, content, "url", source_url=payload.url, tags=payload.tags)
    return {"id": kid, "title": title, "message": "URL content fetched and saved."}


@app.post("/api/admin/knowledge/youtube")
async def ingest_youtube(payload: YoutubePayload):
    try:
        title, transcript = fetch_youtube_transcript(payload.url)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    kid = add_knowledge(title, transcript, "youtube", source_url=payload.url, tags=payload.tags)
    return {"id": kid, "title": title, "message": "YouTube transcript saved."}


@app.get("/api/admin/knowledge")
async def list_knowledge():
    return get_all_knowledge()


@app.get("/api/admin/knowledge/{kid}")
async def get_knowledge(kid: int):
    item = get_knowledge_by_id(kid)
    if not item:
        raise HTTPException(status_code=404, detail="Knowledge entry not found.")
    return item


@app.delete("/api/admin/knowledge/{kid}")
async def remove_knowledge(kid: int):
    if not get_knowledge_by_id(kid):
        raise HTTPException(status_code=404, detail="Knowledge entry not found.")
    delete_knowledge(kid)
    return {"message": "Deleted successfully."}


# ---------------------------------------------------------------------------
# Serve frontend static files (must be last)
# ---------------------------------------------------------------------------
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
