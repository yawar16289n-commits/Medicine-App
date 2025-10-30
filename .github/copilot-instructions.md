## Quick context for AI coding agents

This repository is a small two-tier app: a Flask backend (MySQL + SQLAlchemy + Flask-Migrate) and a Vite + React frontend. Changes often touch both sides — the frontend expects specific JSON shapes and endpoints defined in the backend.

Key locations:
- `backend/app.py` — Flask application factory (create_app) and simple runner. CORS is configured here for `http://localhost:5173` and `http://127.0.0.1:3000`.
- `backend/routes.py` — All API routes live here. Important endpoints:
  - `GET  /api/medicines`  -> returns medicines grouped by `formula` (object of arrays).
  - `POST /api/medicines`  -> create medicine (expects camelCase in JSON: `medicineId`, `stockStatus` etc.).
  - `PUT  /api/medicines/<id>` -> update.
  - `DELETE /api/medicines/<id>` -> delete.
  - `POST /api/medicines/upload` -> upload CSV/XLSX. Backend normalizes headers to lowercase and accepts `medicineid` or `medicine_id`.
- `backend/models.py` — SQLAlchemy `Medicine` model. Note DB columns use snake_case (e.g., `medicine_id`) but `to_dict()` converts to camelCase for the API.
- `backend/database.py` — SQLAlchemy `db` instance used across models/routes.
- `backend/migrations/` — Flask-Migrate/Alembic migration scripts.
- `Frontend/` — Vite + React app. Entry: `Frontend/src/main.jsx`, root `Frontend/src/App.jsx`. Components under `Frontend/src/components/`.

Important project-specific conventions and gotchas
- JSON shape: frontend expects API responses to use camelCase keys (e.g., `medicineId`, `stockStatus`). Backend model fields are snake_case; do not change `to_dict()` behavior without updating the frontend.
- GET `/api/medicines` returns a grouped object keyed by `formula`. The frontend currently flattens it with `Object.values(res.data).flat()` in `App.jsx`; be careful when modifying grouping logic.
- CSV/Excel upload: backend lowercases CSV headers before lookup. It tolerates `medicineid` or `medicine_id` and `stockstatus` or `stock_status`. The frontend `FileUpload.jsx` posts multipart/form-data to `/api/medicines/upload` and shows the expected required columns in the UI.
- DB and env: `backend/app.py` constructs a MySQL URI from env vars `DB_USERNAME`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`. Defaults assume local MySQL with empty password and DB name `medicines_db`.

Developer workflows (how to run & migrate)
- Backend (Windows PowerShell):
  1. Install: `python -m pip install -r backend/requirements.txt`
  2. Run app directly for development: `python backend/app.py` (app runs on port 5000 by default).
  3. Flask-Migrate (use when running migrations):
     - In PowerShell: `$env:FLASK_APP = "backend.app:create_app"`;
     - Then run: `flask db migrate -m "msg"` and `flask db upgrade`.
     - Notes: `migrations/` already exists; if you need to regenerate migrations ensure the `FLASK_APP` env points to the factory.

- Frontend (inside `Frontend`):
  1. Install: `npm install` or `pnpm install` depending on your package manager.
  2. Dev server: `npm run dev` (Vite default port 5173). Scripts are in `Frontend/package.json`.
  3. Build: `npm run build` and preview with `npm run preview`.

Integration & testing tips for agents
- Keep API URLs in sync: `App.jsx` uses `http://127.0.0.1:5000/api/medicines`. If you change backend host/port, update that string or refactor to a single config.
- When editing the model or API payloads, update both `models.py` and `to_dict()` and search `Frontend/src` for any assumed keys (notably `medicineId`, `stockStatus`, `formula`).
- CSV import behavior is forgiving but relies on column names; if you add new import fields, update both `routes.py` (upload parsing) and `FileUpload.jsx` (UI hints).
- Use the existing migrations folder — prefer Alembic/Flask-Migrate commands over manual SQL changes.

Files to inspect when making changes
- Backend: `backend/app.py`, `backend/routes.py`, `backend/models.py`, `backend/database.py`, `backend/migrations/`
- Frontend: `Frontend/src/App.jsx`, `Frontend/src/components/FileUpload.jsx`, `Frontend/src/components/MedicineForm.jsx`, `Frontend/src/components/MedicineTable.jsx`

What NOT to change without coordination
- The JSON key naming contract (camelCase in API responses) — changing it requires frontend updates.
- The `GET /api/medicines` grouped output shape — frontend relies on flattening behavior.

If you need clarification
- Ask about which side (backend vs frontend) should own a change. If unsure, prefer backward-compatible changes (keep old keys until frontend is updated).

-- End of instructions. Please point out anything missing or ambiguous and I will iterate.
