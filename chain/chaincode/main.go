// Package main implements the Lucia settlement chaincode.
// ADR-0002: chaincode is dumb persistence + hash-chain integrity.
// All settlement math runs in the engine (TypeScript); chaincode stores
// immutable results and enforces sha256 hash-chain linkage per FR-S-008.
//
// FR-S-007: target 100 TPS aggregate, 1.5s avg latency (LevelDB state DB).
// FR-S-008: tamper detection via per-building hash chain.
package main

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SettlementRecord is the on-chain representation of one settlement result.
// payload_blob holds the full engine-computed settlement JSON verbatim.
// hash = sha256(prevHash || payloadBlob) for chain integrity (FR-S-008).
type SettlementRecord struct {
	SettlementID string `json:"settlement_id"`
	BuildingID   string `json:"building_id"`
	PayloadBlob  string `json:"payload_blob"`
	PrevHash     string `json:"prev_hash"`
	Hash         string `json:"hash"`
	TxID         string `json:"tx_id"`
	// BlockHeight는 체인코드 내에서 알 수 없음 — 커밋 후 SDK가 채운다.
	// Block height is unknown inside chaincode; the SDK fills it post-commit.
	BlockHeight int64  `json:"block_height"`
	Timestamp   string `json:"timestamp"` // RFC3339
}

// LatestIndex tracks the latest hash for a given building_id.
// Key: latest:{buildingID}
type LatestIndex struct {
	BuildingID string `json:"building_id"`
	Hash       string `json:"hash"`
	TxID       string `json:"tx_id"`
}

// LuciaContract is the Fabric smart contract struct.
type LuciaContract struct {
	contractapi.Contract
}

// zeroHash is the sentinel prevHash for the first record of a building.
// 정산 첫 번째 레코드의 이전 해시 센티넬 값 (64 zeros).
const zeroHash = "0000000000000000000000000000000000000000000000000000000000000000"

// keySettlement returns the ledger key for a settlement record.
func keySettlement(settlementID string) string {
	return fmt.Sprintf("settlement:%s", settlementID)
}

// keyLatest returns the ledger key for a building's latest hash index.
func keyLatest(buildingID string) string {
	return fmt.Sprintf("latest:%s", buildingID)
}

// keyTx returns the secondary index mapping tx_id -> settlement_id.
func keyTx(txID string) string {
	return fmt.Sprintf("tx:%s", txID)
}

// computeHash computes sha256(prevHash || payloadBlob) and returns hex string.
// FR-S-008 해시 체인 무결성 검증에 사용.
func computeHash(prevHash, payloadBlob string) string {
	h := sha256.New()
	h.Write([]byte(prevHash))
	h.Write([]byte(payloadBlob))
	return fmt.Sprintf("%x", h.Sum(nil))
}

// Settle stores a new settlement result on the ledger.
//
// Parameters:
//   - settlementID: unique identifier for this settlement (from engine).
//   - payloadBlob:  JSON string produced by the engine; must contain
//     "settlement_id" and "building_id" fields.
//   - prevHash:     sha256 hash of the previous settlement for this building.
//     Pass the 64-zero zeroHash for the first record.
//
// Returns tx_id, block_height (placeholder 0), hash, or error.
//
// FR-S-008: rejects with "hash_mismatch" if prevHash != stored latestHash.
func (c *LuciaContract) Settle(
	ctx contractapi.TransactionContextInterface,
	settlementID string,
	payloadBlob string,
	prevHash string,
) (string, int64, string, error) {
	stub := ctx.GetStub()

	// --- prevHash 유효성 검증 (FR-S-008) ---
	// Validate prevHash against stored latest hash for this building.

	// Decode minimal fields from payloadBlob to get building_id.
	var minimal struct {
		BuildingID string `json:"building_id"`
	}
	if err := json.Unmarshal([]byte(payloadBlob), &minimal); err != nil {
		return "", 0, "", fmt.Errorf("invalid payload_blob: %w", err)
	}
	if minimal.BuildingID == "" {
		return "", 0, "", fmt.Errorf("payload_blob missing building_id")
	}
	if settlementID == "" {
		return "", 0, "", fmt.Errorf("settlementID must not be empty")
	}

	// Reject duplicate settlement IDs (idempotency guard).
	existing, err := stub.GetState(keySettlement(settlementID))
	if err != nil {
		return "", 0, "", fmt.Errorf("state read error: %w", err)
	}
	if existing != nil {
		return "", 0, "", fmt.Errorf("settlement already exists: %s", settlementID)
	}

	// Load the latest hash for this building; default to zeroHash on first record.
	storedLatest, err := stub.GetState(keyLatest(minimal.BuildingID))
	if err != nil {
		return "", 0, "", fmt.Errorf("state read error (latest): %w", err)
	}

	var expectedPrevHash string
	if storedLatest == nil {
		// 첫 번째 레코드: 이전 해시는 제로 해시여야 한다.
		expectedPrevHash = zeroHash
	} else {
		var idx LatestIndex
		if err := json.Unmarshal(storedLatest, &idx); err != nil {
			return "", 0, "", fmt.Errorf("corrupt latest index: %w", err)
		}
		expectedPrevHash = idx.Hash
	}

	// FR-S-008: hash chain integrity check.
	if prevHash != expectedPrevHash {
		return "", 0, "", fmt.Errorf("hash_mismatch: expected %s, got %s",
			expectedPrevHash, prevHash)
	}

	// Compute new hash: sha256(prevHash || payloadBlob).
	newHash := computeHash(prevHash, payloadBlob)
	txID := stub.GetTxID()
	now := time.Now().UTC().Format(time.RFC3339)

	record := SettlementRecord{
		SettlementID: settlementID,
		BuildingID:   minimal.BuildingID,
		PayloadBlob:  payloadBlob,
		PrevHash:     prevHash,
		Hash:         newHash,
		TxID:         txID,
		BlockHeight:  0, // filled by SDK post-commit
		Timestamp:    now,
	}

	recordBytes, err := json.Marshal(record)
	if err != nil {
		return "", 0, "", fmt.Errorf("marshal error: %w", err)
	}

	// Write primary record: settlement:{settlementID}
	if err := stub.PutState(keySettlement(settlementID), recordBytes); err != nil {
		return "", 0, "", fmt.Errorf("put settlement: %w", err)
	}

	// Write secondary index: tx:{txID} -> settlementID
	if err := stub.PutState(keyTx(txID), []byte(settlementID)); err != nil {
		return "", 0, "", fmt.Errorf("put tx index: %w", err)
	}

	// Update per-building latest hash index.
	newIdx := LatestIndex{
		BuildingID: minimal.BuildingID,
		Hash:       newHash,
		TxID:       txID,
	}
	idxBytes, err := json.Marshal(newIdx)
	if err != nil {
		return "", 0, "", fmt.Errorf("marshal latest index: %w", err)
	}
	if err := stub.PutState(keyLatest(minimal.BuildingID), idxBytes); err != nil {
		return "", 0, "", fmt.Errorf("put latest index: %w", err)
	}

	return txID, 0, newHash, nil
}

// Verify retrieves the full settlement record by tx_id.
// tx_id -> settlement_id -> record (two key-based lookups, LevelDB-native).
func (c *LuciaContract) Verify(
	ctx contractapi.TransactionContextInterface,
	txID string,
) (string, error) {
	stub := ctx.GetStub()

	settIDBytes, err := stub.GetState(keyTx(txID))
	if err != nil {
		return "", fmt.Errorf("tx index read error: %w", err)
	}
	if settIDBytes == nil {
		return "", fmt.Errorf("tx_id not found: %s", txID)
	}

	recordBytes, err := stub.GetState(keySettlement(string(settIDBytes)))
	if err != nil {
		return "", fmt.Errorf("settlement read error: %w", err)
	}
	if recordBytes == nil {
		return "", fmt.Errorf("settlement not found for tx_id: %s", txID)
	}

	return string(recordBytes), nil
}

// History returns settlement records for a building within a time range.
// fromTs and toTs are RFC3339 strings. Returns JSON array of record strings.
//
// LevelDB composite key range scan by building_id prefix.
// FR-S-007: key-based range scan is O(k) where k = records in range.
func (c *LuciaContract) History(
	ctx contractapi.TransactionContextInterface,
	buildingID string,
	fromTs string,
	toTs string,
) ([]string, error) {
	stub := ctx.GetStub()

	// Parse time bounds.
	var fromTime, toTime time.Time
	var err error

	if fromTs != "" {
		fromTime, err = time.Parse(time.RFC3339, fromTs)
		if err != nil {
			return nil, fmt.Errorf("invalid fromTs: %w", err)
		}
	}
	if toTs != "" {
		toTime, err = time.Parse(time.RFC3339, toTs)
		if err != nil {
			return nil, fmt.Errorf("invalid toTs: %w", err)
		}
	}

	// Range scan: settlement:{buildingID}/ prefix approach using GetStateByRange.
	// Keys are "settlement:{settlementID}" — we scan all and filter by building_id.
	// For the pilot scale (<=116 buildings, bounded record count) this is acceptable.
	// Phase 2: switch to composite keys or CouchDB rich queries.
	startKey := "settlement:"
	endKey := "settlement:~" // "~" sorts after all printable ASCII

	iter, err := stub.GetStateByRange(startKey, endKey)
	if err != nil {
		return nil, fmt.Errorf("range scan error: %w", err)
	}
	defer iter.Close()

	var results []string
	for iter.HasNext() {
		kv, err := iter.Next()
		if err != nil {
			return nil, fmt.Errorf("iterator error: %w", err)
		}

		var rec SettlementRecord
		if err := json.Unmarshal(kv.Value, &rec); err != nil {
			continue // skip corrupt records
		}

		// Filter by building_id.
		if rec.BuildingID != buildingID {
			continue
		}

		// Filter by time range if provided.
		if fromTs != "" || toTs != "" {
			recTime, err := time.Parse(time.RFC3339, rec.Timestamp)
			if err != nil {
				continue
			}
			if fromTs != "" && recTime.Before(fromTime) {
				continue
			}
			if toTs != "" && recTime.After(toTime) {
				continue
			}
		}

		results = append(results, string(kv.Value))
	}

	return results, nil
}

// HelloWorld returns "ok". Used by P0.6 acceptance gate (make chain-hello).
// chain/network/scripts/hello-world.sh 스크립트의 수락 게이트 용도.
func (c *LuciaContract) HelloWorld(
	ctx contractapi.TransactionContextInterface,
) (string, error) {
	return "ok", nil
}

func main() {
	cc, err := contractapi.NewChaincode(&LuciaContract{})
	if err != nil {
		log.Panicf("Error creating Lucia chaincode: %v", err)
	}
	if err := cc.Start(); err != nil {
		log.Panicf("Error starting Lucia chaincode: %v", err)
	}
}
