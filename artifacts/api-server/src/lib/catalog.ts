import fusionSeeds from "../data/fusions.json";

export type Stats = {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  total: number;
};

export type Move = {
  id: string;
  name: string;
  type: string;
  category: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
  description: string;
  statusEffects: string[];
  statChanges: string[];
  effectChance: number;
  recoil: number;
  healing: number;
  target: string;
  criticalHit: boolean;
};

export type Ability = {
  id: string;
  name: string;
  description: string;
  trigger: string;
  rarity: string;
};

export type TypeMatchups = {
  weakTo: string[];
  resists: string[];
  immuneTo: string[];
  superEffectiveAgainst: string[];
  notVeryEffectiveAgainst: string[];
};

export type ElementType = {
  type: string;
  color: string;
  description: string;
  matchups: TypeMatchups;
};

export type Fusion = {
  id: string;
  name: string;
  parents: string[];
  types: string[];
  rarity: string;
  description: string;
  stats: Stats;
  abilities: string[];
  hiddenAbility: string | null;
  weaknesses: string[];
  resistances: string[];
  immunities: string[];
  moves: string[];
  sprite: { primary: string; accent: string; silhouette: string };
  image: string;
  battle: { role: string; tier: string; weight: number; catchRate: number };
};

type FusionSeed = {
  id: string;
  name: string;
  parents: string[];
  types: string[];
  rarity: string;
  lore: string;
  base: number;
  ability: string;
  hidden: string;
  role: string;
  tier: string;
  weight: number;
  catchRate: number;
  primary: string;
  accent: string;
};

const seedList = fusionSeeds as FusionSeed[];

const typeRules: Record<string, { weakTo: string[]; resists: string[]; immuneTo: string[] }> = {
  Normal: { weakTo: ["Fighting"], resists: [], immuneTo: ["Ghost"] },
  Fire: { weakTo: ["Water", "Ground", "Rock"], resists: ["Fire", "Grass", "Ice", "Bug", "Steel", "Fairy"], immuneTo: [] },
  Water: { weakTo: ["Electric", "Grass"], resists: ["Fire", "Water", "Ice", "Steel"], immuneTo: [] },
  Electric: { weakTo: ["Ground"], resists: ["Electric", "Flying", "Steel"], immuneTo: [] },
  Grass: { weakTo: ["Fire", "Ice", "Poison", "Flying", "Bug"], resists: ["Water", "Electric", "Grass", "Ground"], immuneTo: [] },
  Ice: { weakTo: ["Fire", "Fighting", "Rock", "Steel"], resists: ["Ice"], immuneTo: [] },
  Fighting: { weakTo: ["Flying", "Psychic", "Fairy"], resists: ["Bug", "Rock", "Dark"], immuneTo: [] },
  Poison: { weakTo: ["Ground", "Psychic"], resists: ["Grass", "Fighting", "Poison", "Bug", "Fairy"], immuneTo: [] },
  Ground: { weakTo: ["Water", "Grass", "Ice"], resists: ["Poison", "Rock"], immuneTo: ["Electric"] },
  Flying: { weakTo: ["Electric", "Ice", "Rock"], resists: ["Grass", "Fighting", "Bug"], immuneTo: ["Ground"] },
  Psychic: { weakTo: ["Bug", "Ghost", "Dark"], resists: ["Fighting", "Psychic"], immuneTo: [] },
  Bug: { weakTo: ["Fire", "Flying", "Rock"], resists: ["Grass", "Fighting", "Ground"], immuneTo: [] },
  Rock: { weakTo: ["Water", "Grass", "Fighting", "Ground", "Steel"], resists: ["Normal", "Fire", "Poison", "Flying"], immuneTo: [] },
  Ghost: { weakTo: ["Ghost", "Dark"], resists: ["Poison", "Bug"], immuneTo: ["Normal", "Fighting"] },
  Dragon: { weakTo: ["Ice", "Dragon", "Fairy"], resists: ["Fire", "Water", "Electric", "Grass"], immuneTo: [] },
  Dark: { weakTo: ["Fighting", "Bug", "Fairy"], resists: ["Ghost", "Dark"], immuneTo: ["Psychic"] },
  Steel: { weakTo: ["Fire", "Fighting", "Ground"], resists: ["Normal", "Grass", "Ice", "Flying", "Psychic", "Bug", "Rock", "Dragon", "Steel", "Fairy"], immuneTo: ["Poison"] },
  Fairy: { weakTo: ["Poison", "Steel"], resists: ["Fighting", "Bug", "Dark"], immuneTo: ["Dragon"] },
};

const typeColors: Record<string, string> = {
  Normal: "#b8b8a8", Fire: "#ed6a45", Water: "#5c9fdb", Electric: "#e9c34d",
  Grass: "#6fb96b", Ice: "#87cfdc", Fighting: "#c56b62", Poison: "#a56bab",
  Ground: "#c39b68", Flying: "#829ad2", Psychic: "#dc718c", Bug: "#96ad52",
  Rock: "#a9946a", Ghost: "#796ba8", Dragon: "#7166c1", Dark: "#71645f",
  Steel: "#8d9cab", Fairy: "#d694c0",
};

const typeDescriptions: Record<string, string> = {
  Normal: "Reliable force with no elemental edge.",
  Fire: "Heat, pressure, and aggressive momentum.",
  Water: "Adaptable flow that rewards patient timing.",
  Electric: "Fast bursts that punish exposed openings.",
  Grass: "Living energy, terrain, and sustained recovery.",
  Ice: "Precision cold that slows the battle down.",
  Fighting: "Direct technique and relentless close-range pressure.",
  Poison: "Attrition and status effects that compound over time.",
  Ground: "Heavy impact and control of the arena itself.",
  Flying: "Mobility, angles, and aerial initiative.",
  Psychic: "Focused intent that bends the rules of a turn.",
  Bug: "Swarm tactics, feints, and relentless small openings.",
  Rock: "Defensive mass and punishing contact.",
  Ghost: "Uncertainty, phasing, and attacks from the unseen.",
  Dragon: "Rare force with a high ceiling in every matchup.",
  Dark: "Disruption, pressure, and opportunistic strikes.",
  Steel: "Engineered defense with measured counterattacks.",
  Fairy: "Protective power that breaks brute-force strategies.",
};

function statsFromBase(base: number): Stats {
  const hp = base + 12;
  const attack = base - 8;
  const defense = base - 4;
  const specialAttack = base - 6;
  const specialDefense = base - 2;
  const speed = base - 10;
  return { hp, attack, defense, specialAttack, specialDefense, speed, total: hp + attack + defense + specialAttack + specialDefense + speed };
}

function matchupFor(type: string): TypeMatchups {
  const rules = typeRules[type] ?? { weakTo: [], resists: [], immuneTo: [] };
  const superEffectiveAgainst = Object.entries(typeRules)
    .filter(([, value]) => value.weakTo.includes(type))
    .map(([name]) => name);
  const notVeryEffectiveAgainst = Object.entries(typeRules)
    .filter(([, value]) => value.resists.includes(type))
    .map(([name]) => name);
  return { ...rules, superEffectiveAgainst, notVeryEffectiveAgainst };
}

export const allTypeNames = Object.keys(typeRules);

export const types: ElementType[] = allTypeNames.map((type) => ({
  type,
  color: typeColors[type] ?? "#8c8c8c",
  description: typeDescriptions[type] ?? "An elemental force used by Fusion Pokémon.",
  matchups: matchupFor(type),
}));

const standardMoveSpecs: Array<[string, string, string, string, number | null, number | null, string[]]> = [
  ["normal-tackle", "Tackle", "Normal", "Physical", 40, 100, []],
  ["normal-quick-attack", "Quick Attack", "Normal", "Physical", 40, 100, []],
  ["normal-protect", "Protect", "Normal", "Status", null, null, ["protect"]],
  ["normal-double-team", "Double Team", "Normal", "Status", null, null, ["evasion +1"]],
  ["fire-flamethrower", "Flamethrower", "Fire", "Special", 90, 100, ["burn"]],
  ["fire-fire-fang", "Fire Fang", "Fire", "Physical", 65, 95, ["burn", "flinch"]],
  ["water-water-gun", "Water Gun", "Water", "Special", 40, 100, []],
  ["water-aqua-jet", "Aqua Jet", "Water", "Physical", 40, 100, ["priority +1"]],
  ["electric-thunderbolt", "Thunderbolt", "Electric", "Special", 90, 100, ["paralysis"]],
  ["electric-spark", "Spark", "Electric", "Physical", 65, 100, ["paralysis"]],
  ["grass-razor-leaf", "Razor Leaf", "Grass", "Physical", 55, 95, ["high critical-hit ratio"]],
  ["grass-energy-ball", "Energy Ball", "Grass", "Special", 90, 100, ["special defense -1"]],
  ["ice-ice-beam", "Ice Beam", "Ice", "Special", 90, 100, ["freeze"]],
  ["ice-ice-shard", "Ice Shard", "Ice", "Physical", 40, 100, ["priority +1"]],
  ["fighting-brick-break", "Brick Break", "Fighting", "Physical", 75, 100, ["breaks screens"]],
  ["flying-aerial-ace", "Aerial Ace", "Flying", "Physical", 60, null, ["never misses"]],
  ["poison-sludge-bomb", "Sludge Bomb", "Poison", "Special", 90, 100, ["poison"]],
  ["ground-earthquake", "Earthquake", "Ground", "Physical", 100, 100, []],
  ["psychic-psychic", "Psychic", "Psychic", "Special", 90, 100, ["special defense -1"]],
  ["ghost-shadow-ball", "Shadow Ball", "Ghost", "Special", 80, 100, ["special defense -1"]],
  ["rock-rock-slide", "Rock Slide", "Rock", "Physical", 75, 90, ["flinch"]],
  ["dragon-dragon-claw", "Dragon Claw", "Dragon", "Physical", 80, 100, []],
  ["steel-iron-head", "Iron Head", "Steel", "Physical", 80, 100, ["flinch"]],
  ["fairy-play-rough", "Play Rough", "Fairy", "Physical", 90, 90, ["attack -1"]],
  ["dark-dark-pulse", "Dark Pulse", "Dark", "Special", 80, 100, ["flinch"]],
  ["bug-bug-buzz", "Bug Buzz", "Bug", "Special", 90, 100, ["special defense -1"]],
];

const standardMoves: Move[] = standardMoveSpecs.map(([id, name, type, category, power, accuracy, effects]) => ({
  id,
  name,
  type,
  category,
  power,
  accuracy,
  pp: category === "Status" ? 10 : 15,
  priority: effects.includes("priority +1") ? 1 : 0,
  description: `A classic ${type.toLowerCase()} move available to compatible Fusion Pokémon.`,
  statusEffects: effects.filter((effect) => ["burn", "freeze", "paralysis", "poison", "flinch", "protect"].includes(effect)),
  statChanges: effects.filter((effect) => effect.includes("+") || effect.includes("-")),
  effectChance: effects.length > 0 ? 10 : 0,
  recoil: 0,
  healing: 0,
  target: "single opponent",
  criticalHit: effects.includes("high critical-hit ratio"),
}));

const standardMovePools: Record<string, string[]> = {
  Normal: ["normal-quick-attack", "normal-double-team"],
  Fire: ["fire-flamethrower", "fire-fire-fang"],
  Water: ["water-water-gun", "water-aqua-jet"],
  Electric: ["electric-thunderbolt", "electric-spark"],
  Grass: ["grass-razor-leaf", "grass-energy-ball"],
  Ice: ["ice-ice-beam", "ice-ice-shard"],
  Fighting: ["fighting-brick-break", "normal-quick-attack"],
  Poison: ["poison-sludge-bomb", "normal-double-team"],
  Ground: ["ground-earthquake", "normal-tackle"],
  Flying: ["flying-aerial-ace", "normal-quick-attack"],
  Psychic: ["psychic-psychic", "normal-double-team"],
  Bug: ["bug-bug-buzz", "normal-quick-attack"],
  Rock: ["rock-rock-slide", "normal-tackle"],
  Ghost: ["ghost-shadow-ball", "normal-double-team"],
  Dragon: ["dragon-dragon-claw", "normal-quick-attack"],
  Dark: ["dark-dark-pulse", "normal-quick-attack"],
  Steel: ["steel-iron-head", "normal-tackle"],
  Fairy: ["fairy-play-rough", "normal-double-team"],
};

function standardMovesForSeed(seed: FusionSeed): string[] {
  return [...new Set(seed.types.flatMap((type) => standardMovePools[type] ?? []).concat(["normal-tackle", "normal-protect"]))].slice(0, 2);
}

export const fusions: Fusion[] = seedList.map((seed) => {
  const weaknesses = [...new Set(seed.types.flatMap((type) => typeRules[type]?.weakTo ?? []))];
  const resistances = [...new Set(seed.types.flatMap((type) => typeRules[type]?.resists ?? []))].filter((type) => !weaknesses.includes(type));
  const immunities = [...new Set(seed.types.flatMap((type) => typeRules[type]?.immuneTo ?? []))];
  return {
    id: seed.id,
    name: seed.name,
    parents: seed.parents,
    types: seed.types,
    rarity: seed.rarity,
    description: seed.lore,
    stats: statsFromBase(seed.base),
    abilities: [seed.ability],
    hiddenAbility: seed.hidden,
    weaknesses,
    resistances,
    immunities,
    moves: [...standardMovesForSeed(seed), `move-${seed.id}-signature`, `move-${seed.id}-echo`],
    sprite: { primary: seed.primary, accent: seed.accent, silhouette: `${seed.primary} ${seed.accent}` },
    image: `/fusions/${seed.id}.png`,
    battle: { role: seed.role, tier: seed.tier, weight: seed.weight, catchRate: seed.catchRate },
  };
});

const moveVerbs = ["Surge", "Crescendo", "Rift", "Lance", "Bloom", "Drive", "Pulse", "Crash", "Veil", "Gambit"];
const moveNouns = ["Protocol", "Prism", "Howl", "Circuit", "Crown", "Current", "Echo", "Fang", "Orbit", "Quake"];

const signatureMoves: Move[] = seedList.flatMap((seed, index) => {
  const primaryType = seed.types[0];
  const secondaryType = seed.types[1];
  const verb = moveVerbs[index % moveVerbs.length];
  const noun = moveNouns[(index * 3) % moveNouns.length];
  return [
    {
      id: `move-${seed.id}-signature`,
      name: `${seed.name} ${verb}`,
      type: primaryType,
      category: "Special",
      power: 70 + (index % 5) * 10,
      accuracy: 90 + (index % 2) * 5,
      pp: 8 + (index % 5) * 2,
      priority: index % 11 === 0 ? 1 : 0,
      description: `A signature ${primaryType.toLowerCase()} technique that channels ${seed.name}'s fusion core.`,
      statusEffects: index % 4 === 0 ? ["burn"] : [],
      statChanges: index % 6 === 0 ? ["attack +1"] : [],
      effectChance: index % 4 === 0 ? 20 : 0,
      recoil: index % 7 === 0 ? 10 : 0,
      healing: 0,
      target: "single opponent",
      criticalHit: index % 9 === 0,
    },
    {
      id: `move-${seed.id}-echo`,
      name: `${noun} of ${seed.name}`,
      type: secondaryType,
       category: "Special",
       power: 55 + (index % 4) * 10,
       accuracy: 100,
      pp: 12,
      priority: 0,
      description: `A custom ${secondaryType.toLowerCase()} maneuver that leaves a tactical afterimage.`,
      statusEffects: index % 3 === 1 ? ["slow"] : [],
      statChanges: index % 5 === 0 ? ["speed -1"] : [],
       effectChance: 25,
      recoil: 0,
      healing: index % 8 === 0 ? 20 : 0,
       target: "single opponent",
      criticalHit: false,
    },
  ];
});

export const moves: Move[] = [...standardMoves, ...signatureMoves];

export const abilities: Ability[] = seedList.flatMap((seed, index) => [
  {
    id: `ability-${seed.id}`,
    name: seed.ability,
    description: `${seed.name} gains a tactical advantage when its primary type shapes the field.`,
    trigger: index % 2 === 0 ? "On entry" : "When below half HP",
    rarity: seed.rarity,
  },
  {
    id: `ability-${seed.id}-hidden`,
    name: seed.hidden,
    description: `A rare hidden trait that lets ${seed.name} convert pressure into momentum.`,
    trigger: "Hidden ability",
    rarity: "Hidden",
  },
]);

export const rarities = ["Common", "Rare", "Epic", "Legendary", "Mythic"].map((name) => ({
  name,
  description: {
    Common: "Reliable fusions found across familiar habitats.",
    Rare: "Uncommon pairings with a distinct battle identity.",
    Epic: "High-impact fusions with specialized strengths.",
    Legendary: "Exceptional fusions that reshape a battle plan.",
    Mythic: "Near-singular fusions with reality-bending potential.",
  }[name],
  color: { Common: "#8f9aa4", Rare: "#4b9dc6", Epic: "#9a6cd0", Legendary: "#db9d43", Mythic: "#e06184" }[name],
  count: fusions.filter((fusion) => fusion.rarity === name).length,
}));

export const getFusion = (id: string) => fusions.find((fusion) => fusion.id.toLowerCase() === id.toLowerCase());
export const getMove = (id: string) => moves.find((move) => move.id.toLowerCase() === id.toLowerCase());
export const getAbility = (id: string) => abilities.find((ability) => ability.id.toLowerCase() === id.toLowerCase());
export const getType = (type: string) => types.find((entry) => entry.type.toLowerCase() === type.toLowerCase());
export const getRarity = (rarity: string) => rarities.find((entry) => entry.name.toLowerCase() === rarity.toLowerCase());

export function typeEffectiveness(moveType: string, defender: Fusion): number {
  let multiplier = 1;
  const matchup = typeRules[moveType];
  for (const defenderType of defender.types) {
    if (matchup?.weakTo.includes(defenderType)) multiplier *= 2;
    if (matchup?.resists.includes(defenderType)) multiplier *= 0.5;
    if (matchup?.immuneTo.includes(defenderType)) multiplier *= 0;
  }
  return multiplier;
}

export function calculateDamage(attacker: Fusion, defender: Fusion, move: Move, critical = false, randomFactor = 0.92) {
  const power = move.power ?? 0;
  const attack = move.category === "Physical" ? attacker.stats.attack : attacker.stats.specialAttack;
  const defense = move.category === "Physical" ? defender.stats.defense : defender.stats.specialDefense;
  const stab = attacker.types.includes(move.type) ? 1.5 : 1;
  const effectiveness = typeEffectiveness(move.type, defender);
  const criticalMultiplier = critical ? 1.5 : 1;
  const damage = power === 0 ? 0 : Math.max(1, Math.floor((((2 * 50 / 5 + 2) * power * attack / Math.max(defense, 1)) / 50 + 2) * stab * effectiveness * criticalMultiplier * randomFactor));
  const description = effectiveness === 0
    ? `${move.name} passes harmlessly through ${defender.name}.`
    : `${move.name} deals ${damage} damage to ${defender.name}${effectiveness > 1 ? " — super effective." : effectiveness < 1 ? " — resisted." : "."}`;
  return { damage, effectiveness, critical, description, move, attacker, defender };
}