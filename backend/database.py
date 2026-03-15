import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "knowledge.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS knowledge (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                source_type TEXT NOT NULL,
                source_url TEXT,
                tags TEXT DEFAULT '',
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)
        conn.commit()


def add_knowledge(title: str, content: str, source_type: str, source_url: str = None, tags: str = "") -> int:
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO knowledge (title, content, source_type, source_url, tags) VALUES (?, ?, ?, ?, ?)",
            (title, content, source_type, source_url, tags),
        )
        conn.commit()
        return cursor.lastrowid


def get_all_knowledge():
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT id, title, source_type, source_url, tags, created_at, LENGTH(content) as content_length "
            "FROM knowledge ORDER BY created_at DESC"
        ).fetchall()
        return [dict(row) for row in rows]


def get_knowledge_by_id(knowledge_id: int):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM knowledge WHERE id = ?", (knowledge_id,)).fetchone()
        return dict(row) if row else None


def delete_knowledge(knowledge_id: int):
    with get_connection() as conn:
        conn.execute("DELETE FROM knowledge WHERE id = ?", (knowledge_id,))
        conn.commit()


def search_knowledge(query: str, limit: int = 6) -> list:
    """Keyword relevance search across title and content."""
    keywords = [w.lower() for w in query.split() if len(w) > 2]
    if not keywords:
        # Return latest entries if no meaningful keywords
        with get_connection() as conn:
            rows = conn.execute(
                "SELECT id, title, content, source_type, source_url FROM knowledge ORDER BY created_at DESC LIMIT ?",
                (limit,),
            ).fetchall()
            return [dict(r) for r in rows]

    with get_connection() as conn:
        all_rows = conn.execute(
            "SELECT id, title, content, source_type, source_url FROM knowledge"
        ).fetchall()

    scored = []
    for row in all_rows:
        text = (row["title"] + " " + row["content"]).lower()
        score = sum(1 for kw in keywords if kw in text)
        if score > 0:
            scored.append((score, dict(row)))

    scored.sort(key=lambda x: -x[0])
    return [item for _, item in scored[:limit]]


def get_knowledge_context(query: str, max_chars: int = 10000) -> str:
    """Build a condensed knowledge context string for the given query."""
    relevant = search_knowledge(query)
    if not relevant:
        return ""

    parts = []
    total = 0
    for item in relevant:
        snippet = item["content"][:2500]
        chunk = f"### [{item['source_type'].upper()}] {item['title']}\n{snippet}"
        if total + len(chunk) > max_chars:
            break
        parts.append(chunk)
        total += len(chunk)

    return "\n\n---\n\n".join(parts)
