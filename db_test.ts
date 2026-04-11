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
