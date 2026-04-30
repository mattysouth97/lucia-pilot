# Lucia Pilot — top-level Makefile
# Wraps pnpm + docker compose + AWS load test for one-command operations.

.PHONY: help install typecheck lint test build dev up down logs clean \
        chain-hello chain-up chain-down \
        load-test-aws-smoke load-test-aws-full \
        verify-p0

help:
	@echo "Lucia Pilot — common commands:"
	@echo "  make install          - pnpm install + go mod download"
	@echo "  make typecheck        - pnpm typecheck across workspace"
	@echo "  make test             - all unit + integration tests"
	@echo "  make dev              - run engine + web + simulator (dev mode)"
	@echo "  make up               - docker compose up (postgres+timescale, mosquitto, redis, fabric)"
	@echo "  make down             - docker compose down -v"
	@echo "  make chain-hello      - submit hello-world chaincode tx (P0.6 acceptance)"
	@echo "  make load-test-aws-* - run k6 load test on AWS (FR-O-001)"
	@echo "  make verify-p0        - run the full P0 acceptance gate command"

install:
	pnpm install
	cd chain/chaincode && go mod download

typecheck:
	pnpm typecheck

lint:
	pnpm lint

test:
	pnpm test
	pnpm test:fixtures
	cd chain/chaincode && go test ./...

build:
	pnpm build

dev:
	pnpm dev

up:
	docker compose -f docker/docker-compose.yml up -d
	@echo "Waiting for services to be healthy..."
	@sleep 30
	docker compose -f docker/docker-compose.yml ps

down:
	docker compose -f docker/docker-compose.yml down -v

logs:
	docker compose -f docker/docker-compose.yml logs -f --tail=100

clean:
	pnpm clean
	docker compose -f docker/docker-compose.yml down -v --remove-orphans

# Hyperledger Fabric — depends on `make up` first
chain-up:
	bash chain/network/scripts/network-up.sh

chain-down:
	bash chain/network/scripts/network-down.sh

chain-hello:
	bash chain/network/scripts/hello-world.sh

# AWS load tests (FR-O-001) — requires P0.13 provisioning
load-test-aws-smoke:
	bash infra/aws/run-loadtest.sh smoke

load-test-aws-full:
	bash infra/aws/run-loadtest.sh full

# P0 acceptance gate (per .omc/plans/lucia-pilot-implementation.md)
verify-p0:
	pnpm install
	pnpm typecheck
	pnpm lint
	pnpm test
	pnpm test:fixtures
	pnpm build
	docker compose -f docker/docker-compose.yml up -d
	sleep 30
	curl -fsS localhost:3000/healthz
	$(MAKE) chain-hello
	aws sts get-caller-identity
