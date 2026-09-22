import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = process.env.FUSION_API_BASE_URL ?? "http://localhost/api/v1";

async function get(path) {
  const response = await fetch(`${baseUrl}${path}`);
  assert.equal(response.ok, true, `GET ${path} returned ${response.status}`);
  return response.json();
}

test("stats expose the initial catalog", async () => {
  const result = await get("/stats");
  assert.equal(result.success, true);
  assert.equal(result.data.fusions, 50);
  assert.ok(result.data.moves >= 100);
});

test("fusions support filtering and detail lookup", async () => {
  const list = await get("/fusions?rarity=Mythic");
  assert.equal(list.success, true);
  assert.ok(list.count > 0);
  const detail = await get(`/fusions/${list.data[0].id}`);
  assert.equal(detail.data.id, list.data[0].id);
  assert.ok(detail.data.stats.total > 0);
});

test("every fusion has two standard moves and two signature moves", async () => {
  const list = await get("/fusions?limit=100");
  assert.equal(list.success, true);
  assert.equal(list.data.length, 50);
  for (const fusion of list.data) {
    assert.equal(fusion.moves.length, 4, `${fusion.id} should have four moves`);
    assert.equal(fusion.moves.filter((id) => id.startsWith(`move-${fusion.id}-`)).length, 2, `${fusion.id} should have two signature moves`);
    assert.equal(fusion.moves.filter((id) => !id.startsWith("move-")).length, 2, `${fusion.id} should have two standard moves`);
    assert.ok(fusion.image.endsWith(`${fusion.id}.png`), `${fusion.id} should expose its transparent artwork path`);
  }

  const signatureIds = list.data.flatMap((fusion) => fusion.moves.filter((id) => id.startsWith(`move-${fusion.id}-`)));
  const signatureMoves = await Promise.all(signatureIds.map((id) => get(`/moves/${id}`)));
  for (const result of signatureMoves) {
    assert.equal(result.data.category, "Special", `${result.data.id} should be a special fusion move`);
  }
});

test("types expose matchup relationships", async () => {
  const result = await get("/types/psychic/matchups");
  assert.equal(result.data.type, "Psychic");
  assert.ok(Array.isArray(result.data.matchups.weakTo));
});