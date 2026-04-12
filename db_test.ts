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

  await t.step("getHistory", async () => {
    await db.addHistory({
      name: "ミク",
      point: 5,
      sign: -1,
      newScore: 105,
      at: "2026-04-12T01:00:00.000Z",
    });
    const list = await db.getHistory("ミク");
    assertEquals(list.length, 2);
    assertEquals(list[1].sign, -1);
    assertEquals(list[1].newScore, 105);
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

  db.closeDb();
  await Deno.remove(dir, { recursive: true });
});
