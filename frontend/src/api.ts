export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export type Stats = {
  strength: number;
  speed: number;
  durability: number;
  intelligence: number;
  ruthlessness: number;
};

export type Character = {
  id: string;
  name: string;
  alias: string | null;
  faction: "seven" | "boys" | "vought" | "neutral";
  is_supe: boolean;
  powers: string[];
  stats: Stats;
  quote: string | null;
};

export type RoundLog = {
  round: number;
  actor: string;
  target: string;
  action: string;
  damage: number;
  crit: boolean;
};

export type TeamScore = {
  side: "A" | "B";
  members: string[];
  total_power: number;
  survivors: string[];
};

export type BattleResult = {
  winner: "A" | "B" | "draw";
  summary: string;
  score_a: TeamScore;
  score_b: TeamScore;
  log: RoundLog[];
  mvp: string | null;
};

export async function fetchCharacters(): Promise<Character[]> {
  const r = await fetch(`${API_URL}/characters`);
  if (!r.ok) throw new Error(`GET /characters failed: ${r.status}`);
  return r.json();
}

export async function postBattle(side_a: string[], side_b: string[], seed?: number): Promise<BattleResult> {
  const r = await fetch(`${API_URL}/battle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ side_a, side_b, seed }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.detail ?? `Battle failed: ${r.status}`);
  }
  return r.json();
}
