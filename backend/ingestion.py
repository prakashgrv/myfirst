import re
import requests
from bs4 import BeautifulSoup
from youtube_transcript_api import YouTubeTranscriptApi


def fetch_url_content(url: str) -> tuple[str, str]:
    """Fetch and extract readable text from any URL."""
    headers = {"User-Agent": "Mozilla/5.0 (compatible; CollegeAdvisorBot/1.0)"}
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        raise ValueError(f"Failed to fetch URL: {e}")

    soup = BeautifulSoup(response.text, "html.parser")

    # Remove noise elements
    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "iframe"]):
        tag.decompose()

    title = soup.title.string.strip() if soup.title and soup.title.string else url

    # Prefer article/main content
    main = soup.find("article") or soup.find("main") or soup.find("body")
    text_raw = main.get_text(separator="\n", strip=True) if main else soup.get_text(separator="\n", strip=True)

    lines = [line.strip() for line in text_raw.splitlines() if line.strip()]
    text = "\n".join(lines)

    if len(text) < 50:
        raise ValueError("Page content is too short or could not be extracted.")

    return title, text


def extract_youtube_id(url: str) -> str | None:
    """Extract video ID from various YouTube URL formats."""
    patterns = [
        r"(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([^&\n?#]+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def fetch_youtube_transcript(url: str) -> tuple[str, str]:
    """Fetch the transcript of a YouTube video."""
    video_id = extract_youtube_id(url)
    if not video_id:
        raise ValueError("Could not extract a YouTube video ID from the URL.")

    try:
        entries = YouTubeTranscriptApi.get_transcript(video_id)
        transcript = " ".join(e["text"] for e in entries)
    except Exception as e:
        raise ValueError(f"Failed to fetch YouTube transcript: {e}")

    # Try to get the video title via oEmbed
    try:
        oembed = requests.get(
            f"https://www.youtube.com/oembed?url={url}&format=json",
            timeout=10,
        ).json()
        title = oembed.get("title", f"YouTube Video {video_id}")
    except Exception:
        title = f"YouTube Video {video_id}"

    return title, transcript
