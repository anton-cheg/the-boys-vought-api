# Backend — Boys vs Supes Battle Sim

FastAPI server simulating fights between Vought supes and The Boys.

## Run

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Open: http://localhost:8000/docs

## Endpoints

- `GET /characters` — list all characters (filters: `?faction=seven|boys|vought|neutral`, `?supe=true|false`)
- `GET /characters/{id}` — single character
- `GET /factions` — character ids grouped by faction
- `POST /battle` — simulate a fight

### Battle request

```json
{
  "side_a": ["homelander", "stormfront"],
  "side_b": ["butcher", "kimiko", "soldier-boy"],
  "seed": 42
}
```
