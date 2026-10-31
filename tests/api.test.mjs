import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import { createServer } from "node:http";
const base = process.env.TEST_API;
if (!base)
  throw new Error(
    "TEST_API must point to a disposable test API/database; see README.",
  );
async function request(method, path, body, status = 200) {
  const r = await fetch(base + "/" + path, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const j = await r.json();
  assert.equal(r.status, status, JSON.stringify(j));
  return j.data;
}
const get = (p) => request("GET", p);
const post = (p, b, status) => request("POST", p, b, status);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
test("database health", async () =>
  assert.equal((await get("health")).status, "ok"));
test("unknown ID is rejected", async () => {
  const r = await fetch(base + "/boards/" + randomUUID());
  assert.ok([404, 405].includes(r.status));
});
test("boards, custom stages, card editing and guarded movement", async () => {
  const b = await post("boards", {
    name: "API test " + randomUUID(),
    description: "Test board",
  });
  const detail = await get("boards/" + b.id);
  assert.equal(detail.stages.length, 3);
  const s = await post("boards/" + b.id + "/stages", { name: "Review" });
  assert.equal(s.position, 3);
  const input = {
    stageId: detail.stages[0].stage.id,
    title: "Test task",
    description: "Details",
    assignee: "Tester",
    label: "Test",
    priority: "HIGH",
    dueDate: "2027-02-28",
  };
  const c = await post("cards", input);
  assert.equal(c.title, input.title);
  await request("PUT", "cards/" + c.id, { ...input, title: "Updated" });
  await request("PATCH", "cards/" + c.id + "/move", { stageId: s.id });
  assert.equal(
    (await get("boards/" + b.id)).stages.at(-1).cards[0].title,
    "Updated",
  );
  const other = await post("boards", { name: "Other" });
  const od = await get("boards/" + other.id);
  await request(
    "PATCH",
    "cards/" + c.id + "/move",
    { stageId: od.stages[0].stage.id },
    409,
  );
  await post("cards", { ...input, priority: "UNKNOWN" }, 400);
  await post("boards", { name: " " }, 400);
  await request("DELETE", "cards/" + c.id);
  assert.equal((await get("boards/" + b.id)).stages.at(-1).cards.length, 0);
});
