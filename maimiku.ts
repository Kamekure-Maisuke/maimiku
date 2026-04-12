import * as db from "./db.ts";
import {
  fail,
  ok,
  showHelp,
  showHistory,
  showList,
  showScoreChange,
} from "./ui.ts";

await db.openDb();

async function applyScore(
  name: string,
  pointStr: string,
  sign: 1 | -1,
  cmd: string,
) {
  const point = Number(pointStr);
  if (!name || isNaN(point) || point <= 0) {
    fail(`使い方: maimiku ${cmd} <名前> <ポイント>`);
  }
  const oshi = await db.find(name) ?? fail(`「${name}」が見つかりません`);
  oshi.score += point * sign;
  await db.save(oshi);
  await db.addHistory({
    name,
    point,
    sign,
    newScore: oshi.score,
    at: new Date().toISOString(),
  });
  showScoreChange(name, point, sign, oshi.score);
}

const [cmd, ...args] = Deno.args;

switch (cmd) {
  case "list":
    showList(await db.getAll());
    break;

  case "init": {
    const name = args[0] ?? fail("名前を指定してください");
    if (await db.find(name)) fail(`「${name}」はすでに存在します`);
    await db.save({ name, score: 0 });
    ok(`「${name}」を追加しました`);
    break;
  }

  case "add":
    await applyScore(args[0], args[1], +1, "add");
    break;
  case "subtract":
    await applyScore(args[0], args[1], -1, "subtract");
    break;

  case "history": {
    const name = args[0] ?? fail("名前を指定してください");
    if (!await db.find(name)) fail(`「${name}」が見つかりません`);
    showHistory(name, await db.getHistory(name));
    break;
  }

  case "remove": {
    const name = args[0] ?? fail("名前を指定してください");
    if (!await db.find(name)) fail(`「${name}」が見つかりません`);
    await db.remove(name);
    ok(`「${name}」を削除しました`);
    break;
  }

  default:
    showHelp();
}

db.closeDb();
