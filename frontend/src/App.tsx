import { useEffect, useState } from "react";
import { Character, BattleResult, fetchCharacters, postBattle, API_URL } from "./api";

type Side = "A" | "B";

export default function App() {
  const [chars, setChars] = useState<Character[]>([]);
  const [sideA, setSideA] = useState<string[]>([]);
  const [sideB, setSideB] = useState<string[]>([]);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCharacters().then(setChars).catch((e) => setError(String(e.message ?? e)));
  }, []);

  function toggle(side: Side, id: string) {
    const [list, setList] = side === "A" ? [sideA, setSideA] : [sideB, setSideB];
    if (list.includes(id)) {
      setList(list.filter((x) => x !== id));
    } else {
      const otherList = side === "A" ? sideB : sideA;
      if (otherList.includes(id)) return;
      if (list.length >= 7) return;
      setList([...list, id]);
    }
  }

  async function fight() {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const r = await postBattle(sideA, sideB);
      setResult(r);
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSideA([]);
    setSideB([]);
    setResult(null);
    setError(null);
  }

  const canFight = sideA.length > 0 && sideB.length > 0 && !loading;

  return (
    <div className="page">
      <header>
        <h1>Boys vs Supes — Battle Sim</h1>
        <p className="muted">API: <code>{API_URL}</code></p>
      </header>

      {error && <div className="error">{error}</div>}

      <section className="roster">
        <h2>Roster</h2>
        <div className="grid">
          {chars.map((c) => {
            const inA = sideA.includes(c.id);
            const inB = sideB.includes(c.id);
            return (
              <div key={c.id} className={`card faction-${c.faction} ${inA ? "in-a" : ""} ${inB ? "in-b" : ""}`}>
                <div className="card-head">
                  <strong>{c.alias ?? c.name}</strong>
                  <span className="tag">{c.faction}</span>
                </div>
                <div className="stats">
                  <Bar label="STR" v={c.stats.strength} />
                  <Bar label="SPD" v={c.stats.speed} />
                  <Bar label="DUR" v={c.stats.durability} />
                  <Bar label="INT" v={c.stats.intelligence} />
                  <Bar label="RTH" v={c.stats.ruthlessness} />
                </div>
                <div className="powers">{c.powers.join(" · ")}</div>
                <div className="actions">
                  <button disabled={inB} onClick={() => toggle("A", c.id)}>
                    {inA ? "Remove from A" : "Side A"}
                  </button>
                  <button disabled={inA} onClick={() => toggle("B", c.id)}>
                    {inB ? "Remove from B" : "Side B"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="arena">
        <div className="team">
          <h3>Side A ({sideA.length})</h3>
          <ul>{sideA.map((id) => <li key={id}>{label(chars, id)}</li>)}</ul>
        </div>
        <div className="vs">VS</div>
        <div className="team">
          <h3>Side B ({sideB.length})</h3>
          <ul>{sideB.map((id) => <li key={id}>{label(chars, id)}</li>)}</ul>
        </div>
      </section>

      <div className="controls">
        <button className="primary" disabled={!canFight} onClick={fight}>
          {loading ? "Simulating..." : "Fight!"}
        </button>
        <button onClick={reset}>Reset</button>
      </div>

      {result && <ResultView r={result} />}

      <footer>
        <p className="muted">Unofficial fan project. Not affiliated with Vought International or Amazon Studios.</p>
      </footer>
    </div>
  );
}

function Bar({ label, v }: { label: string; v: number }) {
  return (
    <div className="bar">
      <span className="bar-label">{label}</span>
      <div className="bar-track"><div className="bar-fill" style={{ width: `${v}%` }} /></div>
      <span className="bar-val">{v}</span>
    </div>
  );
}

function label(chars: Character[], id: string) {
  const c = chars.find((x) => x.id === id);
  return c?.alias ?? c?.name ?? id;
}

function ResultView({ r }: { r: BattleResult }) {
  const winLabel =
    r.winner === "draw"
      ? "Draw"
      : r.winner === "A"
      ? "Side A wins"
      : "Side B wins";

  return (
    <section className="result">
      <h2>{winLabel}</h2>
      <p>{r.summary}</p>
      {r.mvp && <p><strong>MVP:</strong> {r.mvp}</p>}
      <div className="scores">
        <div>
          <h4>Side A</h4>
          <div>Power: {r.score_a.total_power}</div>
          <div>Survivors: {r.score_a.survivors.join(", ") || "none"}</div>
        </div>
        <div>
          <h4>Side B</h4>
          <div>Power: {r.score_b.total_power}</div>
          <div>Survivors: {r.score_b.survivors.join(", ") || "none"}</div>
        </div>
      </div>
      <details>
        <summary>Battle log ({r.log.length} actions)</summary>
        <ol className="log">
          {r.log.map((l, i) => (
            <li key={i}>
              R{l.round}: <strong>{l.actor}</strong> uses <em>{l.action}</em> on{" "}
              <strong>{l.target}</strong> for {l.damage} dmg{l.crit ? " (CRIT!)" : ""}
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
