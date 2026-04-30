# docker/ — Lucia Pilot compose stack

## Services and ports

| Service        | Image                                  | Port(s)        | Purpose                                  |
|----------------|----------------------------------------|----------------|------------------------------------------|
| postgres       | timescale/timescaledb:2.15.0-pg16-oss  | 5432           | TimescaleDB — generation_events, settlements |
| mosquitto      | eclipse-mosquitto:2.0                  | 1883 / 9001    | MQTT broker (plain / WebSocket)          |
| redis          | redis:7-alpine                         | 6379           | BullMQ per-building queues (ADR-0003)    |
| fabric-orderer | hyperledger/fabric-orderer:2.5         | 7050           | Solo orderer (demo); Raft in Phase 2     |
| fabric-peer    | hyperledger/fabric-peer:2.5            | 7051 / 7052    | Peer + chaincode listener (LevelDB)      |
| fabric-ca      | hyperledger/fabric-ca:1.5              | 7054           | MSP identity issuance                    |

## State database note

The Fabric peer runs with **LevelDB** (`CORE_LEDGER_STATE_STATEDATABASE=goleveldb`).
No CouchDB container is present. See ADR-0002 in
`.omc/plans/lucia-pilot-implementation.md` for the rationale.

## First-time setup

Crypto materials must exist before the stack starts. Generate them once:

```sh
# From the repo root
bash chain/network/scripts/network-up.sh
```

Then start all services:

```sh
make up
# or directly:
docker compose -f docker/docker-compose.yml up -d
```

After the stack is healthy, complete channel and chaincode bootstrap:

```sh
bash chain/network/scripts/channel-setup.sh
bash chain/network/scripts/chaincode-deploy.sh
```

Verify the hello-world chaincode transaction (P0.6 acceptance gate):

```sh
make chain-hello
# or:
bash chain/network/scripts/hello-tx.sh
```

## Subsequent starts

```sh
make up      # start (or restart) all services detached
make down    # stop and remove containers (volumes preserved)
make reset   # make down + remove named volumes (destructive — regenerate crypto after)
```

## Makefile targets

| Target       | Command                                              |
|--------------|------------------------------------------------------|
| `make up`    | `docker compose -f docker/docker-compose.yml up -d` |
| `make down`  | `docker compose -f docker/docker-compose.yml down`  |
| `make logs`  | `docker compose -f docker/docker-compose.yml logs -f` |
| `make ps`    | `docker compose -f docker/docker-compose.yml ps`    |
| `make reset` | `make down` then remove named volumes               |

## Expected URLs after `make up`

| Service          | URL / address                       |
|------------------|-------------------------------------|
| Postgres (JDBC)  | `postgresql://lucia:lucia_pilot@localhost:5432/lucia` |
| MQTT broker      | `mqtt://localhost:1883`             |
| MQTT WebSocket   | `ws://localhost:9001`               |
| Redis            | `redis://localhost:6379`            |
| Fabric orderer   | `grpc://localhost:7050`             |
| Fabric peer      | `grpc://localhost:7051`             |
| Fabric CA        | `http://localhost:7054`             |
| Engine healthz   | `http://localhost:3001/healthz` (after `pnpm dev`) |
| Web dashboard    | `http://localhost:3000` (after `pnpm dev`)           |

## NFR-7 boot budget

Target: all six services healthy within 5 minutes on a 16 GB RAM laptop.
Each service has a healthcheck with `interval: 5s, retries: 12` (60 s window).
TimescaleDB and Fabric peer are the slowest to initialise; pull images in
advance with `docker compose pull` to reduce first-boot time.

## Crypto materials

Generated files are gitignored (see `docker/fabric/README.md`).
Never commit private keys or genesis blocks.
