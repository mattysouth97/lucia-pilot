#!/usr/bin/env bash
# sync-to-build-mirror.sh — Sync this repo's source to the ASCII build mirror.
#
# Why: Rollup 4 native bindings (rollup-win32-x64-msvc) crash on the Korean
# cwd path (정산-handoff) on Windows with __fastfail() — the build dies with
# 0xC0000409 during rollup's chunk/output phase. The mirror is an ASCII-only
# copy used for builds and the dev server. This script keeps it in sync.
#
# See CLAUDE.md → "Build workflow (Windows + Korean path)" for context.
#
# Usage:
#   ./sync-to-build-mirror.sh                # sync only
#   ./sync-to-build-mirror.sh diff           # report what's out of sync (read-only)
#   ./sync-to-build-mirror.sh build          # sync, then full repo build (web+engine+...)
#   ./sync-to-build-mirror.sh dev            # sync, then start the web dev server
#   ./sync-to-build-mirror.sh exec <cmd...>  # sync, then run any command from mirror
#
# Examples:
#   ./sync-to-build-mirror.sh exec pnpm install
#   ./sync-to-build-mirror.sh exec pnpm --filter @lucia/engine build
#   ./sync-to-build-mirror.sh exec pnpm test
#
# Configuration:
#   LUCIA_BUILD_MIRROR — override mirror path (default: C:/Users/Nam/lucia-build)
set -euo pipefail

# Source = the directory this script lives in (the Korean-path repo root).
SOURCE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIRROR="${LUCIA_BUILD_MIRROR:-C:/Users/Nam/lucia-build}"

# Paths that get edited during development. Each may be a file or a dir.
# Excludes: node_modules, dist, .vite, .turbo, build artifacts.
PATHS=(
  "apps/web/src"
  "apps/web/public"
  "apps/web/tests"
  "apps/web/index.html"
  "apps/web/tsconfig.json"
  "apps/web/tsconfig.node.json"
  "apps/web/vite.config.ts"
  "apps/web/package.json"
  "apps/web/.env.local"
  "apps/web/.env.example"
  "apps/engine/src"
  "apps/engine/tsconfig.json"
  "apps/engine/package.json"
  "apps/simulator/src"
  "apps/simulator/package.json"
  "packages/contracts/src"
  "packages/contracts/fixtures"
  "packages/contracts/package.json"
  "packages/db/src"
  "packages/db/package.json"
  "tsconfig.base.json"
  "package.json"
  "pnpm-workspace.yaml"
  "eslint.config.js"
)

cmd="${1:-sync}"

if [ "$cmd" = "diff" ]; then
  echo "→ Diffing source ↔ mirror"
  for p in "${PATHS[@]}"; do
    src="$SOURCE/$p"
    dst="$MIRROR/$p"
    if [ ! -e "$src" ]; then
      echo "  - missing in source: $p"
    elif [ ! -e "$dst" ]; then
      echo "  + missing in mirror: $p"
    else
      out=$(diff -qr "$src" "$dst" 2>&1 | head -10 || true)
      if [ -n "$out" ]; then
        echo "  Δ $p"
        echo "$out" | sed 's/^/      /'
      fi
    fi
  done
  exit 0
fi

echo "→ Syncing $SOURCE → $MIRROR"
for p in "${PATHS[@]}"; do
  src="$SOURCE/$p"
  dst="$MIRROR/$p"
  if [ ! -e "$src" ]; then
    echo "  ⚠ skip (not in source): $p"
    continue
  fi
  mkdir -p "$(dirname "$dst")"
  if [ -d "$src" ]; then
    rm -rf "$dst"
    cp -r "$src" "$dst"
  else
    cp "$src" "$dst"
  fi
  echo "  ✓ $p"
done

case "$cmd" in
  sync|"")
    echo "✓ Sync complete. Try: ./sync-to-build-mirror.sh build  (or dev / exec ...)"
    ;;
  build)
    echo "→ Building full repo from mirror"
    cd "$MIRROR" && pnpm build
    ;;
  dev)
    echo "→ Starting web dev server from mirror (Ctrl+C to stop)"
    cd "$MIRROR" && pnpm --filter web dev
    ;;
  exec)
    shift  # drop the "exec" arg, pass the rest verbatim
    if [ "$#" -eq 0 ]; then
      echo "exec needs a command. Example: $0 exec pnpm install" >&2
      exit 1
    fi
    echo "→ Running from mirror: $*"
    cd "$MIRROR" && "$@"
    ;;
  *)
    echo "Unknown command: $cmd" >&2
    echo "Usage: $0 [sync|diff|build|dev|exec <cmd...>]" >&2
    exit 1
    ;;
esac
