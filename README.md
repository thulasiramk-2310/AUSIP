# StrategicAI — Competitive Intelligence Scraper

> **Step 1** of the StrategicAI pipeline: automatically collect, clean, classify, and structure technology news from major tech company blogs for Elasticsearch + AI agent ingestion.

---

## Quick Start

### 1. Install Dependencies

```bash
pip install requests beautifulsoup4 pandas
```

Optional (for YAML configs):
```bash
pip install pyyaml
```

### 2. Run the Scraper

```bash
# Full run with default sources
python scraper.py

# With custom config & dev-mode limit
python scraper.py --config sources.json --limit 50

# Only articles published after a date
python scraper.py --config sources.json --since 2025-01-01

# Debug logging
python scraper.py --config sources.json --limit 10 --debug

# Run built-in test (no network calls)
python scraper.py --test
```

### 3. CLI Options

| Flag | Description |
|---|---|
| `--config`, `-c` | Path to JSON/YAML source config file |
| `--limit`, `-l` | Max articles per source (dev mode) |
| `--since`, `-s` | Only articles newer than `YYYY-MM-DD` |
| `--output`, `-o` | Output directory (default: `.`) |
| `--rate-limit` | Seconds between requests per domain (default: `2.0`) |
| `--debug` | Enable debug-level logging |
| `--test` | Run built-in test and exit |

---

## Output Files

| File | Description |
|---|---|
| `tech_news_raw.csv` | All scraped articles |
| `important_tech_news.csv` | Filtered — non-General categories/insights only |
| `tech_news.jsonl` | One JSON object per line — **Elasticsearch-ready** |
| `company_strategy.csv` | Editable company strategy profiles |

### JSONL Schema

Each line in `tech_news.jsonl` contains:

```json
{
  "company": "Google",
  "title": "Announcing New AI Features",
  "url": "https://blog.google/...",
  "published_date": "2025-06-15",
  "categories": ["AI_ML", "Cloud"],
  "insight_type": "Product_Launch",
  "insight_keywords": ["introducing", "now available"],
  "summary": "Google introduces powerful new...",
  "full_text": "Today we are introducing...",
  "crawl_date": "2026-02-25",
  "author": "Sundar Pichai",
  "tags": ["AI", "Cloud"],
  "confidence": 0.90,
  "matched_category_keywords": {"AI_ML": ["ai", "machine learning"], "Cloud": ["cloud"]}
}
```

---

## Source Configuration

Edit `sources.json` to add or remove sources:

```json
[
  {"name": "Google",    "url": "https://blog.google/",          "enabled": true},
  {"name": "Microsoft", "url": "https://blogs.microsoft.com/",  "enabled": true},
  {"name": "AWS",       "url": "https://aws.amazon.com/blogs/", "enabled": true}
]
```

Set `"enabled": false` to skip a source without removing it.

---

## Enabling Embeddings

The scraper includes a `create_embeddings()` stub. To activate:

### Option A — OpenAI Embeddings

```bash
pip install openai
export OPENAI_API_KEY="sk-..."        # Linux/Mac
set OPENAI_API_KEY=sk-...             # Windows
```

Then uncomment the OpenAI implementation in `scraper.py` → `create_embeddings()`.

### Option B — Local Sentence-Transformers (no API key needed)

```bash
pip install sentence-transformers
```

Then uncomment the sentence-transformers implementation in `scraper.py` → `create_embeddings()`.

---

## Pipeline Architecture

```
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│  sources.json │────▶│  scraper.py   │────▶│  Output Files │
│  (config)     │     │               │     │  .csv / .jsonl │
└──────────────┘     │  fetch_index  │     └───────┬──────┘
                      │  parse_index  │             │
                      │  fetch_article│             ▼
                      │  parse_article│     ┌──────────────┐
                      │  classify     │     │ Elasticsearch │
                      │  extract_ins. │     │  (Step 2)     │
                      │  to_jsonl     │     └───────┬──────┘
                      └───────────────┘             │
                                                    ▼
                                            ┌──────────────┐
                                            │  AI Agent     │
                                            │  (Step 3)     │
                                            └──────────────┘
```

---

## Categories & Insight Types

### Categories (multi-label)
`AI_ML` · `Cloud` · `Cybersecurity` · `Data_Analytics` · `Automation` · `Emerging_Tech` · `Government_Policy` · `Skills_Jobs` · `Business_Strategy` · `General`

### Insight Types
`Product_Launch` · `Partnership` · `Acquisition` · `Investment` · `Research` · `Cloud_Update` · `Security_Alert` · `Regulation_Policy` · `Developer_Tool` · `Training_Cert` · `Other`

---

## Testing

```bash
python scraper.py --test
```

Runs `test_parse_sample_html()` — a self-contained test on a hardcoded HTML snippet that validates extraction, classification, insight detection, and cleaning.
