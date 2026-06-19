import fs from "fs";
import path from "path";
import { HUTS } from "./huts";

const FILE = path.join(process.cwd(), "data", "prices.json");

type PriceMap = Record<string, number>; // hutId → nightlyRateInr

function readFile(): PriceMap {
  try {
    const raw = fs.readFileSync(FILE, "utf8");
    return JSON.parse(raw) as PriceMap;
  } catch {
    return {};
  }
}

function writeFile(map: PriceMap) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(map, null, 2));
}

export function getPrice(hutId: string): number {
  const overrides = readFile();
  if (overrides[hutId] !== undefined) return overrides[hutId];
  return HUTS.find((h) => h.id === hutId)?.nightlyRateInr ?? 0;
}

export function getAllPrices(): PriceMap {
  const overrides = readFile();
  const out: PriceMap = {};
  for (const h of HUTS) {
    out[h.id] = overrides[h.id] ?? h.nightlyRateInr;
  }
  return out;
}

export function setPrice(hutId: string, price: number) {
  const map = readFile();
  map[hutId] = price;
  writeFile(map);
}
