#!/usr/bin/env python3
"""
StrategicAI — Competitive Intelligence Scraper & Pre-Processing Pipeline
=========================================================================
Collects technology and strategy news from major tech company blogs and
prepares structured data for Elasticsearch + an AI strategy-advisor agent.

Outputs
-------
- tech_news_raw.csv         : All scraped articles (raw)
- important_tech_news.csv   : Filtered non-"General" articles
- tech_news.jsonl           : One JSON object per line (Elasticsearch-ready)
- company_strategy.csv      : Editable company strategy profiles (prefilled)

Usage
-----
    python scraper.py --config sources.json --limit 50
    python scraper.py --config sources.json --since 2025-01-01
    python scraper.py --test          # run built-in unit test

See README.md for full setup and configuration details.
"""

from __future__ import annotations

import argparse
import csv
import datetime
import hashlib
import html
import json
import logging
import os
import re
import sys
import time
import unicodedata
from difflib import SequenceMatcher
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

# ---------------------------------------------------------------------------
#  Third-party imports (with graceful fallbacks)
# ---------------------------------------------------------------------------
try:
    import requests
    from requests.adapters import HTTPAdapter
except ImportError:
    sys.exit(
        "ERROR: 'requests' is required.  Install with:  pip install requests"
    )

try:
    from bs4 import BeautifulSoup
except ImportError:
    sys.exit(
        "ERROR: 'beautifulsoup4' is required.  Install with:  pip install beautifulsoup4"
    )

try:
    import pandas as pd
except ImportError:
    sys.exit(
        "ERROR: 'pandas' is required.  Install with:  pip install pandas"
    )

# Optional: tenacity for retries (fallback provided below)
_HAS_TENACITY = False
try:
    from tenacity import (
        retry,
        stop_after_attempt,
        wait_exponential,
        retry_if_exception_type,
    )
    _HAS_TENACITY = True
except ImportError:
    pass

# ---------------------------------------------------------------------------
#  Logging setup
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("strategicai_scraper")

# ---------------------------------------------------------------------------
#  Constants & Configuration
# ---------------------------------------------------------------------------
USER_AGENT = (
    "StrategicAI-Bot/1.0 "
    "(+https://github.com/strategicai; competitive-intelligence research)"
)
DEFAULT_TIMEOUT = 30          # seconds
DEFAULT_RATE_LIMIT = 2.0      # seconds between requests per domain
MAX_RETRIES = 3
RETRY_BACKOFF_FACTOR = 2      # exponential backoff multiplier
MIN_TITLE_LENGTH = 20         # ignore garbage titles shorter than this
SUMMARY_MIN_CHARS = 150
SUMMARY_MAX_CHARS = 250
DEDUP_SIMILARITY_THRESHOLD = 0.85

# ── Category keyword map (case-insensitive) ──────────────────────────────
CATEGORY_KEYWORDS: Dict[str, List[str]] = {
    "AI_ML": [
        "ai", "artificial intelligence", "machine learning", "llm", "genai",
        "deep learning", "neural network", "generative ai", "copilot",
        "large language model", "transformer", "gpt", "gemini",
    ],
    "Cloud": [
        "cloud", "azure", "aws", "gcp", "cloud service", "saas", "iaas",
        "paas", "serverless", "kubernetes", "containers",
    ],
    "Cybersecurity": [
        "security", "vulnerability", "threat", "ransomware", "privacy",
        "zero trust", "encryption", "firewall", "malware",
    ],
    "Data_Analytics": [
        "data", "analytics", "big data", "data lake", "etl",
        "data warehouse", "business intelligence", "bi",
    ],
    "Automation": [
        "automation", "robot", "workflow", "rpa", "orchestration",
    ],
    "Emerging_Tech": [
        "quantum", "blockchain", "edge", "5g", "iot", "metaverse", "ar", "vr",
    ],
    "Government_Policy": [
        "regulation", "policy", "compliance", "law", "legislation",
        "government", "gdpr",
    ],
    "Skills_Jobs": [
        "job", "career", "hiring", "skill", "training", "certification",
        "workforce", "talent",
    ],
    "Business_Strategy": [
        "investment", "partnership", "acquisition", "strategy", "pricing",
        "market", "revenue", "growth",
    ],
}

# ── Insight-type keyword map ─────────────────────────────────────────────
INSIGHT_KEYWORDS: Dict[str, List[str]] = {
    "Product_Launch": ["launch", "announcing", "now available", "introducing", "releases", "unveiled"],
    "Partnership":    ["partner", "partnership", "collaborate", "collaboration", "alliance"],
    "Acquisition":    ["acquire", "acquisition", "acquired", "merger"],
    "Investment":     ["invest", "fund", "investment", "funding", "venture"],
    "Research":       ["paper", "research", "study", "model", "benchmark", "arxiv"],
    "Cloud_Update":   ["region", "service", "availability zone", "beta", "preview", "general availability"],
    "Security_Alert": ["vulnerability", "patch", "security advisory", "cve", "exploit"],
    "Regulation_Policy": ["regulation", "policy", "compliance", "regulatory"],
    "Developer_Tool": ["sdk", "api", "cli", "tooling", "developer", "open source", "github"],
    "Training_Cert":  ["training", "certification", "course", "learning path", "exam"],
}

# ── Default sources (used when no config file provided) ──────────────────
DEFAULT_SOURCES = [
    {"name": "Google",    "url": "https://blog.google/",              "enabled": True},
    {"name": "Microsoft", "url": "https://blogs.microsoft.com/",      "enabled": True},
    {"name": "AWS",       "url": "https://aws.amazon.com/blogs/",     "enabled": True},
]

# =========================================================================
#  HTTP Layer — Fetch with retries, backoff, robots.txt respect
# =========================================================================

_robots_cache: Dict[str, RobotFileParser] = {}
_last_request_time: Dict[str, float] = {}


def _get_session() -> requests.Session:
    """Create a requests session with retry adapter."""
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})
    adapter = HTTPAdapter(max_retries=0)  # we handle retries ourselves
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


_session = _get_session()


def _check_robots_txt(url: str) -> bool:
    """Return True if robots.txt allows fetching *url* for our User-Agent."""
    parsed = urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"

    if robots_url not in _robots_cache:
        rp = RobotFileParser()
        rp.set_url(robots_url)
        try:
            rp.read()
        except Exception:
            # If we can't read robots.txt, assume allowed
            logger.debug("Could not fetch robots.txt for %s — assuming allowed", parsed.netloc)
            _robots_cache[robots_url] = None  # type: ignore[assignment]
            return True
        _robots_cache[robots_url] = rp

    rp = _robots_cache[robots_url]
    if rp is None:
        return True
    return rp.can_fetch(USER_AGENT, url)


def _rate_limit(domain: str, delay: float = DEFAULT_RATE_LIMIT) -> None:
    """Sleep if needed to respect rate-limiting per domain."""
    now = time.time()
    last = _last_request_time.get(domain, 0.0)
    wait = delay - (now - last)
    if wait > 0:
        logger.debug("Rate-limiting %s — sleeping %.1fs", domain, wait)
        time.sleep(wait)
    _last_request_time[domain] = time.time()


def fetch_page(
    url: str,
    *,
    timeout: int = DEFAULT_TIMEOUT,
    rate_limit: float = DEFAULT_RATE_LIMIT,
    respect_robots: bool = True,
) -> Optional[str]:
    """
    Fetch a single URL with retries, rate-limiting, and robots.txt checks.

    Returns the decoded HTML string, or None on failure.
    """
    if respect_robots and not _check_robots_txt(url):
        logger.warning("Blocked by robots.txt: %s", url)
        return None

    domain = urlparse(url).netloc
    _rate_limit(domain, rate_limit)

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logger.debug("Fetching (attempt %d/%d): %s", attempt, MAX_RETRIES, url)
            resp = _session.get(url, timeout=timeout)
            resp.raise_for_status()
            return resp.text
        except requests.exceptions.HTTPError as exc:
            logger.warning("HTTP %s for %s (attempt %d)", exc.response.status_code, url, attempt)
        except requests.exceptions.ConnectionError as exc:
            logger.warning("Connection error for %s (attempt %d): %s", url, attempt, exc)
        except requests.exceptions.Timeout:
            logger.warning("Timeout for %s (attempt %d)", url, attempt)
        except requests.exceptions.RequestException as exc:
            logger.warning("Request error for %s (attempt %d): %s", url, attempt, exc)

        if attempt < MAX_RETRIES:
            sleep_time = RETRY_BACKOFF_FACTOR ** attempt
            logger.info("Retrying in %.0fs …", sleep_time)
            time.sleep(sleep_time)

    logger.error("Failed after %d attempts: %s", MAX_RETRIES, url)
    return None


# =========================================================================
#  HTML Cleaning & Text Extraction
# =========================================================================

def clean_text(raw_html: str) -> str:
    """
    Remove HTML tags, scripts, styles, excessive whitespace,
    normalize unicode, and strip non-printable characters.
    """
    soup = BeautifulSoup(raw_html, "html.parser")
    # Remove script and style elements
    for tag in soup(["script", "style", "noscript", "iframe", "svg"]):
        tag.decompose()
    text = soup.get_text(separator=" ")
    # Decode HTML entities
    text = html.unescape(text)
    # Normalize unicode (NFC)
    text = unicodedata.normalize("NFC", text)
    # Remove non-printable characters (keep newlines & tabs temporarily)
    text = re.sub(r"[^\S \n]+", " ", text)
    # Collapse whitespace
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def extract_summary(text: str, meta_desc: Optional[str] = None) -> str:
    """
    Return a short summary: prefer meta description, else first 150-250
    chars of article body (breaking at sentence or word boundary).
    """
    if meta_desc and len(meta_desc.strip()) >= 50:
        return meta_desc.strip()[:SUMMARY_MAX_CHARS]

    if not text:
        return ""

    # Take first ~250 chars, break at last full stop or space
    snippet = text[:SUMMARY_MAX_CHARS]
    # Try to break at a sentence boundary
    last_period = snippet.rfind(".")
    if last_period > SUMMARY_MIN_CHARS:
        return snippet[: last_period + 1]
    # Fall back to word boundary
    last_space = snippet.rfind(" ")
    if last_space > SUMMARY_MIN_CHARS:
        return snippet[:last_space] + "…"
    return snippet + "…"


def compute_confidence(article: Dict[str, Any]) -> float:
    """
    Compute a 0–1 confidence score for content completeness.

    Weights: title (0.15), url (0.10), published_date (0.15),
             author (0.10), summary (0.15), full_text (0.25), tags (0.10)
    """
    score = 0.0
    if article.get("title") and len(article["title"]) >= MIN_TITLE_LENGTH:
        score += 0.15
    if article.get("url"):
        score += 0.10
    if article.get("published_date"):
        score += 0.15
    if article.get("author"):
        score += 0.10
    if article.get("short_summary") and len(article["short_summary"]) > 50:
        score += 0.15
    if article.get("full_text") and len(article["full_text"]) > 200:
        score += 0.25
    if article.get("tags"):
        score += 0.10
    return round(score, 2)


# =========================================================================
#  Index & Article Parsing (per-source)
# =========================================================================

def parse_index(
    html_content: str,
    base_url: str,
    source_name: str,
) -> List[Dict[str, str]]:
    """
    Parse an index/blog listing page and return a list of article stubs:
    [{"url": absolute_url, "title": title_text, "company": source_name}, ...]

    Handles relative-to-absolute URL conversion.
    """
    soup = BeautifulSoup(html_content, "html.parser")
    articles: List[Dict[str, str]] = []
    seen_urls: set = set()

    # Strategy: find <a> tags that look like article links
    # — typically inside <article>, <h2>, <h3>, or list items within main content
    # Try article/heading selectors first, then fall back to all links
    candidate_anchors = []

    # Priority selectors for known blog structures
    selectors = [
        "article a",
        "h2 a", "h3 a",
        ".post a", ".entry a", ".blog-post a",
        ".feed-item a", ".card a",
        "main a", "#content a",
        "[role='main'] a",
    ]
    for sel in selectors:
        candidate_anchors.extend(soup.select(sel))

    if not candidate_anchors:
        # Fallback: all anchors
        candidate_anchors = soup.find_all("a", href=True)

    for a_tag in candidate_anchors:
        href = a_tag.get("href", "")
        if not href or href.startswith("#") or href.startswith("javascript:"):
            continue

        abs_url = urljoin(base_url, href)
        parsed = urlparse(abs_url)

        # Basic heuristic: article URLs tend to have path depth > 1
        path_parts = [p for p in parsed.path.split("/") if p]
        if len(path_parts) < 1:
            continue

        # Skip common non-article links
        skip_patterns = [
            "/tag/", "/category/", "/author/", "/page/",
            "/feed", "/rss", "/xml", "/search",
            ".xml", ".rss", ".json", ".css", ".js", ".png", ".jpg",
            "/login", "/signup", "/subscribe", "/newsletter",
            "/about", "/contact", "/privacy", "/terms",
        ]
        lower_path = parsed.path.lower()
        if any(pat in lower_path for pat in skip_patterns):
            continue

        # Deduplicate within this index page
        normalized_url = abs_url.rstrip("/").lower()
        if normalized_url in seen_urls:
            continue
        seen_urls.add(normalized_url)

        title = a_tag.get_text(strip=True)
        if not title or len(title) < 5:
            title = ""  # will try to get from article page later

        articles.append({
            "url": abs_url,
            "title": title,
            "company": source_name,
        })

    logger.info("Found %d candidate article links on %s", len(articles), base_url)
    return articles


def fetch_index(
    source: Dict[str, Any],
    *,
    limit: Optional[int] = None,
    rate_limit: float = DEFAULT_RATE_LIMIT,
) -> List[Dict[str, str]]:
    """
    Fetch the index page for a source and return article stubs.
    """
    url = source["url"]
    name = source["name"]
    logger.info("Fetching index for %s: %s", name, url)

    html_content = fetch_page(url, rate_limit=rate_limit)
    if not html_content:
        logger.error("Could not fetch index page for %s", name)
        return []

    stubs = parse_index(html_content, url, name)

    if limit and len(stubs) > limit:
        logger.info("Limiting %s articles to %d (--limit)", name, limit)
        stubs = stubs[:limit]

    return stubs


def parse_article(html_content: str, url: str, company: str) -> Dict[str, Any]:
    """
    Parse a single article page and extract structured fields.

    Returns a dict with: company, title, url, published_date, author,
    short_summary, full_text, tags, crawl_date.
    """
    soup = BeautifulSoup(html_content, "html.parser")

    # ── Title ─────────────────────────────────────────────────────────
    title = ""
    # Try <h1> first, then <title>, then og:title
    h1 = soup.find("h1")
    if h1:
        title = h1.get_text(strip=True)
    if not title:
        title_tag = soup.find("title")
        if title_tag:
            title = title_tag.get_text(strip=True)
    if not title:
        og_title = soup.find("meta", attrs={"property": "og:title"})
        if og_title:
            title = og_title.get("content", "")

    # ── Published date ────────────────────────────────────────────────
    published_date = ""
    # Try <time> tag
    time_tag = soup.find("time")
    if time_tag:
        published_date = time_tag.get("datetime", "") or time_tag.get_text(strip=True)
    # Try meta article:published_time
    if not published_date:
        meta_date = soup.find("meta", attrs={"property": "article:published_time"})
        if meta_date:
            published_date = meta_date.get("content", "")
    if not published_date:
        meta_date = soup.find("meta", attrs={"name": "date"})
        if meta_date:
            published_date = meta_date.get("content", "")

    # Normalize date to YYYY-MM-DD if possible
    published_date = _normalize_date(published_date)

    # ── Author ────────────────────────────────────────────────────────
    author = ""
    meta_author = soup.find("meta", attrs={"name": "author"})
    if meta_author:
        author = meta_author.get("content", "")
    if not author:
        # Try common author selectors
        for sel in [".author", ".byline", "[rel='author']", ".post-author"]:
            el = soup.select_one(sel)
            if el:
                author = el.get_text(strip=True)
                break

    # ── Tags / Categories ─────────────────────────────────────────────
    tags: List[str] = []
    # Meta keywords
    meta_kw = soup.find("meta", attrs={"name": "keywords"})
    if meta_kw and meta_kw.get("content"):
        tags.extend([t.strip() for t in meta_kw["content"].split(",") if t.strip()])
    # article:tag meta (multiple possible)
    for mt in soup.find_all("meta", attrs={"property": "article:tag"}):
        if mt.get("content"):
            tags.append(mt["content"].strip())
    # .tag, .category links
    for sel in [".tag a", ".tags a", ".category a", ".categories a"]:
        for el in soup.select(sel):
            t = el.get_text(strip=True)
            if t:
                tags.append(t)
    tags = list(dict.fromkeys(tags))  # deduplicate while preserving order

    # ── Meta description ──────────────────────────────────────────────
    meta_desc = ""
    md_tag = soup.find("meta", attrs={"name": "description"})
    if md_tag and md_tag.get("content"):
        meta_desc = md_tag["content"]
    if not meta_desc:
        og_desc = soup.find("meta", attrs={"property": "og:description"})
        if og_desc and og_desc.get("content"):
            meta_desc = og_desc["content"]

    # ── Full text ─────────────────────────────────────────────────────
    # Try to find the main content area
    body_el = None
    for sel in ["article", "[role='main']", "main", ".post-content",
                ".entry-content", ".article-body", ".blog-content",
                "#content", ".content"]:
        body_el = soup.select_one(sel)
        if body_el:
            break
    if body_el is None:
        body_el = soup.find("body") or soup

    full_text = clean_text(str(body_el))

    # ── Summary ───────────────────────────────────────────────────────
    short_summary = extract_summary(full_text, meta_desc)

    return {
        "company": company,
        "title": title,
        "url": url,
        "published_date": published_date,
        "author": author,
        "short_summary": short_summary,
        "full_text": full_text,
        "tags": tags,
        "crawl_date": datetime.date.today().isoformat(),
    }


def fetch_article(
    stub: Dict[str, str],
    *,
    rate_limit: float = DEFAULT_RATE_LIMIT,
) -> Optional[Dict[str, Any]]:
    """Fetch and parse a single article given its stub (url, title, company)."""
    url = stub["url"]
    company = stub["company"]
    logger.info("Fetching article: %s", url)

    html_content = fetch_page(url, rate_limit=rate_limit)
    if not html_content:
        return None

    article = parse_article(html_content, url, company)

    # Use pre-fetched title if the parsed one is missing
    if not article["title"] and stub.get("title"):
        article["title"] = stub["title"]

    return article


# =========================================================================
#  Date normalization helper
# =========================================================================

def _normalize_date(raw: str) -> str:
    """Attempt to normalize a date string to YYYY-MM-DD."""
    if not raw:
        return ""
    raw = raw.strip()

    # Already ISO
    iso_match = re.match(r"(\d{4}-\d{2}-\d{2})", raw)
    if iso_match:
        return iso_match.group(1)

    # Common patterns
    formats = [
        "%B %d, %Y",      # January 15, 2025
        "%b %d, %Y",      # Jan 15, 2025
        "%d %B %Y",       # 15 January 2025
        "%d %b %Y",       # 15 Jan 2025
        "%m/%d/%Y",       # 01/15/2025
        "%d/%m/%Y",       # 15/01/2025
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S%z",
    ]
    for fmt in formats:
        try:
            dt = datetime.datetime.strptime(raw[:30], fmt)
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            continue

    # Return raw if nothing works
    return raw[:10]


# =========================================================================
#  Categorization — keyword-based, multi-label
# =========================================================================

def classify(article: Dict[str, Any]) -> Tuple[List[str], Dict[str, List[str]]]:
    """
    Classify an article into categories using keyword matching.

    Returns
    -------
    categories : list of str
        Matched category names (may be empty → "General").
    matched_keywords : dict
        {category: [matched_keywords_list]}
    """
    text = " ".join([
        article.get("title", ""),
        article.get("short_summary", ""),
        article.get("full_text", "")[:2000],  # limit to first 2000 chars for speed
        " ".join(article.get("tags", [])),
    ]).lower()

    categories: List[str] = []
    matched_keywords: Dict[str, List[str]] = {}

    for category, keywords in CATEGORY_KEYWORDS.items():
        matches = [kw for kw in keywords if kw in text]
        if matches:
            categories.append(category)
            matched_keywords[category] = matches

    if not categories:
        categories = ["General"]

    return categories, matched_keywords


# =========================================================================
#  Insight extraction — best-match insight_type
# =========================================================================

def extract_insight(article: Dict[str, Any]) -> Tuple[str, List[str]]:
    """
    Derive a structured insight_type from the article text.

    Returns
    -------
    insight_type : str
        Best matching insight type, or "Other".
    supporting_phrases : list of str
        Keywords/phrases that matched.
    """
    text = " ".join([
        article.get("title", ""),
        article.get("short_summary", ""),
        article.get("full_text", "")[:2000],
    ]).lower()

    best_type = "Other"
    best_count = 0
    best_phrases: List[str] = []

    for insight_type, keywords in INSIGHT_KEYWORDS.items():
        matches = [kw for kw in keywords if kw in text]
        if len(matches) > best_count:
            best_type = insight_type
            best_count = len(matches)
            best_phrases = matches

    return best_type, best_phrases


# =========================================================================
#  Deduplication
# =========================================================================

def _normalize_for_dedup(text: str) -> str:
    """Lowercase, strip punctuation, collapse spaces for dedup comparison."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text


def deduplicate(articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Remove duplicate articles based on normalized title + URL similarity.
    Uses SequenceMatcher for fuzzy matching.
    """
    unique: List[Dict[str, Any]] = []
    seen_titles: List[str] = []
    seen_urls: List[str] = []

    for article in articles:
        norm_title = _normalize_for_dedup(article.get("title", ""))
        norm_url = article.get("url", "").rstrip("/").lower()

        is_dup = False
        for i, (st, su) in enumerate(zip(seen_titles, seen_urls)):
            title_sim = SequenceMatcher(None, norm_title, st).ratio()
            url_sim = SequenceMatcher(None, norm_url, su).ratio()
            # Duplicate if both title & URL are very similar, or title alone
            if title_sim > DEDUP_SIMILARITY_THRESHOLD and url_sim > 0.7:
                is_dup = True
                logger.debug("Duplicate detected: '%s'", article.get("title", "")[:60])
                break
            elif title_sim > 0.95:
                is_dup = True
                break

        if not is_dup:
            unique.append(article)
            seen_titles.append(norm_title)
            seen_urls.append(norm_url)

    removed = len(articles) - len(unique)
    if removed:
        logger.info("Removed %d duplicate articles", removed)
    return unique


# =========================================================================
#  Quality filters
# =========================================================================

def filter_quality(articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Remove articles that fail quality checks (garbage titles, etc.)."""
    filtered = []
    for a in articles:
        title = a.get("title", "")
        if len(title) < MIN_TITLE_LENGTH:
            logger.debug("Skipping short title (%d chars): '%s'", len(title), title)
            continue
        filtered.append(a)
    removed = len(articles) - len(filtered)
    if removed:
        logger.info("Filtered out %d low-quality articles", removed)
    return filtered


# =========================================================================
#  Date filter  (--since)
# =========================================================================

def filter_by_date(
    articles: List[Dict[str, Any]],
    since: str,
) -> List[Dict[str, Any]]:
    """Keep only articles with published_date >= since (YYYY-MM-DD)."""
    try:
        since_dt = datetime.datetime.strptime(since, "%Y-%m-%d").date()
    except ValueError:
        logger.warning("Invalid --since date '%s'. Skipping date filter.", since)
        return articles

    filtered = []
    for a in articles:
        pd_str = a.get("published_date", "")
        if not pd_str:
            # Keep articles without a date (we can't tell)
            filtered.append(a)
            continue
        try:
            art_dt = datetime.datetime.strptime(pd_str[:10], "%Y-%m-%d").date()
            if art_dt >= since_dt:
                filtered.append(a)
            else:
                logger.debug("Skipping old article (%s): %s", pd_str, a.get("title", "")[:50])
        except ValueError:
            filtered.append(a)  # keep if date can't be parsed
    removed = len(articles) - len(filtered)
    if removed:
        logger.info("Filtered out %d articles older than %s", removed, since)
    return filtered


# =========================================================================
#  Embedding stub (ready to integrate)
# =========================================================================

def create_embeddings(text_list: List[str]) -> List[List[float]]:
    """
    Generate vector embeddings for a list of texts.

    This is a STUB — returns empty lists by default.
    To enable, choose ONE of the two options below:

    ── Option A: OpenAI Embeddings ──────────────────────────────────────
    Requires: pip install openai
    Set env var: OPENAI_API_KEY=sk-...

        import openai
        openai.api_key = os.getenv("OPENAI_API_KEY")

        def create_embeddings(text_list):
            response = openai.embeddings.create(
                model="text-embedding-3-small",
                input=text_list
            )
            return [item.embedding for item in response.data]

    ── Option B: Local Sentence-Transformers ────────────────────────────
    Requires: pip install sentence-transformers

        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer("all-MiniLM-L6-v2")

        def create_embeddings(text_list):
            return model.encode(text_list).tolist()

    Parameters
    ----------
    text_list : list of str
        Texts to embed.

    Returns
    -------
    list of list[float]
        Embedding vectors (empty in stub mode).
    """
    # TODO: Uncomment one of the options above and add your API key
    logger.info(
        "create_embeddings() called with %d texts — STUB mode, returning empty.",
        len(text_list),
    )
    return [[] for _ in text_list]


# =========================================================================
#  Output: JSONL, CSV
# =========================================================================

def to_jsonl(articles: List[Dict[str, Any]], filepath: str) -> None:
    """
    Write articles to a JSONL file (one JSON object per line).

    Each object contains: company, title, url, published_date, categories,
    insight_type, summary, full_text, crawl_date.
    """
    with open(filepath, "w", encoding="utf-8") as f:
        for a in articles:
            record = {
                "company": a.get("company", ""),
                "title": a.get("title", ""),
                "url": a.get("url", ""),
                "published_date": a.get("published_date", ""),
                "categories": a.get("categories", []),
                "insight_type": a.get("insight_type", "Other"),
                "insight_keywords": a.get("insight_keywords", []),
                "summary": a.get("short_summary", ""),
                "full_text": a.get("full_text", ""),
                "crawl_date": a.get("crawl_date", ""),
                "author": a.get("author", ""),
                "tags": a.get("tags", []),
                "confidence": a.get("confidence", 0.0),
                "matched_category_keywords": a.get("matched_category_keywords", {}),
            }
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
    logger.info("Wrote %d records to %s", len(articles), filepath)


def to_csv(articles: List[Dict[str, Any]], filepath: str) -> None:
    """Save articles to CSV using pandas."""
    if not articles:
        logger.warning("No articles to write to %s", filepath)
        return

    # Flatten list/dict fields for CSV
    rows = []
    for a in articles:
        row = dict(a)
        row["tags"] = "; ".join(a.get("tags", []))
        row["categories"] = "; ".join(a.get("categories", []))
        row["insight_keywords"] = "; ".join(a.get("insight_keywords", []))
        row["matched_category_keywords"] = json.dumps(
            a.get("matched_category_keywords", {}), ensure_ascii=False
        )
        # Truncate full_text for CSV readability (keep full in JSONL)
        if len(row.get("full_text", "")) > 1000:
            row["full_text"] = row["full_text"][:1000] + "…"
        rows.append(row)

    df = pd.DataFrame(rows)
    col_order = [
        "company", "title", "url", "published_date", "author",
        "short_summary", "categories", "insight_type", "insight_keywords",
        "tags", "confidence", "crawl_date",
        "matched_category_keywords", "full_text",
    ]
    # Keep only columns that exist
    col_order = [c for c in col_order if c in df.columns]
    extra = [c for c in df.columns if c not in col_order]
    df = df[col_order + extra]

    df.to_csv(filepath, index=False, encoding="utf-8-sig")
    logger.info("Wrote %d rows to %s", len(df), filepath)


# =========================================================================
#  Config loader
# =========================================================================

def load_config(path: str) -> List[Dict[str, Any]]:
    """
    Load source list from a JSON (or YAML) config file.

    Expected format (JSON):
    [
      {"name": "Google", "url": "https://blog.google/", "enabled": true},
      ...
    ]
    """
    if not os.path.isfile(path):
        logger.error("Config file not found: %s", path)
        sys.exit(1)

    with open(path, "r", encoding="utf-8") as f:
        ext = os.path.splitext(path)[1].lower()
        if ext in (".yaml", ".yml"):
            try:
                import yaml  # type: ignore[import-untyped]
                sources = yaml.safe_load(f)
            except ImportError:
                logger.error("PyYAML not installed. Use JSON config or: pip install pyyaml")
                sys.exit(1)
        else:
            sources = json.load(f)

    if not isinstance(sources, list):
        logger.error("Config must be a JSON array of source objects.")
        sys.exit(1)

    # Filter enabled sources
    enabled = [s for s in sources if s.get("enabled", True)]
    logger.info("Loaded %d enabled sources from %s", len(enabled), path)
    return enabled


# =========================================================================
#  Built-in test
# =========================================================================

SAMPLE_HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>Announcing New AI Features for Cloud Developers — Google Blog</title>
    <meta name="description" content="Google introduces powerful new AI-driven tools for cloud developers, including Gemini Code Assist and enhanced Vertex AI capabilities.">
    <meta name="author" content="Sundar Pichai">
    <meta property="article:published_time" content="2025-06-15T10:00:00Z">
    <meta property="article:tag" content="AI">
    <meta property="article:tag" content="Cloud">
    <meta name="keywords" content="AI, Cloud, Developers, Gemini">
</head>
<body>
<article>
    <h1>Announcing New AI Features for Cloud Developers</h1>
    <time datetime="2025-06-15">June 15, 2025</time>
    <span class="author">By Sundar Pichai</span>
    <div class="post-content">
        <p>Today we are introducing a suite of new AI-powered tools designed to help
        cloud developers build smarter applications faster. These tools leverage the
        latest advances in machine learning and generative AI.</p>
        <p>Our new Gemini Code Assist feature provides real-time code suggestions and
        automated code review powered by our most capable AI model. Developers can now
        deploy AI models directly from Vertex AI with just a few clicks.</p>
        <p>We are also launching new partnerships with leading cloud service providers
        to bring these capabilities to a wider audience. The investment in AI
        infrastructure continues to accelerate.</p>
        <p>These updates are now available in preview for all Google Cloud customers.</p>
    </div>
    <div class="tags">
        <a href="/tag/ai">AI</a>
        <a href="/tag/cloud">Cloud</a>
        <a href="/tag/developers">Developers</a>
    </div>
</article>
<script>var tracking = "ignore me";</script>
</body>
</html>
"""


def test_parse_sample_html() -> None:
    """
    Built-in test: parse a hardcoded HTML article and verify extraction,
    classification, and insight logic.
    """
    print("\n" + "=" * 60)
    print("  RUNNING BUILT-IN TEST: test_parse_sample_html()")
    print("=" * 60)

    article = parse_article(SAMPLE_HTML, "https://blog.google/announcing-ai-features", "Google")

    # ── Assert basic fields ───────────────────────────────────────────
    assert article["title"] == "Announcing New AI Features for Cloud Developers", \
        f"Title mismatch: {article['title']}"
    assert article["company"] == "Google"
    assert article["url"] == "https://blog.google/announcing-ai-features"
    assert article["published_date"] == "2025-06-15", \
        f"Date mismatch: {article['published_date']}"
    assert article["author"] == "Sundar Pichai", \
        f"Author mismatch: {article['author']}"
    assert len(article["short_summary"]) >= 50, "Summary too short"
    assert "script" not in article["full_text"].lower()[:100], "Script tag not cleaned"
    assert "tracking" not in article["full_text"].lower(), "Script content not cleaned"
    assert len(article["tags"]) > 0, "No tags found"

    # ── Test classification ───────────────────────────────────────────
    categories, matched_kw = classify(article)
    assert "AI_ML" in categories, f"Expected AI_ML category, got {categories}"
    assert "Cloud" in categories, f"Expected Cloud category, got {categories}"

    # ── Test insight extraction ───────────────────────────────────────
    insight_type, phrases = extract_insight(article)
    assert insight_type != "Other", f"Expected specific insight, got {insight_type}"
    assert len(phrases) > 0, "No insight phrases found"

    # ── Test confidence score ─────────────────────────────────────────
    article["confidence"] = compute_confidence(article)
    assert article["confidence"] >= 0.7, f"Low confidence: {article['confidence']}"

    # ── Test clean_text ───────────────────────────────────────────────
    dirty = "<p>Hello <b>World</b></p><script>bad();</script>  extra   spaces"
    cleaned = clean_text(dirty)
    assert "bad()" not in cleaned
    assert "extra spaces" in cleaned or "extra" in cleaned

    # ── Print results ─────────────────────────────────────────────────
    print(f"\n  ✅ Title:          {article['title']}")
    print(f"  ✅ Company:        {article['company']}")
    print(f"  ✅ URL:            {article['url']}")
    print(f"  ✅ Published:      {article['published_date']}")
    print(f"  ✅ Author:         {article['author']}")
    print(f"  ✅ Summary:        {article['short_summary'][:80]}…")
    print(f"  ✅ Tags:           {article['tags']}")
    print(f"  ✅ Categories:     {categories}")
    print(f"  ✅ Matched KW:     {matched_kw}")
    print(f"  ✅ Insight:        {insight_type} — {phrases}")
    print(f"  ✅ Confidence:     {article['confidence']}")
    print(f"  ✅ Full text len:  {len(article['full_text'])} chars")
    print(f"\n  {'=' * 56}")
    print("  ALL TESTS PASSED ✅")
    print(f"  {'=' * 56}\n")


# =========================================================================
#  Main pipeline
# =========================================================================

def run_pipeline(
    sources: List[Dict[str, Any]],
    *,
    limit: Optional[int] = None,
    since: Optional[str] = None,
    output_dir: str = ".",
    rate_limit: float = DEFAULT_RATE_LIMIT,
) -> None:
    """
    Execute the full scraping and processing pipeline.

    Steps:
      1. Fetch index pages → discover article URLs
      2. Fetch each article page → extract structured data
      3. Clean, filter, deduplicate
      4. Classify & extract insights
      5. Compute confidence scores
      6. Write output files (CSV, JSONL)
    """
    crawl_start = time.time()
    all_articles: List[Dict[str, Any]] = []

    # ── Step 1-2: Fetch & Parse ───────────────────────────────────────
    for source in sources:
        if not source.get("enabled", True):
            continue

        stubs = fetch_index(source, limit=limit, rate_limit=rate_limit)
        logger.info("Processing %d articles from %s", len(stubs), source["name"])

        for stub in stubs:
            try:
                article = fetch_article(stub, rate_limit=rate_limit)
                if article:
                    all_articles.append(article)
            except Exception as exc:
                logger.error(
                    "Error processing %s: %s", stub.get("url", "?"), exc,
                    exc_info=True,
                )

    logger.info("Total articles fetched: %d", len(all_articles))

    # ── Step 3: Quality filter & dedup ────────────────────────────────
    all_articles = filter_quality(all_articles)
    all_articles = deduplicate(all_articles)

    # ── Step 3b: Date filter ──────────────────────────────────────────
    if since:
        all_articles = filter_by_date(all_articles, since)

    # ── Step 4: Classify & extract insights ───────────────────────────
    for article in all_articles:
        categories, matched_kw = classify(article)
        article["categories"] = categories
        article["matched_category_keywords"] = matched_kw

        insight_type, phrases = extract_insight(article)
        article["insight_type"] = insight_type
        article["insight_keywords"] = phrases

    # ── Step 5: Confidence scores ─────────────────────────────────────
    for article in all_articles:
        article["confidence"] = compute_confidence(article)

    # ── Step 6: Output ────────────────────────────────────────────────
    raw_csv = os.path.join(output_dir, "tech_news_raw.csv")
    important_csv = os.path.join(output_dir, "important_tech_news.csv")
    jsonl_path = os.path.join(output_dir, "tech_news.jsonl")

    to_csv(all_articles, raw_csv)
    to_jsonl(all_articles, jsonl_path)

    # Important = non-General insight_type
    important = [a for a in all_articles if a.get("insight_type", "Other") != "Other"]
    # Also include articles with specific (non-General) categories
    for a in all_articles:
        if a not in important and a.get("categories") and a["categories"] != ["General"]:
            important.append(a)
    to_csv(important, important_csv)

    # ── Summary ───────────────────────────────────────────────────────
    elapsed = time.time() - crawl_start
    print("\n" + "=" * 60)
    print("  StrategicAI Scraper — Pipeline Complete")
    print("=" * 60)
    print(f"  Total articles collected:  {len(all_articles)}")
    print(f"  Important articles:        {len(important)}")
    print(f"  Time elapsed:              {elapsed:.1f}s")
    print(f"\n  Output files:")
    print(f"    📄 {raw_csv}")
    print(f"    ⭐ {important_csv}")
    print(f"    📦 {jsonl_path}")
    print("=" * 60 + "\n")


# =========================================================================
#  CLI
# =========================================================================

def main() -> None:
    """Command-line entry point."""
    parser = argparse.ArgumentParser(
        prog="scraper.py",
        description=(
            "StrategicAI — Competitive Intelligence Scraper.\n"
            "Collects tech news from company blogs and prepares data "
            "for Elasticsearch + AI agent."
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  python scraper.py --config sources.json --limit 10\n"
            "  python scraper.py --config sources.json --since 2025-01-01\n"
            "  python scraper.py --test\n"
        ),
    )
    parser.add_argument(
        "--config", "-c",
        type=str,
        default=None,
        help="Path to JSON/YAML source config file (default: built-in sources)",
    )
    parser.add_argument(
        "--limit", "-l",
        type=int,
        default=None,
        help="Max articles per source (dev mode)",
    )
    parser.add_argument(
        "--since", "-s",
        type=str,
        default=None,
        help="Only collect articles newer than YYYY-MM-DD",
    )
    parser.add_argument(
        "--output", "-o",
        type=str,
        default=".",
        help="Output directory for CSV/JSONL files (default: current dir)",
    )
    parser.add_argument(
        "--rate-limit",
        type=float,
        default=DEFAULT_RATE_LIMIT,
        help=f"Seconds between requests per domain (default: {DEFAULT_RATE_LIMIT})",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debug-level logging",
    )
    parser.add_argument(
        "--test",
        action="store_true",
        help="Run built-in test and exit",
    )

    args = parser.parse_args()

    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)
        logger.setLevel(logging.DEBUG)

    if args.test:
        test_parse_sample_html()
        sys.exit(0)

    # Load sources
    if args.config:
        sources = load_config(args.config)
    else:
        logger.info("No config file specified — using built-in default sources.")
        sources = DEFAULT_SOURCES

    # Ensure output directory exists
    if args.output != "." and not os.path.isdir(args.output):
        os.makedirs(args.output, exist_ok=True)

    # Run the pipeline
    run_pipeline(
        sources,
        limit=args.limit,
        since=args.since,
        output_dir=args.output,
        rate_limit=args.rate_limit,
    )


if __name__ == "__main__":
    main()
