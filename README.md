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

## Demo accounts (v1.3)

Sign in at `/login` and pick any of the eight pre-seeded accounts. Authentication
is mock-token (FR-A-001) — no real credentials required.

| Account ID         | Role     | Persona                           | Lands on              |
|--------------------|----------|-----------------------------------|-----------------------|
| `u_analyst_kim`    | analyst  | LH ESG 경영실 김지호 처장         | `/` (KIE-REMS dash)   |
| `u_operator_spc`   | operator | 울진 매입임대 SPC 운영팀          | `/` (KIE-REMS dash)   |
| `h0001`            | resident | 홍*동 (ULJN-001 · LH 매입임대)    | `/portal/h0001`       |
| `k0014`            | resident | 김*수 (YESN-014 · 국민임대)       | `/portal/k0014`       |
| `e0042`            | resident | 이*경 (BSAN-042 · 에너지소외)     | `/portal/e0042`       |
| `u_investor_a01`   | investor | SK하이닉스 ESG실 (RE100, 약정 PPA)| `/invest/dashboard`   |
| `i0002`            | investor | 삼성전자 ESG팀 (RE100, 80,000 MWh)| `/invest/dashboard`   |
| `i0003`            | investor | 김투자 (Retail, 1천~5천만원)     | `/invest/dashboard`   |

The full account roster lives in `apps/web/src/auth/demoAccounts.ts`. The
demo-investor onboarding wizards (`/invest/onboarding/{re100,retail}`) accept
arbitrary mock SMS codes — any 6 digits + valid Korean phone format passes.

### Public surfaces (no login)

These v1.3 marketing/sales pages are open to crawlers and direct visitors:

| Path                                  | FR        | Highlights                                                      |
|---------------------------------------|-----------|-----------------------------------------------------------------|
| `/invest`                             | FR-R-001  | Landing                                                         |
| `/invest/projects`                    | FR-R-002  | 9,354-building catalog with region filters / sort / pagination  |
| `/invest/projects/:siteId`            | FR-R-002  | Site detail with simulator + onboarding CTAs                    |
| `/invest/simulator?site=…`            | FR-O-006  | Investor-equity simulator (capital structure + KEA 융자금)        |
| `/invest/onboarding/re100?site=…`     | FR-R-003  | 5-step RE100 corporate onboarding wizard                        |
| `/invest/onboarding/retail?site=…`    | FR-R-004  | 3-step retail individual onboarding wizard (비구속력)            |
| `/invest/portfolio?investor=…`        | FR-R-006  | 4-tab investor portfolio dashboard                              |

Auth-gated v1.3 routes (`/admin/loi`, `/admin/loi/:loi_id`, `/portal/:user_id/esg`,
`/portal/:user_id/community`, `/invest/dashboard`) carry `X-Robots-Tag: noindex,
nofollow` per `vercel.json`.

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
