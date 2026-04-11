import { bold, cyan, dim, green, red, yellow } from "@std/fmt/colors";
import { Table } from "@cliffy/table";
import type { Oshi } from "./db.ts";

const COLORS = [cyan, green, yellow, red];

function bar(value: number, max: number, color: (s: string) => string): string {
  const filled = max > 0 ? Math.round((value / max) * 20) : 0;
  return color("█".repeat(filled)) + dim("░".repeat(20 - filled));
}

export const fail = (msg: string): never => {
  console.error(red(msg));
  Deno.exit(1);
};

export const ok = (msg: string) => console.log(`  ${green("✓")} ${msg}`);

export function showList(list: Oshi[]): void {
  if (list.length === 0) {
    console.log(
      `\n  ${dim("推しがまだいません。init で追加してください。")}\n`,
    );
    return;
  }
  const max = Math.max(...list.map((o) => o.score), 1);
  console.log(`\n  ${bold(cyan("推し一覧"))}\n`);
  new Table()
    .body(list.map((oshi, i) => [
      dim(oshi.name),
      bar(oshi.score, max, COLORS[i % COLORS.length]),
      yellow(String(oshi.score)),
    ]))
    .indent(2)
    .padding(1)
    .render();
  console.log();
}

export function showScoreChange(
  name: string,
  point: number,
  sign: 1 | -1,
  newScore: number,
): void {
  const diff = sign > 0 ? green(`+${point}`) : red(`-${point}`);
  ok(`「${name}」 ${diff} → ${yellow(String(newScore))}`);
}

export function showHelp(): void {
  console.log(`
  ${bold(cyan("maimiku"))} - 推し管理ツール

  ${dim("コマンド:")}
    list                       推し一覧を表示
    init <名前>                推しを追加
    add <名前> <ポイント>      ポイントを加算
    subtract <名前> <ポイント> ポイントを減算
    remove <名前>              推しを削除
`);
}
