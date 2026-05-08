import random
from .models import Character, BattleResult, TeamScore, RoundLog


def _power_score(c: Character) -> int:
    s = c.stats
    base = s.strength * 2 + s.durability * 2 + s.speed + s.intelligence + s.ruthlessness
    return base + (40 if c.is_supe else 0)


def _attack_damage(attacker: Character, defender: Character, rng: random.Random) -> tuple[int, bool]:
    raw = attacker.stats.strength + attacker.stats.speed // 2 + attacker.stats.ruthlessness // 3
    defense = defender.stats.durability + defender.stats.speed // 4
    swing = rng.randint(-15, 25)
    crit = rng.random() < (attacker.stats.ruthlessness / 400)
    dmg = max(1, raw - defense + swing)
    if crit:
        dmg *= 2
    return dmg, crit


def simulate(side_a: list[Character], side_b: list[Character], seed: int | None) -> BattleResult:
    rng = random.Random(seed)

    hp_a = {c.id: 80 + c.stats.durability for c in side_a}
    hp_b = {c.id: 80 + c.stats.durability for c in side_b}
    log: list[RoundLog] = []

    round_no = 0
    damage_dealt: dict[str, int] = {}

    while any(v > 0 for v in hp_a.values()) and any(v > 0 for v in hp_b.values()):
        round_no += 1
        if round_no > 60:
            break

        alive_a = [c for c in side_a if hp_a[c.id] > 0]
        alive_b = [c for c in side_b if hp_b[c.id] > 0]

        # Side A attacks
        for attacker in sorted(alive_a, key=lambda c: -c.stats.speed):
            if not [c for c in side_b if hp_b[c.id] > 0]:
                break
            target = rng.choice([c for c in side_b if hp_b[c.id] > 0])
            dmg, crit = _attack_damage(attacker, target, rng)
            hp_b[target.id] = max(0, hp_b[target.id] - dmg)
            damage_dealt[attacker.id] = damage_dealt.get(attacker.id, 0) + dmg
            log.append(RoundLog(
                round=round_no,
                actor=attacker.alias or attacker.name,
                target=target.alias or target.name,
                action=rng.choice(attacker.powers) if attacker.powers else "attacks",
                damage=dmg,
                crit=crit,
            ))

        # Side B attacks
        for attacker in sorted(alive_b, key=lambda c: -c.stats.speed):
            if not [c for c in side_a if hp_a[c.id] > 0]:
                break
            target = rng.choice([c for c in side_a if hp_a[c.id] > 0])
            dmg, crit = _attack_damage(attacker, target, rng)
            hp_a[target.id] = max(0, hp_a[target.id] - dmg)
            damage_dealt[attacker.id] = damage_dealt.get(attacker.id, 0) + dmg
            log.append(RoundLog(
                round=round_no,
                actor=attacker.alias or attacker.name,
                target=target.alias or target.name,
                action=rng.choice(attacker.powers) if attacker.powers else "attacks",
                damage=dmg,
                crit=crit,
            ))

    survivors_a = [c.alias or c.name for c in side_a if hp_a[c.id] > 0]
    survivors_b = [c.alias or c.name for c in side_b if hp_b[c.id] > 0]

    if survivors_a and not survivors_b:
        winner = "A"
    elif survivors_b and not survivors_a:
        winner = "B"
    elif len(survivors_a) > len(survivors_b):
        winner = "A"
    elif len(survivors_b) > len(survivors_a):
        winner = "B"
    else:
        winner = "draw"

    score_a = TeamScore(
        side="A",
        members=[c.alias or c.name for c in side_a],
        total_power=sum(_power_score(c) for c in side_a),
        survivors=survivors_a,
    )
    score_b = TeamScore(
        side="B",
        members=[c.alias or c.name for c in side_b],
        total_power=sum(_power_score(c) for c in side_b),
        survivors=survivors_b,
    )

    mvp_id = max(damage_dealt.items(), key=lambda kv: kv[1])[0] if damage_dealt else None
    mvp_char = next((c for c in side_a + side_b if c.id == mvp_id), None)
    mvp = (mvp_char.alias or mvp_char.name) if mvp_char else None

    if winner == "A":
        summary = f"Side A wins after {round_no} rounds. Survivors: {', '.join(survivors_a)}."
    elif winner == "B":
        summary = f"Side B wins after {round_no} rounds. Survivors: {', '.join(survivors_b)}."
    else:
        summary = f"Draw after {round_no} brutal rounds."

    return BattleResult(
        winner=winner,
        summary=summary,
        score_a=score_a,
        score_b=score_b,
        log=log,
        mvp=mvp,
    )
