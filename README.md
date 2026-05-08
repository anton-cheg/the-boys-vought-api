# the-boys-vought-api

Unofficial fan project inspired by **The Boys**. A FastAPI backend simulates fights between Vought supes and The Boys; a React+Vite frontend provides an arena to pick teams and watch the carnage; a static landing page is published via GitHub Pages.

🌐 **Landing page:** https://anton-cheg.github.io/the-boys-vought-api/

## Stack

- **Backend:** FastAPI + Pydantic v2
- **Frontend:** React 18 + Vite + TypeScript
- **Landing:** static HTML/CSS in `docs/`, served by GitHub Pages

## Project layout

```
backend/        FastAPI server (characters + battle simulator)
frontend/       React + Vite SPA — pick teams, run battles
docs/           Static landing page (GitHub Pages root)
```

## Run

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

OpenAPI docs at http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at http://localhost:5173 and talks to the backend on `:8000` by default. Override with `VITE_API_URL`.

## API

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/characters` | List characters (filters: `?faction=`, `?supe=`) |
| GET | `/characters/{id}` | Single character |
| GET | `/factions` | Character ids grouped by faction |
| POST | `/battle` | Simulate a battle between two sides |

```bash
curl -X POST http://localhost:8000/battle \
  -H "content-type: application/json" \
  -d '{"side_a":["homelander","stormfront"],"side_b":["butcher","kimiko","soldier-boy"],"seed":42}'
```

## Disclaimer

Unofficial fan work. Not affiliated with Vought International, Amazon Studios, or Sony Pictures Television. Character names belong to their respective owners.

## License

MIT — see [LICENSE](LICENSE).
