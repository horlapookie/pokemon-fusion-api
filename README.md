# Fusion Pokémon API

Fusion Pokémon API is a JSON-backed Pokédex and battle toolkit for game bots, fan tools, and web clients. The initial catalog contains 50 original Fusion Pokémon with parents, types, lore, stats, abilities, custom moves, sprites, and battle metadata.

## Highlights

- 50 original Fusion Pokémon, including Mythic entries such as Solarion and Deoxymetal
- Typed REST API under `/api/v1`
- Search, pagination, type/rarity/parent filters, and random discovery
- Custom move and ability databases
- Full 18-type matchup reference with weaknesses, resistances, and immunities
- Damage, battle snapshot, and turn simulation endpoints
- Responsive Fusion Pokédex web app with copyable API examples
- JSON-backed catalog designed to migrate cleanly to PostgreSQL or MongoDB later

## Project layout

```text
artifacts/
  api-server/             Express API and catalog logic
  fusion-pokedex/         React + Vite web frontend
lib/
  api-spec/               OpenAPI 3.1 source of truth
  api-client-react/       Generated React Query client
  api-zod/                Generated Zod schemas
tests/                    Data and endpoint contract checks
```

## Requirements

- Node.js 20+
- pnpm 9+

## Installation

```bash
pnpm install
pnpm --filter @workspace/api-spec run codegen
```

No database or API key is needed for the initial JSON release.

## Running locally

Run the API server and frontend in separate terminals:

```bash
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/fusion-pokedex run dev
```

The Replit workflows provide `PORT` and `BASE_PATH`. For direct local runs, use the same environment variables expected by the artifact workflows.

## Base URL and versioning

- Development API base path: `/api`
- Versioned API base URL: `/api/v1`
- Health check: `GET /api/healthz`
- Current API version: `v1`
- All successful responses use `{ "success": true, "data": ..., "count": ... }`
- Errors use `{ "success": false, "error": { "code": "...", "message": "..." } }`

## API endpoints

### Overview and statistics

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/v1` | API name, version, description, and resources |
| GET | `/api/v1/stats` | Catalog counts and last update date |

### Fusions

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/v1/fusions` | List fusions |
| GET | `/api/v1/fusions/:id` | Get a fusion by ID |
| GET | `/api/v1/fusions/name/:name` | Get a fusion by exact name |
| GET | `/api/v1/fusions/random` | Get a random fusion |
| GET | `/api/v1/fusions/search?q=` | Search the fusion catalog |

Supported list query parameters:

- `type=Psychic`
- `rarity=Mythic`
- `parent=Deoxys`
- `q=moon`
- `page=1`
- `limit=50` (maximum 100)

Example:

```bash
curl 'http://localhost/api/v1/fusions?type=Psychic&rarity=Mythic'
curl 'http://localhost/api/v1/fusions/name/Deoxymetal'
curl 'http://localhost/api/v1/fusions/search?q=moon'
```

### Moves

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/v1/moves` | List custom moves |
| GET | `/api/v1/moves/:id` | Get a move by ID |
| GET | `/api/v1/moves/name/:name` | Get a move by exact name |
| GET | `/api/v1/moves/random` | Get a random move |

Move filters include `type`, `category`, `q`, and `limit`.

### Abilities

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/v1/abilities` | List abilities |
| GET | `/api/v1/abilities/:id` | Get an ability by ID |
| GET | `/api/v1/abilities/name/:name` | Get an ability by exact name |

Ability search uses `q` and supports `limit`.

### Types and rarities

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/v1/types` | List all elemental types |
| GET | `/api/v1/types/:type` | Get a type |
| GET | `/api/v1/types/:type/matchups` | Get matchup details |
| GET | `/api/v1/rarities` | List rarities and counts |
| GET | `/api/v1/rarities/:rarity` | List fusions in a rarity |

### Battle

| Method | Endpoint | Body |
| --- | --- | --- |
| POST | `/api/v1/battle/damage` | `attackerId`, `defenderId`, `moveId`, optional `critical`, `randomFactor` |
| POST | `/api/v1/battle/calculate` | `attackerId`, `defenderId`, optional `moveId` |
| POST | `/api/v1/battle/turn` | `attackerId`, `defenderId`, `attackerMoveId`, `defenderMoveId` |

Example:

```bash
curl -X POST http://localhost/api/v1/battle/damage \
  -H 'content-type: application/json' \
  -d '{"attackerId":"fusion-050","defenderId":"fusion-003","moveId":"move-fusion-050-signature","critical":true}'
```

## Data models

### Fusion

`id`, `name`, `parents[]`, `types[]`, `rarity`, `description`, `stats`, `abilities[]`, `hiddenAbility`, `weaknesses[]`, `resistances[]`, `immunities[]`, `moves[]`, `sprite`, and `battle`.

Stats contain `hp`, `attack`, `defense`, `specialAttack`, `specialDefense`, `speed`, and `total`.

### Move

`id`, `name`, `type`, `category`, `power`, `accuracy`, `pp`, `priority`, `description`, `statusEffects[]`, `statChanges[]`, `effectChance`, `recoil`, `healing`, `target`, and `criticalHit`.

### Ability

`id`, `name`, `description`, `trigger`, and `rarity`.

## Type and battle systems

The type catalog contains Normal, Fire, Water, Electric, Grass, Ice, Fighting, Poison, Ground, Flying, Psychic, Bug, Rock, Ghost, Dragon, Dark, Steel, and Fairy. Every type exposes offensive and defensive relationships. Dual-type defenders multiply each relationship, while STAB and critical-hit bonuses are applied by the damage engine.

Damage uses the familiar level-50 formula with the move category selecting physical or special stats. It applies same-type attack bonus, type effectiveness, critical-hit multiplier, and an optional random factor between `0.85` and `1`.

## Frontend

The web app is available at the project root and includes:

- Home dashboard
- Fusion Pokédex with search and filters
- Fusion detail pages
- Move and ability databases
- Type matchup explorer
- API documentation with interactive examples and copy buttons
- Battle calculator and turn simulator

The frontend consumes the API and does not maintain a second copy of the catalog.

## OpenAPI and code generation

Edit `lib/api-spec/openapi.yaml` first, then regenerate clients:

```bash
pnpm --filter @workspace/api-spec run codegen
```

Generated files live in `lib/api-client-react/src/generated/` and `lib/api-zod/src/generated/`. Do not hand-edit generated files.

## Verification

```bash
pnpm run typecheck
pnpm --filter @workspace/api-server run typecheck
```

The data suite can be run after the API server package is built:

```bash
pnpm --filter @workspace/api-server run build
node --test tests/catalog.test.mjs
```

## Environment variables

The initial release does not require secrets. The artifact workflows provide:

- `PORT` — service port
- `BASE_PATH` — frontend route prefix
- `NODE_ENV` — runtime environment

## Production deployment

Build the workspaces:

```bash
pnpm run build
```

Publish the Replit project to expose the API and frontend through the configured artifact routes. Keep the API and frontend in the same project so relative `/api` requests continue to work.

## Changelog

### 1.0.0

- Added 50 original Fusion Pokémon
- Added custom move and ability catalogs
- Added type matchup and rarity endpoints
- Added battle damage, battle snapshot, and turn simulation
- Added React Pokédex and API explorer

## Contributing

1. Update the OpenAPI contract for endpoint changes.
2. Run code generation.
3. Keep catalog entries original and complete.
4. Run typechecks before opening a pull request.
5. Update the changelog and README when the public API changes.

## License

MIT. See `LICENSE`.