#!/usr/bin/env bash
set -euo pipefail

URLS_FILE="URLs.txt"
OUTPUT="repos.json"
GITHUB_API="https://api.github.com"

# Optional: set GITHUB_TOKEN env var to avoid rate limits
AUTH_HEADER=""
if [ -n "${GITHUB_TOKEN:-}" ]; then
  AUTH_HEADER="-H \"Authorization: Bearer $GITHUB_TOKEN\""
fi

echo "[" > "$OUTPUT"
first=true

while IFS= read -r url; do
  [[ -z "$url" || "$url" == \#* ]] && continue

  owner=$(echo "$url" | sed -E 's|https?://github\.com/([^/]+)/([^/]+).*|\1|')
  repo=$(echo "$url" | sed -E 's|https?://github\.com/([^/]+)/([^/]+).*|\2|')

  echo "  → $owner/$repo"

  # Fetch repo info
  repo_json=$(curl -sf "$GITHUB_API/repos/$owner/$repo" 2>/dev/null || echo "null")
  if [ "$repo_json" = "null" ]; then
    echo "    ⚠  Failed to fetch, skipping"
    continue
  fi

  name=$(echo "$repo_json" | jq -r '.name // empty')
  description=$(echo "$repo_json" | jq -r '.description // ""')
  stars=$(echo "$repo_json" | jq -r '.stargazers_count // 0')
  language=$(echo "$repo_json" | jq -r '.language // ""')
  topics=$(echo "$repo_json" | jq -r '.topics // [] | @json')
  updated_at=$(echo "$repo_json" | jq -r '.pushed_at // .updated_at // ""')

  # Fetch README
  readme_excerpt=""
  readme_raw=$(curl -sf "$GITHUB_API/repos/$owner/$repo/readme" 2>/dev/null || echo "null")
  if [ "$readme_raw" != "null" ]; then
    content_b64=$(echo "$readme_raw" | jq -r '.content // ""')
    if [ -n "$content_b64" ]; then
      # Decode base64 and extract first meaningful line as excerpt
      decoded=$(echo "$content_b64" | base64 -d 2>/dev/null || echo "")
      readme_excerpt=$(echo "$decoded" | python3 -c "
import sys, re
text = sys.stdin.read()
# Remove HTML comments
text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
for line in text.splitlines():
    line = line.strip().strip(chr(13))  # strip whitespace and \r
    if not line:
        continue
    if line.startswith('#'):
        continue
    if re.match(r'^!\\[', line) or re.match(r'^<img', line):
        continue
    if re.match(r'^-{3,}', line):
        continue
    # Strip markdown link syntax: [text](url) → text (do this first to unwrap linked images)
    line = re.sub(r'\\[([^]]*)\\]\\([^)]*\\)', r'\1', line)
    # Strip any remaining markdown image syntax: ![alt](url)
    line = re.sub(r'!\\[([^]]*)\\]\\([^)]*\\)', '', line)
    # Strip remaining markdown chars
    line = re.sub(r'[#*_~\`>|:-]', '', line)
    line = line.strip()
    if len(line) > 20:  # require meaningful length
        print(line)
        break
" 2>/dev/null || echo "")
    fi
  fi

  # Language color (simple map, extended on the JS side)
  lang_color=""
  case "$language" in
    TypeScript) lang_color="#3178c6" ;;
    JavaScript) lang_color="#f1e05a" ;;
    Python)     lang_color="#3572a5" ;;
    Go)         lang_color="#00ADD8" ;;
    Rust)       lang_color="#dea584" ;;
    Ruby)       lang_color="#701516" ;;
    HTML)       lang_color="#e34c26" ;;
    CSS)        lang_color="#563d7c" ;;
    Shell)      lang_color="#89e051" ;;
    C)          lang_color="#555555" ;;
    "C++")      lang_color="#f34b7d" ;;
    *)          lang_color="" ;;
  esac

  # Write JSON entry
  if [ "$first" = true ]; then
    first=false
  else
    echo "," >> "$OUTPUT"
  fi

  # Escape special chars for JSON
  desc_esc=$(echo "$description" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read().strip()))" 2>/dev/null || echo "\"\"")
  excerpt_esc=$(echo "$readme_excerpt" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read().strip()))" 2>/dev/null || echo "\"\"")
  full_esc=$(echo "$decoded" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))" 2>/dev/null || echo "\"\"")

  cat >> "$OUTPUT" <<ENTRY
  {
    "name": $(echo "$name" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read().strip()))"),
    "owner": $(echo "$owner" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read().strip()))"),
    "description": $desc_esc,
    "url": "https://github.com/$owner/$repo",
    "stars": $stars,
    "language": $(echo "$language" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read().strip()))"),
    "languageColor": "$lang_color",
    "topics": $topics,
    "readmeExcerpt": $excerpt_esc,
    "readmeFull": $full_esc,
    "readmeSections": [],
    "updatedAt": $(echo "$updated_at" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read().strip()))")
  }
ENTRY

  # Small delay to avoid hitting rate limits
  sleep 0.5
done < "$URLS_FILE"

echo "]" >> "$OUTPUT"

# Validate JSON
if python3 -m json.tool "$OUTPUT" > /dev/null 2>&1; then
  count=$(python3 -c "import json; print(len(json.load(open('$OUTPUT'))))")
  echo "✓ repos.json generated with $count repositories"
else
  echo "✗ Invalid JSON generated"
  exit 1
fi
