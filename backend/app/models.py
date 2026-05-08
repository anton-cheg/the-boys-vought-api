from pydantic import BaseModel, Field
from typing import Literal

Faction = Literal["seven", "boys", "vought", "neutral"]


class Stats(BaseModel):
    strength: int = Field(ge=0, le=100)
    speed: int = Field(ge=0, le=100)
    durability: int = Field(ge=0, le=100)
    intelligence: int = Field(ge=0, le=100)
    ruthlessness: int = Field(ge=0, le=100)


class Character(BaseModel):
    id: str
    name: str
    alias: str | None = None
    faction: Faction
    is_supe: bool
    powers: list[str]
    stats: Stats
    quote: str | None = None


class BattleRequest(BaseModel):
    side_a: list[str] = Field(min_length=1, max_length=7)
    side_b: list[str] = Field(min_length=1, max_length=7)
    seed: int | None = None


class RoundLog(BaseModel):
    round: int
    actor: str
    target: str
    action: str
    damage: int
    crit: bool


class TeamScore(BaseModel):
    side: Literal["A", "B"]
    members: list[str]
    total_power: int
    survivors: list[str]


class BattleResult(BaseModel):
    winner: Literal["A", "B", "draw"]
    summary: str
    score_a: TeamScore
    score_b: TeamScore
    log: list[RoundLog]
    mvp: str | None
