# docker/fabric — Hyperledger Fabric configuration

## Prerequisites before first `docker compose up`

Crypto materials (MSP certificates, genesis block, channel transaction) are NOT
committed to the repository (they are gitignored). They must be generated once
before starting the stack.

Run the bootstrap script from the repo root:

```sh
bash chain/network/scripts/network-up.sh
```

This script calls `cryptogen` and `configtxgen` using
`chain/network/configtx.yaml`, then places the generated artifacts into:

```
docker/fabric/orderer/     genesis.block, msp/
docker/fabric/peer/        msp/, tls/
docker/fabric/ca/          (CA server initialises its own keystore on first boot)
```

After the crypto materials exist, start the stack normally:

```sh
docker compose -f docker/docker-compose.yml up -d
```

Then complete channel and chaincode setup (also handled by network-up.sh or
its sub-scripts):

```sh
bash chain/network/scripts/channel-setup.sh
bash chain/network/scripts/chaincode-deploy.sh
```

## Gitignored paths

The following are excluded from version control (see .gitignore):

- `docker/fabric/orderer/msp/`
- `docker/fabric/orderer/genesis.block`
- `docker/fabric/peer/msp/`
- `docker/fabric/peer/tls/`
- `docker/fabric/ca/*.db`
- `docker/fabric/ca/msp/`

## State database

Per ADR-0002, the peer uses **LevelDB** (`goleveldb`). LevelDB is embedded in
the peer binary — no CouchDB container is required. Phase 2 production may
switch to CouchDB via a config change; no chaincode rewrite is needed.

## References

- `chain/network/configtx.yaml` — channel and organisation policy definitions
- `docker/docker-compose.yml` — service definitions and environment overrides
- `.omc/plans/lucia-pilot-implementation.md` — ADR-0002 (state DB rationale)
