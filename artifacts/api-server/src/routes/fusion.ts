import { Router, type IRouter } from "express";
import {
  CalculateBattleBody,
  CalculateDamageBody,
  SimulateBattleTurnBody,
} from "@workspace/api-zod";
import {
  abilities,
  calculateDamage,
  fusions,
  getAbility,
  getFusion,
  getMove,
  getRarity,
  getType,
  moves,
  rarities,
  types,
  type Fusion,
  type Move,
} from "../lib/catalog";

const router: IRouter = Router();

const response = <T>(data: T, count?: number, total?: number) => ({
  success: true,
  data,
  ...(count === undefined ? {} : { count }),
  ...(total === undefined ? {} : { total }),
});

const errorResponse = (code: string, message: string, details?: unknown) => ({
  success: false,
  error: { code, message, ...(details === undefined ? {} : { details }) },
});

const param = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

function limitFromQuery(value: unknown, fallback = 50): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(100, Math.max(1, Math.floor(parsed)));
}

function matchingFusions(query: string): Fusion[] {
  const needle = query.toLowerCase().trim();
  if (!needle) return [];
  return fusions.filter((fusion) =>
    [fusion.name, fusion.id, fusion.description, fusion.rarity, ...fusion.parents, ...fusion.types, ...fusion.abilities]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}

function matchingMoves(query: string): Move[] {
  const needle = query.toLowerCase().trim();
  if (!needle) return [];
  return moves.filter((move) =>
    [move.name, move.id, move.description, move.type, move.category].join(" ").toLowerCase().includes(needle),
  );
}

router.get("/v1", (_req, res) => {
  res.json(response({
    name: "Fusion Pokémon API",
    version: "v1",
    description: "A searchable catalog and battle engine for original Fusion Pokémon.",
    baseUrl: "/api/v1",
    resources: ["fusions", "moves", "abilities", "types", "rarities", "battle"],
  }));
});

router.get("/v1/stats", (_req, res) => {
  res.json(response({
    fusions: fusions.length,
    moves: moves.length,
    abilities: abilities.length,
    types: types.length,
    rarities: rarities.length,
    lastUpdated: "2026-09-21",
  }));
});

router.get("/v1/fusions/search", (req, res) => {
  const query = String(req.query.q ?? "");
  const results = matchingFusions(query).slice(0, limitFromQuery(req.query.limit));
  res.json(response(results, results.length, matchingFusions(query).length));
});

router.get("/v1/fusions/random", (_req, res) => {
  const fusion = fusions[Math.floor(Math.random() * fusions.length)];
  res.json(response(fusion));
});

router.get("/v1/fusions/name/:name", (req, res) => {
  const requested = decodeURIComponent(param(req.params.name) ?? "").toLowerCase();
  const fusion = fusions.find((entry) => entry.name.toLowerCase() === requested);
  if (!fusion) {
    res.status(404).json(errorResponse("FUSION_NOT_FOUND", `Fusion Pokémon "${requested}" was not found.`));
    return;
  }
  res.json(response(fusion));
});

router.get("/v1/fusions/:id", (req, res) => {
  const fusion = getFusion(param(req.params.id) ?? "");
  if (!fusion) {
    res.status(404).json(errorResponse("FUSION_NOT_FOUND", `Fusion Pokémon "${param(req.params.id) ?? ""}" was not found.`));
    return;
  }
  res.json(response(fusion));
});

router.get("/v1/fusions", (req, res) => {
  const type = String(req.query.type ?? "").toLowerCase();
  const rarity = String(req.query.rarity ?? "").toLowerCase();
  const parent = String(req.query.parent ?? "").toLowerCase();
  const query = String(req.query.q ?? "").toLowerCase();
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = limitFromQuery(req.query.limit);
  const filtered = fusions.filter((fusion) => {
    const matchesType = !type || fusion.types.some((entry) => entry.toLowerCase() === type);
    const matchesRarity = !rarity || fusion.rarity.toLowerCase() === rarity;
    const matchesParent = !parent || fusion.parents.some((entry) => entry.toLowerCase().includes(parent));
    const matchesQuery = !query || [fusion.name, fusion.description, ...fusion.parents, ...fusion.types].join(" ").toLowerCase().includes(query);
    return matchesType && matchesRarity && matchesParent && matchesQuery;
  });
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);
  res.json(response(data, data.length, filtered.length));
});

router.get("/v1/moves/random", (_req, res) => {
  res.json(response(moves[Math.floor(Math.random() * moves.length)]));
});

router.get("/v1/moves/name/:name", (req, res) => {
  const requested = decodeURIComponent(param(req.params.name) ?? "").toLowerCase();
  const move = moves.find((entry) => entry.name.toLowerCase() === requested);
  if (!move) {
    res.status(404).json(errorResponse("MOVE_NOT_FOUND", `Move "${requested}" was not found.`));
    return;
  }
  res.json(response(move));
});

router.get("/v1/moves/:id", (req, res) => {
  const move = getMove(param(req.params.id) ?? "");
  if (!move) {
    res.status(404).json(errorResponse("MOVE_NOT_FOUND", `Move "${param(req.params.id) ?? ""}" was not found.`));
    return;
  }
  res.json(response(move));
});

router.get("/v1/moves", (req, res) => {
  const type = String(req.query.type ?? "").toLowerCase();
  const category = String(req.query.category ?? "").toLowerCase();
  const query = String(req.query.q ?? "");
  const filtered = (query ? matchingMoves(query) : moves).filter((move) =>
    (!type || move.type.toLowerCase() === type) && (!category || move.category.toLowerCase() === category),
  );
  const data = filtered.slice(0, limitFromQuery(req.query.limit));
  res.json(response(data, data.length, filtered.length));
});

router.get("/v1/abilities/name/:name", (req, res) => {
  const requested = decodeURIComponent(param(req.params.name) ?? "").toLowerCase();
  const ability = abilities.find((entry) => entry.name.toLowerCase() === requested);
  if (!ability) {
    res.status(404).json(errorResponse("ABILITY_NOT_FOUND", `Ability "${requested}" was not found.`));
    return;
  }
  res.json(response(ability));
});

router.get("/v1/abilities/:id", (req, res) => {
  const ability = getAbility(param(req.params.id) ?? "");
  if (!ability) {
    res.status(404).json(errorResponse("ABILITY_NOT_FOUND", `Ability "${param(req.params.id) ?? ""}" was not found.`));
    return;
  }
  res.json(response(ability));
});

router.get("/v1/abilities", (req, res) => {
  const query = String(req.query.q ?? "").toLowerCase();
  const filtered = query
    ? abilities.filter((ability) => [ability.name, ability.description, ability.trigger, ability.rarity].join(" ").toLowerCase().includes(query))
    : abilities;
  const data = filtered.slice(0, limitFromQuery(req.query.limit));
  res.json(response(data, data.length));
});

router.get("/v1/types/:type/matchups", (req, res) => {
  const entry = getType(param(req.params.type) ?? "");
  if (!entry) {
    res.status(404).json(errorResponse("TYPE_NOT_FOUND", `Type "${param(req.params.type) ?? ""}" was not found.`));
    return;
  }
  res.json(response(entry));
});

router.get("/v1/types/:type", (req, res) => {
  const entry = getType(param(req.params.type) ?? "");
  if (!entry) {
    res.status(404).json(errorResponse("TYPE_NOT_FOUND", `Type "${param(req.params.type) ?? ""}" was not found.`));
    return;
  }
  res.json(response(entry));
});

router.get("/v1/types", (_req, res) => {
  res.json(response(types, types.length));
});

router.get("/v1/rarities/:rarity", (req, res) => {
  const rarity = getRarity(param(req.params.rarity) ?? "");
  if (!rarity) {
    res.status(404).json(errorResponse("RARITY_NOT_FOUND", `Rarity "${param(req.params.rarity) ?? ""}" was not found.`));
    return;
  }
  const data = fusions.filter((fusion) => fusion.rarity.toLowerCase() === rarity.name.toLowerCase());
  res.json(response(data, data.length, data.length));
});

router.get("/v1/rarities", (_req, res) => {
  res.json(response(rarities, rarities.length));
});

function battleError(res: any, message: string) {
  res.status(400).json(errorResponse("INVALID_BATTLE_REQUEST", message));
}

router.post("/v1/battle/damage", (req, res) => {
  const parsed = CalculateDamageBody.safeParse(req.body);
  if (!parsed.success) {
    battleError(res, parsed.error.issues[0]?.message ?? "Invalid damage request.");
    return;
  }
  const attacker = getFusion(parsed.data.attackerId);
  const defender = getFusion(parsed.data.defenderId);
  const move = getMove(parsed.data.moveId);
  if (!attacker || !defender || !move) {
    battleError(res, "attackerId, defenderId, and moveId must reference existing catalog entries.");
    return;
  }
  res.json(response(calculateDamage(attacker, defender, move, parsed.data.critical ?? false, parsed.data.randomFactor ?? 0.92)));
});

router.post("/v1/battle/calculate", (req, res) => {
  const parsed = CalculateBattleBody.safeParse(req.body);
  if (!parsed.success) {
    battleError(res, parsed.error.issues[0]?.message ?? "Invalid battle request.");
    return;
  }
  const attacker = getFusion(parsed.data.attackerId);
  const defender = getFusion(parsed.data.defenderId);
  if (!attacker || !defender) {
    battleError(res, "attackerId and defenderId must reference existing fusion entries.");
    return;
  }
  const move = parsed.data.moveId ? getMove(parsed.data.moveId) : getMove(attacker.moves[0]);
  if (!move) {
    battleError(res, "The selected move could not be found.");
    return;
  }
  const effectiveness = calculateDamage(attacker, defender, move).effectiveness;
  const matchup = effectiveness > 1 ? "super effective" : effectiveness === 0 ? "immune" : effectiveness < 1 ? "resisted" : "neutral";
  res.json(response({ attacker, defender, recommendedMove: move, matchup }));
});

router.post("/v1/battle/turn", (req, res) => {
  const parsed = SimulateBattleTurnBody.safeParse(req.body);
  if (!parsed.success) {
    battleError(res, parsed.error.issues[0]?.message ?? "Invalid turn request.");
    return;
  }
  const attacker = getFusion(parsed.data.attackerId);
  const defender = getFusion(parsed.data.defenderId);
  const attackerMove = getMove(parsed.data.attackerMoveId);
  const defenderMove = getMove(parsed.data.defenderMoveId);
  if (!attacker || !defender || !attackerMove || !defenderMove) {
    battleError(res, "All turn IDs must reference existing catalog entries.");
    return;
  }
  const first = calculateDamage(attacker, defender, attackerMove);
  const second = calculateDamage(defender, attacker, defenderMove);
  const outcome = first.damage > second.damage ? `${attacker.name} wins the exchange` : first.damage < second.damage ? `${defender.name} wins the exchange` : "The exchange is even";
  res.json(response({ first, second, outcome }));
});

export default router;