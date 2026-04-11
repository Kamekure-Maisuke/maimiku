export type Oshi = { name: string; score: number };

let kv: Deno.Kv;

export async function openDb(path = "./data"): Promise<void> {
  kv = await Deno.openKv(path);
}

export function closeDb(): void {
  kv.close();
}

export async function getAll(): Promise<Oshi[]> {
  const result: Oshi[] = [];
  for await (const entry of kv.list<Oshi>({ prefix: ["oshi"] })) {
    result.push(entry.value);
  }
  return result.sort((a, b) => b.score - a.score);
}

export async function find(name: string): Promise<Oshi | null> {
  const res = await kv.get<Oshi>(["oshi", name]);
  return res.value;
}

export async function save(oshi: Oshi): Promise<void> {
  await kv.set(["oshi", oshi.name], oshi);
}

export async function remove(name: string): Promise<void> {
  await kv.delete(["oshi", name]);
}
