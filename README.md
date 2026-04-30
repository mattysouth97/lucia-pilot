# Lucia Pilot — LH 매입임대 햇빛발전소 정산 플랫폼

Lucia Pilot is a 12-week solar-power settlement platform pilot for the LH-Uljin complex
(울진 매입임대 116동, 3 MW capacity). It automates per-building kWh settlement, SMP/REC
revenue allocation, and blockchain-anchored audit trails, targeting a live M+3 demo per
the storyboard in FRD-2026-001 §13.1. The platform is designed to scale from the 116-building
pilot to 9,354 buildings across the full LH 매입임대 portfolio without architectural change.

---

## Pipeline status

| Stage          | Tool              | Output                                          |
|----------------|-------------------|-------------------------------------------------|
| Spec           | deep-interview    | `.omc/specs/deep-interview-lucia-pilot.md`      |
| Plan           | ralplan (consensus) | `.omc/plans/lucia-pilot-implementation.md`    |
| Scaffolding    | autopilot         | This repository                                 |

Plan reference: ADR-0001 through ADR-0007, P0.1–P0.13, Option C (parallel tracks).
FRD reference: `untitled/project/uploads/TheKIE_LH_FRD.docx` (FRD-2026-001 v1.0).

---

## Repo structure

```
정산-handoff/
  apps/
    engine/          Node.js/TypeScript settlement engine (FR-S-002 ~ FR-S-008)
    web/             Next.js dashboard (FR-O-003, FR-O-004, FR-M-006)
    simulator/       IoT building data simulator (FR-D-003)
  packages/
    contracts/       Shared TypeScript types + Zod schemas (frozen-additive after wk1)
      fixtures/      Mock API response fixtures — validated by pnpm test:fixtures
  chain/
    chaincode/       Go chaincode (dumb persistence + hash-chain, ADR-0002)
    network/         Hyperledger Fabric network config (docker-compose)
  docker/
    docker-compose.yml  Full local stack: Postgres/TimescaleDB, Redis, Mosquitto, Fabric
  infra/
    aws/             AWS provisioning scaffolding for FR-O-001 load test (P0.13)
  docs/
    adr/             Architecture Decision Records (ADR-0001 ~ ADR-0007)
  untitled/
    project/         Claude Design prototype (visual reference, do not copy structure)
  .omc/
    plans/           Implementation plan (read-only)
    specs/           Deep-interview spec (read-only)
  .github/
    workflows/
      ci.yml         GitHub Actions CI (typecheck, lint, test, build, chain-test)
```

---

## Quick start

Requires: Node 20, pnpm 9, Go 1.22, Docker, Docker Compose.

```bash
# Install all workspace dependencies
make install

# Start the full local stack (Postgres, Redis, Mosquitto, Fabric peer)
make up

# Start the engine and web dev servers in watch mode
make dev
```

After `make up` the following services are available:

| Service              | URL / port                   |
|----------------------|------------------------------|
| Lucia dashboard      | http://localhost:3001         |
| Settlement engine    | http://localhost:3000         |
| Mosquitto MQTT       | tcp://localhost:1883          |
| Postgres/TimescaleDB | localhost:5432                |
| Redis                | localhost:6379                |
| Fabric peer gRPC     | localhost:7051                |

---

## FR-O-001 load test (AWS)

The 9,354-building load test runs on AWS and is the PM's responsibility (not autopilot).
See `infra/aws/README.md` for the full provisioning guide.

```bash
# After terraform apply:
bash infra/aws/run-loadtest.sh smoke   # 1,000 buildings, 5 min
bash infra/aws/run-loadtest.sh full    # 9,354 buildings, 15 min (FR-O-001 gate)
```

Pass criteria: `settlement_latency` p95 < 5,000 ms (NFR-1), `dashboard_latency` p95 < 3,000 ms (NFR-3).
Must complete before end of week 8 (P0.13 milestone).

---

## CI

GitHub Actions workflow: `.github/workflows/ci.yml`

Jobs on every PR and push to main:

| Job          | Command                             | Notes                                 |
|--------------|-------------------------------------|---------------------------------------|
| typecheck    | `pnpm typecheck`                    | Strict TS across all packages         |
| lint         | `pnpm lint`                         | ESLint                                |
| test         | `pnpm test && pnpm test:fixtures`   | vitest + fixture validation gate      |
| build        | `pnpm build`                        | Production build all apps             |
| chain-test   | `go test ./...`                     | Go chaincode (parallel, no pnpm dep)  |

---

## Key references

- FRD: `untitled/project/uploads/TheKIE_LH_FRD.docx` (FRD-2026-001 v1.0)
- Implementation plan: `.omc/plans/lucia-pilot-implementation.md`
- Deep-interview spec: `.omc/specs/deep-interview-lucia-pilot.md`
- Design prototype: `untitled/project/Lucia 정산 플랫폼.html`
- ADRs: `docs/adr/` (ADR-0001 monorepo, ADR-0002 chain boundary, ADR-0007 load test)

---

## 한국어 안내

이 저장소는 LH 울진 매입임대 116동(3MW) 햇빛발전소 정산 플랫폼 파일럿입니다.
FRD-2026-001에 따라 건물별 발전량 정산, SMP/REC 수익 배분, 블록체인 감사 기록을
자동화하며, M+3 시점 라이브 데모를 목표로 합니다.
설계 프로토타입은 `untitled/project/` 디렉터리에 있으며, 실제 구현의 시각적 기준입니다.
