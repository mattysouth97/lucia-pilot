#!/usr/bin/env bash
# network-up.sh — Fabric local network bootstrap for the Lucia pilot.
# Assumes the orderer/peer/ca containers are already running via:
#   docker compose -f docker/docker-compose.yml up -d
#
# Steps performed:
#   1. Set environment variables for CLI peer commands.
#   2. Create the lucia-channel channel.
#   3. Join Org1 peer to the channel.
#   4. Package the lucia chaincode (Go).
#   5. Install chaincode on the peer.
#   6. Approve chaincode definition for Org1.
#   7. Commit the chaincode definition to the channel.
#   8. Set up the application wallet identity (enrolls admin via fabric-ca-client).
#
# Prerequisites: see chain/network/scripts/README.md
# Reference: hyperledger/fabric-samples/asset-transfer-basic/network scripts.
#
# ADR-0002: LevelDB state DB (CORE_LEDGER_STATE_STATEDATABASE=goleveldb).
# FR-S-007: 100 TPS target; LevelDB chosen over CouchDB to stay within 16 GB RAM.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NETWORK_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${NETWORK_DIR}/../.." && pwd)"

# ---------------------------------------------------------------------------
# Configuration — adjust to match docker-compose service names/ports.
# ---------------------------------------------------------------------------
CHANNEL_NAME="lucia-channel"
CHAINCODE_NAME="lucia-cc"
CHAINCODE_VERSION="1.0"
CHAINCODE_SEQUENCE="1"
CHAINCODE_PATH="${REPO_ROOT}/chain/chaincode"
CHAINCODE_LANG="golang"
CHAINCODE_LABEL="${CHAINCODE_NAME}_${CHAINCODE_VERSION}"
PACKAGE_FILE="${NETWORK_DIR}/${CHAINCODE_NAME}-v1.tar.gz"

ORDERER_ADDRESS="orderer.example.com:7050"
ORDERER_TLS_CA="${NETWORK_DIR}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

PEER_ADDRESS="peer0.org1.example.com:7051"
PEER_TLS_ROOTCERT="${NETWORK_DIR}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"

CORE_PEER_LOCALMSPID="Org1MSP"
CORE_PEER_MSPCONFIGPATH="${NETWORK_DIR}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"

CHANNEL_ARTIFACTS="${NETWORK_DIR}/channel-artifacts"
WALLET_DIR="${NETWORK_DIR}/wallet"

# Fabric binaries — fall back to PATH if not vendored locally.
BIN_DIR="${NETWORK_DIR}/bin"
if [ -d "${BIN_DIR}" ]; then
  export PATH="${BIN_DIR}:${PATH}"
fi

# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------
info() { echo "[network-up] $*"; }
die()  { echo "[network-up] ERROR: $*" >&2; exit 1; }

require_bin() {
  command -v "$1" >/dev/null 2>&1 || die "Required binary not found: $1. See README.md."
}

export_peer_env() {
  export CORE_PEER_TLS_ENABLED="true"
  export CORE_PEER_LOCALMSPID="${CORE_PEER_LOCALMSPID}"
  export CORE_PEER_TLS_ROOTCERT_FILE="${PEER_TLS_ROOTCERT}"
  export CORE_PEER_MSPCONFIGPATH="${CORE_PEER_MSPCONFIGPATH}"
  export CORE_PEER_ADDRESS="${PEER_ADDRESS}"
  export FABRIC_CFG_PATH="${NETWORK_DIR}"
}

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------
info "Checking required binaries..."
require_bin peer
require_bin configtxgen
require_bin fabric-ca-client

info "Checking that orderer/peer containers are running..."
docker ps --format '{{.Names}}' | grep -q "orderer" \
  || die "Orderer container not running. Run: docker compose -f docker/docker-compose.yml up -d"
docker ps --format '{{.Names}}' | grep -q "peer0" \
  || die "Peer container not running. Run: docker compose -f docker/docker-compose.yml up -d"

# ---------------------------------------------------------------------------
# Step 1 — Create channel artifacts
# ---------------------------------------------------------------------------
info "Step 1: Generating channel artifacts..."
mkdir -p "${CHANNEL_ARTIFACTS}"

if [ ! -f "${CHANNEL_ARTIFACTS}/genesis.block" ]; then
  configtxgen \
    -profile LuciaGenesis \
    -channelID system-channel \
    -outputBlock "${CHANNEL_ARTIFACTS}/genesis.block" \
    -configPath "${NETWORK_DIR}"
  info "  genesis.block created."
else
  info "  genesis.block already exists, skipping."
fi

if [ ! -f "${CHANNEL_ARTIFACTS}/${CHANNEL_NAME}.tx" ]; then
  configtxgen \
    -profile LuciaChannel \
    -outputCreateChannelTx "${CHANNEL_ARTIFACTS}/${CHANNEL_NAME}.tx" \
    -channelID "${CHANNEL_NAME}" \
    -configPath "${NETWORK_DIR}"
  info "  ${CHANNEL_NAME}.tx created."
else
  info "  ${CHANNEL_NAME}.tx already exists, skipping."
fi

# ---------------------------------------------------------------------------
# Step 2 — Create the channel
# ---------------------------------------------------------------------------
info "Step 2: Creating channel ${CHANNEL_NAME}..."
export_peer_env

peer channel create \
  -o "${ORDERER_ADDRESS}" \
  --ordererTLSHostnameOverride orderer.example.com \
  -c "${CHANNEL_NAME}" \
  -f "${CHANNEL_ARTIFACTS}/${CHANNEL_NAME}.tx" \
  --outputBlock "${CHANNEL_ARTIFACTS}/${CHANNEL_NAME}.block" \
  --tls \
  --cafile "${ORDERER_TLS_CA}" \
  2>&1 | sed 's/^/  /' \
  || info "  Channel may already exist; continuing."

# ---------------------------------------------------------------------------
# Step 3 — Join peer to channel
# ---------------------------------------------------------------------------
info "Step 3: Joining peer0.org1 to ${CHANNEL_NAME}..."
peer channel join \
  -b "${CHANNEL_ARTIFACTS}/${CHANNEL_NAME}.block" \
  2>&1 | sed 's/^/  /' \
  || info "  Peer may already be joined; continuing."

info "  Verifying peer joined channel..."
peer channel list 2>&1 | grep -q "${CHANNEL_NAME}" \
  || die "Peer did not join ${CHANNEL_NAME}. Check peer logs."
info "  Confirmed: peer is on ${CHANNEL_NAME}."

# ---------------------------------------------------------------------------
# Step 4 — Package chaincode
# ---------------------------------------------------------------------------
info "Step 4: Packaging chaincode ${CHAINCODE_LABEL}..."
if [ ! -f "${PACKAGE_FILE}" ]; then
  peer lifecycle chaincode package "${PACKAGE_FILE}" \
    --path "${CHAINCODE_PATH}" \
    --lang "${CHAINCODE_LANG}" \
    --label "${CHAINCODE_LABEL}"
  info "  Package created: ${PACKAGE_FILE}"
else
  info "  Package already exists: ${PACKAGE_FILE}"
fi

# ---------------------------------------------------------------------------
# Step 5 — Install chaincode
# ---------------------------------------------------------------------------
info "Step 5: Installing chaincode on peer0.org1..."
peer lifecycle chaincode install "${PACKAGE_FILE}" \
  2>&1 | sed 's/^/  /'

# Capture the package ID for use in approve step.
PACKAGE_ID=$(peer lifecycle chaincode queryinstalled \
  --output json 2>/dev/null \
  | python3 -c "
import sys, json
data = json.load(sys.stdin)
for cc in data.get('installed_chaincodes', []):
    if cc.get('label') == '${CHAINCODE_LABEL}':
        print(cc['package_id'])
        break
" 2>/dev/null || true)

if [ -z "${PACKAGE_ID}" ]; then
  die "Could not determine package ID after install. Check peer logs."
fi
info "  Package ID: ${PACKAGE_ID}"

# ---------------------------------------------------------------------------
# Step 6 — Approve chaincode for Org1
# ---------------------------------------------------------------------------
info "Step 6: Approving chaincode definition for Org1MSP..."
peer lifecycle chaincode approveformyorg \
  -o "${ORDERER_ADDRESS}" \
  --ordererTLSHostnameOverride orderer.example.com \
  --channelID "${CHANNEL_NAME}" \
  --name "${CHAINCODE_NAME}" \
  --version "${CHAINCODE_VERSION}" \
  --package-id "${PACKAGE_ID}" \
  --sequence "${CHAINCODE_SEQUENCE}" \
  --tls \
  --cafile "${ORDERER_TLS_CA}" \
  2>&1 | sed 's/^/  /'

# ---------------------------------------------------------------------------
# Step 7 — Check commit readiness + commit
# ---------------------------------------------------------------------------
info "Step 7: Checking commit readiness..."
peer lifecycle chaincode checkcommitreadiness \
  --channelID "${CHANNEL_NAME}" \
  --name "${CHAINCODE_NAME}" \
  --version "${CHAINCODE_VERSION}" \
  --sequence "${CHAINCODE_SEQUENCE}" \
  --output json \
  2>&1 | sed 's/^/  /'

info "  Committing chaincode definition to ${CHANNEL_NAME}..."
peer lifecycle chaincode commit \
  -o "${ORDERER_ADDRESS}" \
  --ordererTLSHostnameOverride orderer.example.com \
  --channelID "${CHANNEL_NAME}" \
  --name "${CHAINCODE_NAME}" \
  --version "${CHAINCODE_VERSION}" \
  --sequence "${CHAINCODE_SEQUENCE}" \
  --peerAddresses "${PEER_ADDRESS}" \
  --tlsRootCertFiles "${PEER_TLS_ROOTCERT}" \
  --tls \
  --cafile "${ORDERER_TLS_CA}" \
  2>&1 | sed 's/^/  /'

info "  Verifying committed chaincode..."
peer lifecycle chaincode querycommitted \
  --channelID "${CHANNEL_NAME}" \
  --name "${CHAINCODE_NAME}" \
  2>&1 | sed 's/^/  /'

# ---------------------------------------------------------------------------
# Step 8 — Set up application wallet identity
# (enrolls the Org1 admin with fabric-ca-client and writes to wallet/)
# ---------------------------------------------------------------------------
info "Step 8: Setting up application wallet identity..."
mkdir -p "${WALLET_DIR}"

CA_URL="https://ca.org1.example.com:7054"
CA_CERT="${NETWORK_DIR}/organizations/peerOrganizations/org1.example.com/ca/ca.org1.example.com-cert.pem"

if [ ! -d "${WALLET_DIR}/admin" ]; then
  export FABRIC_CA_CLIENT_HOME="${WALLET_DIR}/admin"
  fabric-ca-client enroll \
    -u "https://admin:adminpw@${CA_URL#https://}" \
    --caname "ca-org1" \
    --tls.certfiles "${CA_CERT}" \
    2>&1 | sed 's/^/  /'
  info "  Admin identity enrolled at ${WALLET_DIR}/admin"
else
  info "  Admin identity already exists at ${WALLET_DIR}/admin, skipping."
fi

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
info "network-up complete."
info "  Channel  : ${CHANNEL_NAME}"
info "  Chaincode: ${CHAINCODE_NAME} v${CHAINCODE_VERSION} (sequence ${CHAINCODE_SEQUENCE})"
info "  Wallet   : ${WALLET_DIR}/admin"
info ""
info "Run 'make chain-hello' to verify the P0.6 acceptance gate."
