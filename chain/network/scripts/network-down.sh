#!/usr/bin/env bash
# network-down.sh — Removes channel artifacts and chaincode packages.
# Containers are kept running; container lifecycle is: make down
# (which runs docker compose -f docker/docker-compose.yml down).
#
# Use this script to reset the Fabric channel state so network-up.sh
# can be run again cleanly (e.g., after chaincode changes).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NETWORK_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

info() { echo "[network-down] $*"; }

CHANNEL_ARTIFACTS="${NETWORK_DIR}/channel-artifacts"
WALLET_DIR="${NETWORK_DIR}/wallet"
PACKAGE_GLOB="${NETWORK_DIR}/lucia-cc-*.tar.gz"

info "Removing channel artifacts..."
if [ -d "${CHANNEL_ARTIFACTS}" ]; then
  rm -rf "${CHANNEL_ARTIFACTS}"
  info "  Removed: ${CHANNEL_ARTIFACTS}"
else
  info "  ${CHANNEL_ARTIFACTS} not found, skipping."
fi

info "Removing chaincode package files..."
# SC2086: glob is intentional here, not a variable.
# shellcheck disable=SC2086
for f in ${PACKAGE_GLOB}; do
  if [ -f "${f}" ]; then
    rm -f "${f}"
    info "  Removed: ${f}"
  fi
done

info "Removing wallet identities..."
if [ -d "${WALLET_DIR}" ]; then
  rm -rf "${WALLET_DIR}"
  info "  Removed: ${WALLET_DIR}"
else
  info "  ${WALLET_DIR} not found, skipping."
fi

info "network-down complete."
info "  Containers are still running. To stop them: make down"
info "  To re-bootstrap: ./scripts/network-up.sh"
