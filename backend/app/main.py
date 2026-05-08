from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .data import CHARACTERS, BY_ID
from .models import BattleRequest, BattleResult, Character
from .battle import simulate

app = FastAPI(
    title="Boys vs Supes Battle Sim",
    description="Unofficial fan API simulating fights between Vought supes and The Boys.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "name": "Boys vs Supes Battle Sim",
        "docs": "/docs",
        "endpoints": ["/characters", "/characters/{id}", "/battle", "/factions"],
    }


@app.get("/characters", response_model=list[Character])
def list_characters(faction: str | None = None, supe: bool | None = None):
    items = CHARACTERS
    if faction is not None:
        items = [c for c in items if c.faction == faction]
    if supe is not None:
        items = [c for c in items if c.is_supe == supe]
    return items


@app.get("/characters/{character_id}", response_model=Character)
def get_character(character_id: str):
    c = BY_ID.get(character_id)
    if not c:
        raise HTTPException(status_code=404, detail=f"Character '{character_id}' not found")
    return c


@app.get("/factions")
def list_factions():
    factions: dict[str, list[str]] = {}
    for c in CHARACTERS:
        factions.setdefault(c.faction, []).append(c.id)
    return factions


@app.post("/battle", response_model=BattleResult)
def battle(req: BattleRequest):
    try:
        side_a = [BY_ID[i] for i in req.side_a]
        side_b = [BY_ID[i] for i in req.side_b]
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Unknown character id: {e.args[0]}")

    overlap = set(req.side_a) & set(req.side_b)
    if overlap:
        raise HTTPException(status_code=400, detail=f"Character(s) on both sides: {sorted(overlap)}")

    return simulate(side_a, side_b, req.seed)
