# chain/network/scripts — Fabric Network Bootstrap

Scripts for bringing up and tearing down the Lucia pilot local Fabric network.

## Prerequisites

- Docker and Docker Compose (containers started separately via `make up`)
- Hyperledger Fabric 2.5 binaries in PATH **or** vendored under `chain/network/bin/`
  - Required: `peer`, `configtxgen`, `fabric-ca-client`
  - Download: https://github.com/hyperledger/fabric/releases (choose `hyperledger-fabric-linux-amd64-2.5.x.tar.gz`)
  - Or vendor: `mkdir -p chain/network/bin && tar -xzf fabric-2.5.x.tar.gz -C chain/network/`
- Go 1.22+ (for chaincode build inside the peer container — the peer handles this automatically for Go chaincodes)
- Python 3 (used by network-up.sh to parse `peer lifecycle queryinstalled` JSON output)

## How to run

```bash
# 1. Start all infra containers (orderer, peer, ca, postgres, redis, mosquitto).
make up

# 2. Bootstrap the Fabric channel and deploy the lucia chaincode.
./chain/network/scripts/network-up.sh

# 3. Run the P0.6 acceptance gate transaction.
make chain-hello
# or directly:
./chain/network/scripts/hello-world.sh
```

Expected output from `make chain-hello`:

```
[chain-hello] P0.6 acceptance gate: PASSED
[chain-hello]   tx_id        : <64-char hex>
[chain-hello]   block_height : 0 (set by SDK post-commit)
```

## How to reset

To reset the channel state without stopping containers (e.g., after changing chaincode):

```bash
./chain/network/scripts/network-down.sh
# Then re-run:
./chain/network/scripts/network-up.sh
```

To stop all containers entirely:

```bash
make down
```

## State DB note (ADR-0002)

The peer runs with LevelDB (`CORE_LEDGER_STATE_STATEDATABASE=goleveldb`). Do not switch to CouchDB on the demo laptop — it would add ~512 MB RAM and degrade the FR-S-007 100 TPS target. CouchDB is a Phase 2 config change.

## Crypto materials

All generated files under `chain/network/crypto-config/`, `chain/network/channel-artifacts/`, `chain/network/organizations/`, and `chain/network/wallet/` are gitignored. Never commit them.
