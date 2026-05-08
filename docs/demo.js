// Client-side port of the FastAPI battle sim. Same logic, no backend.

const CHARACTERS = [
  { id: "homelander", alias: "Homelander", faction: "seven", is_supe: true,
    powers: ["flight", "laser eyes", "super strength"],
    stats: { strength: 99, speed: 92, durability: 98, intelligence: 70, ruthlessness: 95 } },
  { id: "starlight", alias: "Starlight", faction: "seven", is_supe: true,
    powers: ["light blasts", "electricity absorption"],
    stats: { strength: 70, speed: 75, durability: 72, intelligence: 78, ruthlessness: 40 } },
  { id: "a-train", alias: "A-Train", faction: "seven", is_supe: true,
    powers: ["super speed"],
    stats: { strength: 60, speed: 99, durability: 55, intelligence: 55, ruthlessness: 60 } },
  { id: "queen-maeve", alias: "Queen Maeve", faction: "seven", is_supe: true,
    powers: ["super strength", "swordsmanship"],
    stats: { strength: 88, speed: 78, durability: 88, intelligence: 80, ruthlessness: 72 } },
  { id: "black-noir", alias: "Black Noir", faction: "seven", is_supe: true,
    powers: ["stealth", "martial arts"],
    stats: { strength: 82, speed: 88, durability: 80, intelligence: 85, ruthlessness: 90 } },
  { id: "the-deep", alias: "The Deep", faction: "seven", is_supe: true,
    powers: ["aquatic communication"],
    stats: { strength: 55, speed: 50, durability: 50, intelligence: 35, ruthlessness: 30 } },
  { id: "stormfront", alias: "Stormfront", faction: "seven", is_supe: true,
    powers: ["lightning", "flight"],
    stats: { strength: 85, speed: 80, durability: 80, intelligence: 82, ruthlessness: 98 } },
  { id: "butcher", alias: "Butcher", faction: "boys", is_supe: false,
    powers: ["tactics", "brutal combat"],
    stats: { strength: 70, speed: 68, durability: 70, intelligence: 85, ruthlessness: 98 } },
  { id: "hughie", alias: "Hughie", faction: "boys", is_supe: false,
    powers: ["resourcefulness"],
    stats: { strength: 40, speed: 55, durability: 45, intelligence: 78, ruthlessness: 45 } },
  { id: "mm", alias: "Mother's Milk", faction: "boys", is_supe: false,
    powers: ["strategy", "field medicine"],
    stats: { strength: 72, speed: 65, durability: 70, intelligence: 82, ruthlessness: 70 } },
  { id: "frenchie", alias: "Frenchie", faction: "boys", is_supe: false,
    powers: ["explosives", "weapons engineering"],
    stats: { strength: 58, speed: 70, durability: 55, intelligence: 88, ruthlessness: 72 } },
  { id: "kimiko", alias: "Kimiko", faction: "boys", is_supe: true,
    powers: ["super strength", "regeneration"],
    stats: { strength: 88, speed: 82, durability: 92, intelligence: 70, ruthlessness: 85 } },
  { id: "soldier-boy", alias: "Soldier Boy", faction: "vought", is_supe: true,
    powers: ["super strength", "energy blast"],
    stats: { strength: 95, speed: 78, durability: 94, intelligence: 65, ruthlessness: 92 } },
  { id: "ryan", alias: "Ryan", faction: "neutral", is_supe: true,
    powers: ["super strength", "flight", "laser eyes"],
    stats: { strength: 80, speed: 75, durability: 85, intelligence: 65, ruthlessness: 50 } },
];

const BY_ID = Object.fromEntries(CHARACTERS.map(c => [c.id, c]));

function rand(seedRef) {
  // simple LCG
  seedRef.s = (seedRef.s * 1664525 + 1013904223) >>> 0;
  return seedRef.s / 0x100000000;
}
function randInt(rng, min, max) { return Math.floor(rng() * (max - min + 1)) + min; }
function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

function attackDamage(attacker, defender, rng) {
  const raw = attacker.stats.strength + Math.floor(attacker.stats.speed / 2) + Math.floor(attacker.stats.ruthlessness / 3);
  const def = defender.stats.durability + Math.floor(defender.stats.speed / 4);
  const swing = randInt(rng, -15, 25);
  const crit = rng() < (attacker.stats.ruthlessness / 400);
  let dmg = Math.max(1, raw - def + swing);
  if (crit) dmg *= 2;
  return [dmg, crit];
}

function simulate(sideA, sideB, seed) {
  const seedRef = { s: (seed ?? Math.floor(Math.random() * 1e9)) >>> 0 };
  const rng = () => rand(seedRef);
  const hpA = Object.fromEntries(sideA.map(c => [c.id, 80 + c.stats.durability]));
  const hpB = Object.fromEntries(sideB.map(c => [c.id, 80 + c.stats.durability]));
  const log = [];
  const dmgDealt = {};
  let round = 0;

  const aliveOf = (side, hp) => side.filter(c => hp[c.id] > 0);

  while (aliveOf(sideA, hpA).length && aliveOf(sideB, hpB).length) {
    round++;
    if (round > 60) break;

    for (const attacker of aliveOf(sideA, hpA).sort((a, b) => b.stats.speed - a.stats.speed)) {
      const targets = aliveOf(sideB, hpB);
      if (!targets.length) break;
      const target = pick(rng, targets);
      const [dmg, crit] = attackDamage(attacker, target, rng);
      hpB[target.id] = Math.max(0, hpB[target.id] - dmg);
      dmgDealt[attacker.id] = (dmgDealt[attacker.id] || 0) + dmg;
      log.push({ round, actor: attacker.alias, target: target.alias, action: pick(rng, attacker.powers), damage: dmg, crit });
    }

    for (const attacker of aliveOf(sideB, hpB).sort((a, b) => b.stats.speed - a.stats.speed)) {
      const targets = aliveOf(sideA, hpA);
      if (!targets.length) break;
      const target = pick(rng, targets);
      const [dmg, crit] = attackDamage(attacker, target, rng);
      hpA[target.id] = Math.max(0, hpA[target.id] - dmg);
      dmgDealt[attacker.id] = (dmgDealt[attacker.id] || 0) + dmg;
      log.push({ round, actor: attacker.alias, target: target.alias, action: pick(rng, attacker.powers), damage: dmg, crit });
    }
  }

  const survA = sideA.filter(c => hpA[c.id] > 0).map(c => c.alias);
  const survB = sideB.filter(c => hpB[c.id] > 0).map(c => c.alias);
  let winner;
  if (survA.length && !survB.length) winner = "A";
  else if (survB.length && !survA.length) winner = "B";
  else if (survA.length > survB.length) winner = "A";
  else if (survB.length > survA.length) winner = "B";
  else winner = "draw";

  const mvpId = Object.entries(dmgDealt).sort((a, b) => b[1] - a[1])[0]?.[0];
  const mvp = mvpId ? BY_ID[mvpId].alias : null;

  return { winner, round, survA, survB, log, mvp };
}

// ----------------------- UI -----------------------

const sideA = new Set();
const sideB = new Set();

function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const k of kids) e.append(k);
  return e;
}

function renderRoster() {
  const root = document.getElementById("demo-roster");
  root.innerHTML = "";
  for (const c of CHARACTERS) {
    const inA = sideA.has(c.id);
    const inB = sideB.has(c.id);
    const card = el("div", { class: `demo-card ${inA ? "in-a" : ""} ${inB ? "in-b" : ""}` });
    card.append(el("div", { class: "demo-card-head" },
      el("strong", {}, c.alias),
      el("span", { class: "demo-tag" }, c.faction)
    ));
    card.append(el("div", { class: "demo-powers" }, c.powers.join(" · ")));
    const btnA = el("button", {
      class: "btn",
      onclick: () => toggle("A", c.id),
      ...(inB ? { disabled: "" } : {}),
    }, inA ? "− A" : "+ A");
    const btnB = el("button", {
      class: "btn",
      onclick: () => toggle("B", c.id),
      ...(inA ? { disabled: "" } : {}),
    }, inB ? "− B" : "+ B");
    card.append(el("div", { class: "demo-actions" }, btnA, btnB));
    root.append(card);
  }
  document.getElementById("count-a").textContent = sideA.size;
  document.getElementById("count-b").textContent = sideB.size;
  document.getElementById("fight-btn").disabled = !(sideA.size && sideB.size);
}

function toggle(side, id) {
  const set = side === "A" ? sideA : sideB;
  const other = side === "A" ? sideB : sideA;
  if (set.has(id)) { set.delete(id); }
  else {
    if (other.has(id)) return;
    if (set.size >= 7) return;
    set.add(id);
  }
  renderRoster();
}

function fight() {
  const a = [...sideA].map(id => BY_ID[id]);
  const b = [...sideB].map(id => BY_ID[id]);
  const r = simulate(a, b);
  const out = document.getElementById("demo-result");
  const winLabel = r.winner === "draw" ? "Draw" : r.winner === "A" ? "Side A wins" : "Side B wins";
  out.innerHTML = "";
  out.append(el("h3", { class: "demo-winner" }, winLabel));
  out.append(el("p", {}, `${r.round} rounds. MVP: ${r.mvp ?? "—"}`));
  out.append(el("p", {}, `Side A survivors: ${r.survA.join(", ") || "none"}`));
  out.append(el("p", {}, `Side B survivors: ${r.survB.join(", ") || "none"}`));
  const det = el("details", {});
  det.append(el("summary", {}, `Battle log (${r.log.length} actions)`));
  const ol = el("ol", { class: "demo-log" });
  for (const l of r.log) {
    ol.append(el("li", {},
      `R${l.round}: ${l.actor} → ${l.target} via ${l.action} for ${l.damage} dmg${l.crit ? " (CRIT!)" : ""}`
    ));
  }
  det.append(ol);
  out.append(det);
}

function reset() {
  sideA.clear();
  sideB.clear();
  document.getElementById("demo-result").innerHTML = "";
  renderRoster();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("fight-btn").addEventListener("click", fight);
  document.getElementById("reset-btn").addEventListener("click", reset);
  // preset suggestion
  ["homelander", "stormfront"].forEach(id => sideA.add(id));
  ["butcher", "kimiko", "soldier-boy"].forEach(id => sideB.add(id));
  renderRoster();
});
