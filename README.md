# 🎓 CollegeGuide AI

An AI-powered college advisor app built with Claude Opus 4.6. Features a chat interface for students and an admin panel for building a curated knowledge base from multiple sources.

---

## Features

### 💬 Chat (Student-Facing)
- Real-time streaming responses powered by **Claude Opus 4.6**
- **Web search** built in — Claude proactively looks up latest deadlines, acceptance rates, scholarships
- Voice input via browser Speech API
- Suggested starter questions
- Persistent conversation history within session

### ⚙ Admin Panel (Back Office)
Add knowledge from multiple sources:
| Source | Description |
|--------|-------------|
| 📝 Text | Paste raw text or notes directly |
| 🌐 URL / Coda | Fetch any public page (Coda docs, College Board, etc.) |
| ▶ YouTube | Extract transcript from any captioned video |
| 🎤 Speech | Dictate notes via microphone |

- View, filter, and delete knowledge entries
- Knowledge is automatically injected as context when answering related questions

---

## Quick Start

### 1. Set up API key
```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 2. Run the app
```bash
./start.sh
```

The script installs Python dependencies and starts the server.

- **Chat:** http://localhost:8000/index.html
- **Admin:** http://localhost:8000/admin.html

---

## Architecture

```
myfirst/
├── backend/
│   ├── main.py          # FastAPI app — chat SSE endpoint + admin API
│   ├── database.py      # SQLite knowledge base (CRUD + keyword search)
│   ├── ingestion.py     # URL fetcher, YouTube transcript extractor
│   └── requirements.txt
├── frontend/
│   ├── index.html       # Chat interface (streaming SSE, voice input)
│   └── admin.html       # Admin panel (4 ingestion tabs + knowledge list)
├── .env.example
├── start.sh
└── README.md
```

### Tech Stack
- **Backend:** Python, FastAPI, SQLite
- **AI:** Claude Opus 4.6 (`claude-opus-4-6`) with `web_search_20260209` tool
- **Frontend:** Vanilla HTML/CSS/JS — no build step required

---

## Roadmap

The app is designed to grow into a full **AI Counsellor** platform:

- [ ] Step-by-step college application checklist / guided workflow
- [ ] Student profiles (save preferences, target schools, deadlines)
- [ ] Essay review & feedback tool
- [ ] Scholarship matching engine
- [ ] Calendar integration for application deadlines
- [ ] Coda API integration for direct page sync
- [ ] Multi-user support with authentication
- [ ] Vector embeddings for smarter knowledge retrieval
