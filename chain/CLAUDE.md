# chain/ — Lucia 정산 Chaincode + Network Bootstrap

## Purpose

This directory contains:
1. **`chaincode/`** — Hyperledger Fabric Go smart contract (chaincode) for the Lucia 정산 (settlement) system.
2. **`network/`** — Bootstrap scripts and configuration for running a local single-org Fabric 2.5 network.

The chaincode provides an **immutable ledger** for settlement results produced by the Lucia engine (`apps/engine`). It is intentionally minimal — all settlement math lives in the engine (TypeScript), not here.

---

## ADR-0002 Boundary: Chaincode is Dumb Persistence + Hash Chain

Per ADR-0002, the **engine computes, the chain records**. The chaincode:

- **Does**: store settlement payloads immutably, maintain sha256 hash-chain linkage, return `tx_id`/`block_height`/`hash` to the engine, support key-based lookups.
- **Does NOT**: perform any settlement math, apply business rules, validate amounts, calculate fees, or know anything about KPX/REC/LH accounting.

This boundary is intentional and must not be violated. Chaincode upgrades in Fabric are expensive (lifecycle + endorsement policy approval). Business logic that changes frequently belongs in the engine, not here.

---

## ADR-0002 State DB: LevelDB for Demo, CouchDB for Phase 2

The peer state database is **LevelDB** (`CORE_LEDGER_STATE_STATEDATABASE=goleveldb`), NOT CouchDB.

**Why**: The demo runs on a 16 GB laptop alongside Postgres+TimescaleDB, Redis, Mosquitto, and the Fabric peer + orderer. CouchDB would add ~512 MB–1 GB RAM overhead and degrade the FR-S-007 100 TPS / 1.5s avg latency target.

**Phase 2**: Swap to CouchDB is a config change (`stateDatabase: CouchDB` in `core.yaml` + env var), not a chaincode rewrite. All chaincode operations (`Settle`, `Verify`, `History`) use key-based lookups that LevelDB handles natively.

---

## Chaincode Interface

The chaincode exposes three functions callable via `peer chaincode invoke` or the `fabric-network` SDK:

### `Settle(payload string, prevHash string) -> (tx_id string, block_height int, hash string, error)`

- `payload`: JSON string containing the full settlement record (must include `settlement_id` and `building_id` fields).
- `prevHash`: sha256 hash of the **previous** settlement record for the same `building_id`. Pass `"0000...0000"` (64 zeros) for the first record.
- Validates that `prevHash` matches the stored hash of the latest settlement for this `building_id`. If not → returns error `"hash_mismatch"`.
- Computes `hash = sha256(prevHash || payload)`.
- Writes to ledger key `settlement:{settlement_id}` and secondary index key `tx:{tx_id}`.
- Returns `tx_id` (from `ctx.GetStub().GetTxID()`), `block_height` (placeholder 0 — real height is known only after block commit), `hash`.

### `Verify(txID string) -> (record string, error)`

- Looks up the secondary index key `tx:{tx_id}` to retrieve the `settlement_id`.
- Returns the full JSON record stored at `settlement:{settlement_id}`.

### `History(buildingID string, fromTs string, toTs string) -> (records []string, error)`

- Range query using Fabric composite keys keyed by `building_id`.
- `fromTs` and `toTs` are RFC3339 timestamp strings used to filter results.
- Returns slice of JSON record strings.

### `helloWorld() -> (string, error)`

- Returns `"ok"`. Used by P0.6 acceptance gate (`make chain-hello`) and `chain/network/scripts/hello-world.sh`.

---

## Chaincode Upgrade Lifecycle

To upgrade the chaincode after a logic change:

```bash
# 1. Bump the version/sequence in your package step
peer lifecycle chaincode package lucia-cc-v2.tar.gz \
  --path ./chaincode --lang golang --label lucia-cc_2.0

# 2. Install on each peer
peer lifecycle chaincode install lucia-cc-v2.tar.gz

# 3. Approve for your org (bump --sequence)
peer lifecycle chaincode approveformyorg \
  -C lucia-channel -n lucia-cc --version 2.0 --sequence 2 \
  --package-id <PACKAGE_ID>

# 4. Check commit readiness
peer lifecycle chaincode checkcommitreadiness \
  -C lucia-channel -n lucia-cc --version 2.0 --sequence 2

# 5. Commit the new definition
peer lifecycle chaincode commit \
  -C lucia-channel -n lucia-cc --version 2.0 --sequence 2 \
  -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com
```

---

## Security: Crypto Materials are GITIGNORED

The following paths are listed in the root `.gitignore` and must **never** be committed:

- `chain/network/crypto-config/` — MSP certificates, private keys
- `chain/network/channel-artifacts/` — genesis block, channel tx
- `chain/network/organizations/` — per-org MSP materials
- `chain/network/system-genesis-block/` — orderer genesis block
- `chain/network/*.block` — any Fabric block files
- `chain/network/*.tx` — channel transaction files
- `chain/network/wallet/` — application-level identity wallet

These are generated at runtime by `cryptogen` and `configtxgen`. If any of these files appear in `git status`, do not commit them.
