import { assertEquals } from "@std/assert";
import * as db from "./db.ts";

Deno.test("db", async (t) => {
  const dir = await Deno.makeTempDir();
  await db.openDb(`${dir}/test.db`);

  await t.step("save & find", async () => {
    await db.save({ name: "ミク", score: 100 });
    const oshi = await db.find("ミク");
    assertEquals(oshi, { name: "ミク", score: 100 });
  });

  await t.step("addHistory", async () => {
    await db.addHistory({
      name: "ミク",
      point: 10,
      sign: 1,
      newScore: 110,
      at: "2026-04-12T00:00:00.000Z",
    });
    const list = await db.getHistory("ミク");
    assertEquals(list.length, 1);
    assertEquals(list[0], {
      name: "ミク",
      point: 10,
      sign: 1,
      newScore: 110,
      at: "2026-04-12T00:00:00.000Z",
    });
  });

  await t.step("addHistory with memo", async () => {
    await db.addHistory({
      name: "ミク",
      point: 20,
      sign: 1,
      newScore: 130,
      at: "2026-04-12T00:30:00.000Z",
      memo: "ライブ最高だった",
    });
    const list = await db.getHistory("ミク");
    const withMemo = list.find((h) => h.memo !== undefined);
    assertEquals(withMemo?.memo, "ライブ最高だった");
  });

  await t.step("getHistory", async () => {
    await db.addHistory({
      name: "ミク",
      point: 5,
      sign: -1,
      newScore: 125,
      at: "2026-04-12T01:00:00.000Z",
    });
    const list = await db.getHistory("ミク");
    assertEquals(list.length, 3);
    assertEquals(list[2].sign, -1);
    assertEquals(list[2].newScore, 125);
    assertEquals(list[2].memo, undefined);
  });

  await t.step("find returns null for unknown", async () => {
    assertEquals(await db.find("存在しない"), null);
  });

  await t.step("getAll returns score desc order", async () => {
    await db.save({ name: "マイ", score: 200 });
    const list = await db.getAll();
    assertEquals(list.map((o) => o.name), ["マイ", "ミク"]);
  });

  await t.step("remove", async () => {
    await db.remove("ミク");
    assertEquals(await db.find("ミク"), null);
  });

  await t.step("clearAll", async () => {
    await db.save({ name: "リン", score: 50 });
    await db.addHistory({
      name: "リン",
      point: 50,
      sign: 1,
      newScore: 50,
      at: "2026-04-12T02:00:00.000Z",
    });
    await db.clearAll();
    assertEquals(await db.getAll(), []);
    assertEquals(await db.getHistory("リン"), []);
  });

  db.closeDb();
  await Deno.remove(dir, { recursive: true });
});
