// Package main — table-driven tests for the Lucia settlement chaincode.
// Uses the contractapi shimtest / MockStub patterns.
//
// FR-S-008: hash_mismatch rejection tested explicitly.
// Run: go test ./... from chain/chaincode/
package main

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"testing"

	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-chaincode-go/shimtest"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// newMockStub creates a MockStub wired to the LuciaContract chaincode.
func newMockStub(t *testing.T) *shimtest.MockStub {
	t.Helper()
	cc, err := contractapi.NewChaincode(&LuciaContract{})
	if err != nil {
		t.Fatalf("NewChaincode: %v", err)
	}
	stub := shimtest.NewMockStub("lucia-test", cc)
	if stub == nil {
		t.Fatal("MockStub is nil")
	}
	return stub
}

// invoke calls a chaincode function via the mock stub and returns the response.
func invoke(stub *shimtest.MockStub, fn string, args ...string) shim.Response {
	params := [][]byte{[]byte(fn)}
	for _, a := range args {
		params = append(params, []byte(a))
	}
	return stub.MockInvoke("tx-"+fn, params)
}

// mustSettle calls Settle and asserts success, returning txID and hash.
func mustSettle(t *testing.T, stub *shimtest.MockStub, settlementID, payload, prevHash string) (txID, hash string) {
	t.Helper()
	resp := invoke(stub, "LuciaContract:Settle", settlementID, payload, prevHash)
	if resp.Status != 200 {
		t.Fatalf("Settle failed: %s", resp.Message)
	}
	// Response payload is a JSON array: [txID, blockHeight, hash]
	// contractapi serialises multiple return values as a JSON array.
	var result []interface{}
	if err := json.Unmarshal(resp.Payload, &result); err != nil {
		t.Fatalf("unmarshal Settle result: %v (payload=%s)", err, resp.Payload)
	}
	if len(result) < 3 {
		t.Fatalf("expected 3-element result, got %d: %s", len(result), resp.Payload)
	}
	txID = fmt.Sprintf("%v", result[0])
	hash = fmt.Sprintf("%v", result[2])
	return txID, hash
}

// buildPayload returns a minimal valid payload JSON string.
func buildPayload(settlementID, buildingID string, kwh float64) string {
	return fmt.Sprintf(
		`{"settlement_id":%q,"building_id":%q,"kwh":%.4f}`,
		settlementID, buildingID, kwh,
	)
}

// expectedHash computes sha256(prevHash || payloadBlob) the same way chaincode does.
func expectedHash(prevHash, payloadBlob string) string {
	h := sha256.New()
	h.Write([]byte(prevHash))
	h.Write([]byte(payloadBlob))
	return fmt.Sprintf("%x", h.Sum(nil))
}

// ---------------------------------------------------------------------------
// Test: happy-path settle with no prev_hash (first record per building)
// FR-S-007, FR-S-008
// ---------------------------------------------------------------------------

func TestSettle_FirstRecord(t *testing.T) {
	stub := newMockStub(t)

	payload := buildPayload("SETT-001", "ULJN-001", 1.2)
	txID, hash := mustSettle(t, stub, "SETT-001", payload, zeroHash)

	if txID == "" {
		t.Error("expected non-empty txID")
	}
	want := expectedHash(zeroHash, payload)
	if hash != want {
		t.Errorf("hash mismatch: got %s, want %s", hash, want)
	}
}

// ---------------------------------------------------------------------------
// Test: settle with valid prev_hash linkage (second record chained to first)
// FR-S-008 해시 체인 연결 정상 동작 확인
// ---------------------------------------------------------------------------

func TestSettle_ValidPrevHashLinkage(t *testing.T) {
	stub := newMockStub(t)

	payload1 := buildPayload("SETT-001", "ULJN-001", 1.0)
	_, hash1 := mustSettle(t, stub, "SETT-001", payload1, zeroHash)

	payload2 := buildPayload("SETT-002", "ULJN-001", 2.0)
	_, hash2 := mustSettle(t, stub, "SETT-002", payload2, hash1)

	want := expectedHash(hash1, payload2)
	if hash2 != want {
		t.Errorf("second record hash mismatch: got %s, want %s", hash2, want)
	}
}

// ---------------------------------------------------------------------------
// Test: tamper rejection — mismatched prevHash must return hash_mismatch error
// FR-S-008: 위변조 시도 거부 (hash_mismatch)
// ---------------------------------------------------------------------------

func TestSettle_TamperRejection(t *testing.T) {
	stub := newMockStub(t)

	// First record establishes the chain.
	payload1 := buildPayload("SETT-001", "ULJN-002", 1.0)
	mustSettle(t, stub, "SETT-001", payload1, zeroHash)

	// Second record with an incorrect prevHash must be rejected.
	wrongHash := "deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
	payload2 := buildPayload("SETT-002", "ULJN-002", 1.5)
	resp := invoke(stub, "LuciaContract:Settle", "SETT-002", payload2, wrongHash)

	if resp.Status == 200 {
		t.Error("expected Settle to fail with hash_mismatch, but it succeeded")
	}
	if resp.Message == "" {
		t.Error("expected non-empty error message on tamper rejection")
	}
}

// ---------------------------------------------------------------------------
// Test: Verify returns the stored record by tx_id
// ---------------------------------------------------------------------------

func TestVerify_ReturnsStoredRecord(t *testing.T) {
	stub := newMockStub(t)

	payload := buildPayload("SETT-010", "ULJN-003", 3.7)
	txID, _ := mustSettle(t, stub, "SETT-010", payload, zeroHash)

	resp := invoke(stub, "LuciaContract:Verify", txID)
	if resp.Status != 200 {
		t.Fatalf("Verify failed: %s", resp.Message)
	}

	// Payload is a JSON string (single return value wrapped by contractapi).
	var recordJSON string
	if err := json.Unmarshal(resp.Payload, &recordJSON); err != nil {
		t.Fatalf("unmarshal Verify result: %v (payload=%s)", err, resp.Payload)
	}

	var rec SettlementRecord
	if err := json.Unmarshal([]byte(recordJSON), &rec); err != nil {
		t.Fatalf("unmarshal SettlementRecord: %v", err)
	}

	if rec.SettlementID != "SETT-010" {
		t.Errorf("settlement_id: got %s, want SETT-010", rec.SettlementID)
	}
	if rec.BuildingID != "ULJN-003" {
		t.Errorf("building_id: got %s, want ULJN-003", rec.BuildingID)
	}
	if rec.TxID != txID {
		t.Errorf("tx_id: got %s, want %s", rec.TxID, txID)
	}
}

// ---------------------------------------------------------------------------
// Test: Verify with unknown tx_id returns error
// ---------------------------------------------------------------------------

func TestVerify_UnknownTxID(t *testing.T) {
	stub := newMockStub(t)
	resp := invoke(stub, "LuciaContract:Verify", "does-not-exist")
	if resp.Status == 200 {
		t.Error("expected Verify to fail for unknown tx_id")
	}
}

// ---------------------------------------------------------------------------
// Test: History returns records in chronological order for a building
// 건물별 정산 이력 시간 순 반환 확인
// ---------------------------------------------------------------------------

func TestHistory_ChronologicalRecords(t *testing.T) {
	stub := newMockStub(t)
	buildingID := "ULJN-004"

	// Insert 3 records for ULJN-004 in chain order.
	payload1 := buildPayload("SETT-H01", buildingID, 1.0)
	_, h1 := mustSettle(t, stub, "SETT-H01", payload1, zeroHash)

	payload2 := buildPayload("SETT-H02", buildingID, 2.0)
	_, h2 := mustSettle(t, stub, "SETT-H02", payload2, h1)

	payload3 := buildPayload("SETT-H03", buildingID, 3.0)
	mustSettle(t, stub, "SETT-H03", payload3, h2)

	// Also insert a record for a different building — must not appear in results.
	otherPayload := buildPayload("SETT-OTHER", "ULJN-999", 9.0)
	mustSettle(t, stub, "SETT-OTHER", otherPayload, zeroHash)

	resp := invoke(stub, "LuciaContract:History", buildingID, "", "")
	if resp.Status != 200 {
		t.Fatalf("History failed: %s", resp.Message)
	}

	var records []string
	if err := json.Unmarshal(resp.Payload, &records); err != nil {
		t.Fatalf("unmarshal History result: %v (payload=%s)", err, resp.Payload)
	}

	// Expect exactly 3 records for ULJN-004.
	if len(records) != 3 {
		t.Errorf("expected 3 records for %s, got %d", buildingID, len(records))
	}

	// All returned records must belong to the queried building.
	for i, raw := range records {
		var rec SettlementRecord
		if err := json.Unmarshal([]byte(raw), &rec); err != nil {
			t.Errorf("record[%d] unmarshal: %v", i, err)
			continue
		}
		if rec.BuildingID != buildingID {
			t.Errorf("record[%d] building_id: got %s, want %s", i, rec.BuildingID, buildingID)
		}
	}
}

// ---------------------------------------------------------------------------
// Test: HelloWorld returns "ok"
// P0.6 체인 수락 게이트 확인
// ---------------------------------------------------------------------------

func TestHelloWorld(t *testing.T) {
	stub := newMockStub(t)
	resp := invoke(stub, "LuciaContract:HelloWorld")
	if resp.Status != 200 {
		t.Fatalf("HelloWorld failed: %s", resp.Message)
	}
	var result string
	if err := json.Unmarshal(resp.Payload, &result); err != nil {
		t.Fatalf("unmarshal HelloWorld: %v (payload=%s)", err, resp.Payload)
	}
	if result != "ok" {
		t.Errorf("HelloWorld: got %q, want %q", result, "ok")
	}
}

// ---------------------------------------------------------------------------
// Test: duplicate settlement_id is rejected
// ---------------------------------------------------------------------------

func TestSettle_DuplicateIDRejected(t *testing.T) {
	stub := newMockStub(t)

	payload := buildPayload("SETT-DUP", "ULJN-005", 1.0)
	mustSettle(t, stub, "SETT-DUP", payload, zeroHash)

	// Second attempt with same ID must fail.
	resp := invoke(stub, "LuciaContract:Settle", "SETT-DUP", payload, zeroHash)
	if resp.Status == 200 {
		t.Error("expected second Settle with same ID to fail")
	}
}
