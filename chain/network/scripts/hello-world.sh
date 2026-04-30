#!/usr/bin/env bash
# hello-world.sh — P0.6 acceptance gate for the Lucia chaincode.
# Submits one Settle transaction and one HelloWorld invocation, then
# prints the returned tx_id + block_height.
#
# Usage:
#   ./scripts/hello-world.sh
#   make chain-hello    (calls this script)
#
# Exits non-zero if the transaction fails.
#
# FR-S-007: verifies that the deployed chaincode can accept a settlement record.
# Building: ULJN-001, kWh: 1.2, prevHash: zero hash (first record).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NETWORK_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

info()  { echo "[chain-hello] $*"; }
die()   { echo "[chain-hello] ERROR: $*" >&2; exit 1; }

# ---------------------------------------------------------------------------
# Configuration — must match network-up.sh
# ---------------------------------------------------------------------------
CHANNEL_NAME="lucia-channel"
CHAINCODE_NAME="lucia-cc"

ORDERER_ADDRESS="orderer.example.com:7050"
ORDERER_TLS_CA="${NETWORK_DIR}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

PEER_ADDRESS="peer0.org1.example.com:7051"
PEER_TLS_ROOTCERT="${NETWORK_DIR}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"

CORE_PEER_LOCALMSPID="Org1MSP"
CORE_PEER_MSPCONFIGPATH="${NETWORK_DIR}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"

BIN_DIR="${NETWORK_DIR}/bin"
if [ -d "${BIN_DIR}" ]; then
  export PATH="${BIN_DIR}:${PATH}"
fi

export CORE_PEER_TLS_ENABLED="true"
export CORE_PEER_LOCALMSPID="${CORE_PEER_LOCALMSPID}"
export CORE_PEER_TLS_ROOTCERT_FILE="${PEER_TLS_ROOTCERT}"
export CORE_PEER_MSPCONFIGPATH="${CORE_PEER_MSPCONFIGPATH}"
export CORE_PEER_ADDRESS="${PEER_ADDRESS}"
export FABRIC_CFG_PATH="${NETWORK_DIR}"

command -v peer >/dev/null 2>&1 \
  || die "peer binary not found. See chain/network/scripts/README.md"

# ---------------------------------------------------------------------------
# Test 1: HelloWorld (liveness check)
# ---------------------------------------------------------------------------
info "Test 1: invoking HelloWorld..."
HW_RESULT=$(peer chaincode invoke \
  -o "${ORDERER_ADDRESS}" \
  --ordererTLSHostnameOverride orderer.example.com \
  -C "${CHANNEL_NAME}" \
  -n "${CHAINCODE_NAME}" \
  --peerAddresses "${PEER_ADDRESS}" \
  --tlsRootCertFiles "${PEER_TLS_ROOTCERT}" \
  --tls \
  --cafile "${ORDERER_TLS_CA}" \
  -c '{"function":"LuciaContract:HelloWorld","Args":[]}' \
  --waitForEvent \
  2>&1)

echo "${HW_RESULT}" | sed 's/^/  /'
echo "${HW_RESULT}" | grep -q "status:200" \
  || die "HelloWorld invocation did not return status 200."
info "  HelloWorld: OK"

# ---------------------------------------------------------------------------
# Test 2: Settle — fake settlement payload (ULJN-001, 1.2 kWh)
# ---------------------------------------------------------------------------
ZERO_HASH="0000000000000000000000000000000000000000000000000000000000000000"
SETTLEMENT_ID="P0-HELLO-$(date +%s)"
BUILDING_ID="ULJN-001"
KWH="1.2"

PAYLOAD=$(printf '{"settlement_id":"%s","building_id":"%s","kwh":%s,"source":"hello-world-test"}' \
  "${SETTLEMENT_ID}" "${BUILDING_ID}" "${KWH}")

info "Test 2: invoking Settle..."
info "  settlement_id : ${SETTLEMENT_ID}"
info "  building_id   : ${BUILDING_ID}"
info "  kwh           : ${KWH}"
info "  prev_hash     : ${ZERO_HASH}"

SETTLE_RESULT=$(peer chaincode invoke \
  -o "${ORDERER_ADDRESS}" \
  --ordererTLSHostnameOverride orderer.example.com \
  -C "${CHANNEL_NAME}" \
  -n "${CHAINCODE_NAME}" \
  --peerAddresses "${PEER_ADDRESS}" \
  --tlsRootCertFiles "${PEER_TLS_ROOTCERT}" \
  --tls \
  --cafile "${ORDERER_TLS_CA}" \
  -c "$(printf '{"function":"LuciaContract:Settle","Args":["%s","%s","%s"]}' \
    "${SETTLEMENT_ID}" \
    "$(echo "${PAYLOAD}" | sed 's/"/\\"/g')" \
    "${ZERO_HASH}")" \
  --waitForEvent \
  2>&1)

echo "${SETTLE_RESULT}" | sed 's/^/  /'
echo "${SETTLE_RESULT}" | grep -q "status:200" \
  || die "Settle invocation did not return status 200."

# Extract tx_id from the peer invoke output line.
TX_ID=$(echo "${SETTLE_RESULT}" | grep -oP 'txid \[\K[^\]]+' | head -1 || true)
if [ -z "${TX_ID}" ]; then
  # Fallback: grab any 64-char hex string as the txid.
  TX_ID=$(echo "${SETTLE_RESULT}" | grep -oP '[0-9a-f]{64}' | head -1 || true)
fi

# block_height is 0 inside chaincode (set by SDK post-commit).
BLOCK_HEIGHT="0 (set by SDK post-commit)"

info ""
info "P0.6 acceptance gate: PASSED"
info "  tx_id        : ${TX_ID:-<see raw output above>}"
info "  block_height : ${BLOCK_HEIGHT}"
info ""
info "Transaction is visible in the ledger. Run Verify to confirm:"
info "  peer chaincode query -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME}"
info "    -c '{\"function\":\"LuciaContract:Verify\",\"Args\":[\"<tx_id>\"]}'"
