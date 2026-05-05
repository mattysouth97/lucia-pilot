#!/usr/bin/env bash
# Build the LH FRD .docx from the markdown source of truth.
#
# Source of truth:  docs/frd/FRD-2026-001.md
# Styling template: docs/frd/reference.docx (clone of v1.0 .docx with body
#                   stripped — keeps Heading 1/2/3, table, and paragraph
#                   styles so the output matches the original look).
# Build output:     untitled/project/uploads/TheKIE_LH_FRD.docx (the file
#                   LH consumes; overwritten on each build).
#
# Usage:
#   bash scripts/build-frd.sh           # build .docx only
#   bash scripts/build-frd.sh --pdf     # also build .pdf (requires xelatex
#                                       # + Noto CJK fonts; optional)
#
# Why pandoc: the FRD is a binary .docx with no diff workflow. Markdown
# source + pandoc lets us version-control content and regenerate the
# binary deterministically. See docs/frd/CHANGELOG.md for the migration
# rationale.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO_ROOT/docs/frd/FRD-2026-001.md"
REF="$REPO_ROOT/docs/frd/reference.docx"
OUT_DOCX="$REPO_ROOT/untitled/project/uploads/TheKIE_LH_FRD.docx"

if ! command -v pandoc >/dev/null 2>&1; then
  cat >&2 <<'EOF'
error: pandoc not found on PATH.

Install:
  Windows:  winget install --id JohnMacFarlane.Pandoc -e
            (or)  choco install pandoc
  macOS:    brew install pandoc
  Linux:    apt install pandoc / dnf install pandoc
  All:      https://pandoc.org/installing.html

After install, reopen the shell and re-run this script.
EOF
  exit 1
fi

if [[ ! -f "$SRC" ]]; then
  echo "error: markdown source not found: $SRC" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUT_DOCX")"

REF_FLAG=()
if [[ -f "$REF" ]]; then
  REF_FLAG=(--reference-doc "$REF")
else
  echo "warn: reference.docx not present; output will use pandoc default styling" >&2
fi

pandoc "$SRC" \
  --from gfm \
  --to docx \
  "${REF_FLAG[@]}" \
  --output "$OUT_DOCX" \
  --toc --toc-depth=2

echo "built: $OUT_DOCX ($(wc -c <"$OUT_DOCX") bytes)"

if [[ "${1:-}" == "--pdf" ]]; then
  OUT_PDF="${OUT_DOCX%.docx}.pdf"
  if ! command -v xelatex >/dev/null 2>&1; then
    echo "warn: xelatex not found; skipping PDF build" >&2
    exit 0
  fi
  pandoc "$SRC" \
    --from gfm --to pdf \
    --pdf-engine=xelatex \
    -V CJKmainfont="Noto Sans CJK KR" \
    --output "$OUT_PDF"
  echo "built: $OUT_PDF ($(wc -c <"$OUT_PDF") bytes)"
fi
