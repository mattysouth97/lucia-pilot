#!/usr/bin/env bash
# run-loadtest.sh — FR-O-001 load test orchestration script
#
# Usage:
#   bash infra/aws/run-loadtest.sh smoke    # N=1,000 buildings, 5 min
#   bash infra/aws/run-loadtest.sh full     # N=9,354 buildings, 15 min
#
# Prerequisites:
#   - terraform apply has completed successfully in infra/aws/terraform/
#   - SSH key pair is available and its path is set in SSH_KEY_PATH env var
#     (default: ~/.ssh/lucia-pilot-loadtest.pem)
#   - AWS credentials are configured (aws configure)
#
# This script is the PM's entry point. It is NOT executed by autopilot.

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TF_DIR="${SCRIPT_DIR}/terraform"
SCENARIO_FILE="${SCRIPT_DIR}/k6-scenarios/lucia-load.js"
SSH_KEY_PATH="${SSH_KEY_PATH:-${HOME}/.ssh/lucia-pilot-loadtest.pem}"
SSH_USER="ubuntu"
REMOTE_SCENARIO_PATH="/home/ubuntu/k6-scenarios/lucia-load.js"

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------

MODE="${1:-}"

case "${MODE}" in
  smoke)
    VUS=1000
    DURATION="5m"
    RUN_LABEL="smoke"
    ;;
  full)
    VUS=9354
    DURATION="15m"
    RUN_LABEL="full"
    ;;
  *)
    echo "ERROR: argument must be 'smoke' or 'full'." >&2
    echo "Usage: bash infra/aws/run-loadtest.sh <smoke|full>" >&2
    exit 1
    ;;
esac

echo "=== Lucia Pilot FR-O-001 Load Test ==="
echo "Mode:     ${RUN_LABEL}"
echo "VUS:      ${VUS} (virtual buildings)"
echo "Duration: ${DURATION}"
echo ""

# ---------------------------------------------------------------------------
# Read Terraform outputs
# ---------------------------------------------------------------------------

echo "[1/5] Reading Terraform outputs..."

if ! command -v terraform &>/dev/null; then
  echo "ERROR: terraform not found in PATH. Install Terraform >= 1.7." >&2
  exit 1
fi

TF_OUTPUT_JSON=$(terraform -chdir="${TF_DIR}" output -json 2>/dev/null) || {
  echo "ERROR: Failed to read Terraform outputs." >&2
  echo "       Run 'terraform apply' in ${TF_DIR} first." >&2
  exit 1
}

INSTANCE_IP=$(echo "${TF_OUTPUT_JSON}" | jq -r '.instance_public_ip.value')
S3_BUCKET=$(echo "${TF_OUTPUT_JSON}" | jq -r '.s3_results_bucket.value')

if [[ -z "${INSTANCE_IP}" || "${INSTANCE_IP}" == "null" ]]; then
  echo "ERROR: instance_public_ip is empty. Is the EC2 instance running?" >&2
  exit 1
fi

if [[ -z "${S3_BUCKET}" || "${S3_BUCKET}" == "null" ]]; then
  echo "ERROR: s3_results_bucket is empty. Did terraform apply succeed?" >&2
  exit 1
fi

echo "  Instance IP: ${INSTANCE_IP}"
echo "  S3 bucket:   ${S3_BUCKET}"

# ---------------------------------------------------------------------------
# Validate SSH key
# ---------------------------------------------------------------------------

if [[ ! -f "${SSH_KEY_PATH}" ]]; then
  echo "ERROR: SSH key not found at ${SSH_KEY_PATH}." >&2
  echo "       Set SSH_KEY_PATH env var to the correct path." >&2
  exit 1
fi

chmod 600 "${SSH_KEY_PATH}"

SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=30 -i ${SSH_KEY_PATH}"

# ---------------------------------------------------------------------------
# Copy k6 scenario to the instance
# ---------------------------------------------------------------------------

echo "[2/5] Copying k6 scenario to instance..."

if [[ ! -f "${SCENARIO_FILE}" ]]; then
  echo "ERROR: k6 scenario not found at ${SCENARIO_FILE}." >&2
  exit 1
fi

scp ${SSH_OPTS} "${SCENARIO_FILE}" "${SSH_USER}@${INSTANCE_IP}:${REMOTE_SCENARIO_PATH}" || {
  echo "ERROR: scp failed. Check that the instance is reachable and SSH key is correct." >&2
  exit 1
}

echo "  Scenario uploaded."

# ---------------------------------------------------------------------------
# Run k6 on the instance
# ---------------------------------------------------------------------------

TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
RESULT_FILENAME="lucia-${RUN_LABEL}-${TIMESTAMP}.json"
REMOTE_RESULT_PATH="/home/ubuntu/k6-scenarios/${RESULT_FILENAME}"

echo "[3/5] Running k6 (${DURATION}, VUS=${VUS})..."
echo "      Streaming output below — this will take ${DURATION}."
echo ""

ssh ${SSH_OPTS} "${SSH_USER}@${INSTANCE_IP}" \
  "k6-mqtt run \
    --vus ${VUS} \
    --duration ${DURATION} \
    --summary-export ${REMOTE_RESULT_PATH} \
    -e VUS=${VUS} \
    ${REMOTE_SCENARIO_PATH}" || {
  echo ""
  echo "ERROR: k6 run failed or exited non-zero." >&2
  echo "       Check the output above for k6 error messages." >&2
  exit 1
}

echo ""
echo "  k6 run complete."

# ---------------------------------------------------------------------------
# Upload results to S3
# ---------------------------------------------------------------------------

echo "[4/5] Uploading result artifact to S3..."

S3_KEY="results/${RUN_LABEL}/${RESULT_FILENAME}"
S3_URI="s3://${S3_BUCKET}/${S3_KEY}"

ssh ${SSH_OPTS} "${SSH_USER}@${INSTANCE_IP}" \
  "aws s3 cp ${REMOTE_RESULT_PATH} ${S3_URI}" || {
  echo "ERROR: Failed to upload result to S3." >&2
  echo "       The result file is still on the instance at ${REMOTE_RESULT_PATH}." >&2
  exit 1
}

echo "  Uploaded: ${S3_URI}"

# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

echo "[5/5] Done."
echo ""
echo "=== FR-O-001 Load Test Complete ==="
echo "Run label: ${RUN_LABEL}"
echo "VUS:       ${VUS}"
echo "Duration:  ${DURATION}"
echo ""
echo "Result artifact:"
echo "  ${S3_URI}"
echo ""
echo "Pass criteria (NFR-1 / NFR-3):"
echo "  p95 settlement latency : <= 5000 ms"
echo "  p95 dashboard refresh  : <= 3000 ms"
echo ""
echo "Review the JSON summary above and the full report at:"
echo "  aws s3 cp ${S3_URI} ./lucia-result-${RUN_LABEL}.json && cat ./lucia-result-${RUN_LABEL}.json | jq"
